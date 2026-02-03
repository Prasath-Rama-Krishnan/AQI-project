const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Helper to run python script with CSV content on stdin
function runPythonWithCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const python = spawn("python", ["python/predict_aqi.py"]);

    let output = "";

    python.stdout.on("data", (data) => (output += data.toString()));
    python.stderr.on("data", (err) => console.error("Python error:", err.toString()));

    python.on("close", (code) => {
      try {
        const json = JSON.parse(output);
        resolve(json);
      } catch (err) {
        reject(new Error("Invalid python output: " + err.message));
      }
    });

    python.stdin.write(buffer);
    python.stdin.end();
  });
}

// Convert JSON array -> CSV string
function jsonToCsv(arr) {
  if (!arr || !arr.length) return "";
  const keys = Object.keys(arr[0]);
  const header = keys.join(",") + "\n";
  const rows = arr.map(r => keys.map(k => String(r[k]).replace(/\"/g, '"')).join(",")).join("\n");
  return header + rows;
}

// Upload file (multipart) and run prediction
exports.uploadAndPredict = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const buf = req.file.buffer;

    const results = await runPythonWithCSVBuffer(buf);

    const csv = jsonToCsv(results);
    const outPath = path.resolve(__dirname, "../temp/predicted.csv");
    fs.writeFileSync(outPath, csv);

    res.json({ success: true, rows: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Run prediction on a sample CSV file in temp folder
exports.runPredictionOnSample = async (req, res) => {
  try {
    const name = req.params.name; // expected e.g. aqi.csv or aqi2026n.csv
    const samplePath = path.resolve(__dirname, "../temp", name);
    if (!fs.existsSync(samplePath)) return res.status(404).json({ error: "Sample not found" });

    const buf = fs.readFileSync(samplePath);
    const results = await runPythonWithCSVBuffer(buf);

    const csv = jsonToCsv(results);
    const outPath = path.resolve(__dirname, "../temp/predicted.csv");
    fs.writeFileSync(outPath, csv);

    res.json({ success: true, rows: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Download predicted CSV
exports.downloadPredicted = (req, res) => {
  const outPath = path.resolve(__dirname, "../temp/predicted.csv");
  if (!fs.existsSync(outPath)) {
    return res.status(404).json({ error: "No predicted file available" });
  }
  res.sendFile(outPath);
};

// Simple insights from predicted CSV
exports.getInsights = (req, res) => {
  try {
    const outPath = path.resolve(__dirname, "../temp/predicted.csv");
    const sourcePath = fs.existsSync(outPath)
      ? outPath
      : path.resolve(__dirname, "../temp/aqi2026n.csv");

    const csv = fs.readFileSync(sourcePath, "utf8");
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const header = lines.shift().split(",");

    const data = lines.map(line => {
      const parts = line.split(",");
      const obj = {};
      header.forEach((h, i) => (obj[h] = parts[i]));
      obj.aqi_value = Number(obj.aqi_value || 0);
      return obj;
    });

    const avgAQI = Math.round(data.reduce((s, d) => s + d.aqi_value, 0) / data.length || 0);
    const poorSevere = data.filter(d => d.air_quality_status === "Poor" || d.air_quality_status === "Severe").length;
    const percentPoorSevere = Math.round((poorSevere / data.length) * 100 || 0);

    // top states by avg AQI
    const stateMap = {};
    data.forEach(d => {
      if (!stateMap[d.state]) stateMap[d.state] = { sum: 0, count: 0 };
      stateMap[d.state].sum += d.aqi_value;
      stateMap[d.state].count++;
    });
    const topStates = Object.entries(stateMap)
      .map(([state, v]) => ({ state, avg: Math.round(v.sum / v.count) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    const suggestion = avgAQI > 150
      ? "High pollution detected. Recommend implementing temporary traffic restrictions, promoting public transport, and issuing public health advisories."
      : avgAQI > 100
      ? "Moderate pollution levels. Consider limiting industrial emissions and encouraging remote working on high AQI days."
      : "Air quality is generally good. Maintain monitoring and control measures to prevent deterioration.";

    // if 'enrich' query param provided, add extra steps (simulated external API enrichment)
    const enrich = req.query.enrich === '1' || req.query.enrich === 'true';
    const externalSuggestion = enrich
      ? suggestion + " Suggested actions (detailed): 1) Issue public advisories and recommend masks; 2) Limit heavy vehicle ingress; 3) Monitor factories and enforce emission controls; 4) Provide temporary air purifiers in schools and hospitals."
      : null;

    // compute prominent pollutants per state
    const statePollutants = {};
    data.forEach(d => {
      const state = d.state || 'Unknown';
      const pollutants = (d.prominent_pollutants || '').split(',').map(s=>s.trim()).filter(Boolean);
      if (!statePollutants[state]) statePollutants[state] = {};
      pollutants.forEach(p => statePollutants[state][p] = (statePollutants[state][p] || 0) + 1);
    });

    // map pollutant -> purifier suggestion
    const purifierMap = {
      'PM2.5': 'Use HEPA-grade air purifiers (True HEPA) and control indoor sources.',
      'PM10': 'Use HEPA-grade air purifiers and regular cleaning to reduce dust.',
      'NO2': 'Reduce vehicle emissions; consider activated carbon filters for gases indoors.',
      'SO2': 'Reduce industrial SO2 emissions; use activated carbon filters indoors.',
      'O3': 'Avoid producing ozone indoors. Mechanical filtration helps little for O3; ensure ventilation and control sources.',
      'CO': 'Address combustion sources and use CO detectors; activated carbon can help some VOCs.'
    };

    // build state-wise pollutant summary and suggestion
    const stateSummaries = Object.entries(statePollutants).map(([state, map]) => {
      const list = Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({ pollutant:k, count:v }));
      const top = list[0] ? list[0].pollutant : null;
      return {
        state,
        topPollutants: list.slice(0,5),
        purifierSuggestion: top ? (purifierMap[top] || 'Maintain ventilation and use appropriate filters') : 'No data'
      };
    });

    res.json({ avgAQI, percentPoorSevere, topStates, suggestion, externalSuggestion, stateSummaries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
