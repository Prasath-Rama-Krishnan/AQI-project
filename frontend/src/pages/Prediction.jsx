import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadDataset } from "../services/api";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import CustomTick from "../components/CustomTick";
import CustomTooltip from "../components/CustomTooltip";
import "./Prediction.css";

export default function Prediction() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [predictedAvailable, setPredictedAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [parsedResults, setParsedResults] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "info" }), 4000);
  };

  const handleUpload = async () => {
    if (!file) return showToast("Upload CSV first", "error");

    try {
      setLoading(true);
      showToast("Running prediction...", "info");
      await uploadDataset(file);
      showToast("Prediction complete.", "success");

      // confirm predicted file exists
      const res = await fetch("http://localhost:5000/api/predict/download");
      if (res.ok) {
        setPredictedAvailable(true);
        // redirect to dashboard for visualization
        navigate("/dashboard");
      } else {
        showToast("Prediction finished but no predicted file found.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Prediction failed. Check console.", "error");
    } finally {
      setLoading(false);
    }
  };

  const [resultsState, setResultsState] = useState('All');
  const [resultsMonth, setResultsMonth] = useState('All');
  const [resultsFiltered, setResultsFiltered] = useState([]);
  const [resultsAreaData, setResultsAreaData] = useState([]);
  const [resultsTopPollutant, setResultsTopPollutant] = useState(null);
  const [resultsPurifier, setResultsPurifier] = useState(null);

  const downloadPredicted = async () => {
    const res = await fetch("http://localhost:5000/api/predict/download");
    if (!res.ok) return showToast("No predicted file yet", "error");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "predicted.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    showToast("Download started", "info");
  };

  const loadPredictedData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/predict/download");
      if (!res.ok) return showToast("No predicted file yet", "error");
      const txt = await res.text();
      const parsed = Papa.parse(txt, { header: true, skipEmptyLines: true });
      const rows = parsed.data.map(r => ({ ...r, aqi_value: Number(r.aqi_value || 0), date: r.date, month: r.date ? new Date(r.date).getMonth() : null }));
      setParsedResults(rows);
      showToast("Predicted data loaded", "info");
    } catch (err) {
      console.error(err);
      showToast("Failed to load predicted data", "error");
    }
  };

  useEffect(()=>{
    if (!parsedResults) {
      setResultsFiltered([]);
      setResultsAreaData([]);
      setResultsTopPollutant(null);
      setResultsPurifier(null);
      return;
    }

    let data = [...parsedResults];
    if (resultsState !== 'All') data = data.filter(d => d.state === resultsState);
    if (resultsMonth !== 'All') data = data.filter(d => d.month === Number(resultsMonth));
    setResultsFiltered(data);

    const areaMap = {};
    data.forEach(d => { if (!areaMap[d.area]) areaMap[d.area] = { sum:0, count:0, area: d.area }; areaMap[d.area].sum += d.aqi_value; areaMap[d.area].count++; });
    const areaData = Object.values(areaMap).map(a=>({ area: a.area, avgAQI: Math.round(a.sum/a.count) }));
    setResultsAreaData(areaData);

    const counts = {};
    data.forEach(d => {
      (d.prominent_pollutants || d.prominent_pollutant || '').split(',').map(s=>s.trim()).filter(Boolean).forEach(p => counts[p] = (counts[p]||0) + 1);
    });
    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
    const topPollutant = top ? top[0] : null;
    setResultsTopPollutant(topPollutant);

    const purifierMap = {
      'PM2.5': 'Use HEPA-grade air purifiers (True HEPA) and control indoor sources.',
      'PM10': 'Use HEPA-grade air purifiers and regular cleaning to reduce dust.',
      'NO2': 'Reduce vehicle emissions; consider activated carbon filters for gases indoors.',
      'SO2': 'Reduce industrial SO2 emissions; use activated carbon filters indoors.',
      'O3': 'Avoid producing ozone indoors. Mechanical filtration helps little for O3; ensure ventilation and control sources.',
      'CO': 'Address combustion sources and use CO detectors; activated carbon can help some VOCs.'
    };
    setResultsPurifier(topPollutant ? (purifierMap[topPollutant] || 'Maintain ventilation and use appropriate filters') : null);
  }, [parsedResults, resultsState, resultsMonth]);

  const monthOptions = parsedResults ? ['All', ...Array.from(new Set(parsedResults.map(r=>r.month))).filter(m => m !== null).sort((a,b)=>a-b)] : ['All'];

  return (
    <div className="prediction-container">
      <div className="pred-hero">
        <div className="pred-hero-inner">
          <h1>Upload Dataset for AQI Prediction</h1>
          <p>Upload your dataset (CSV) to generate AQI predictions and automated insights.</p>
        </div>
      </div>

      <div className="pred-tabs">
        <button className={activeTab==='upload' ? 'tab active' : 'tab'} onClick={()=>setActiveTab('upload')}>Upload Data</button>
        <button className={predictedAvailable ? (activeTab==='results' ? 'tab active' : 'tab') : 'tab disabled'} onClick={()=>{ if(predictedAvailable) setActiveTab('results'); }}>Results & Analysis</button>
      </div>

      {activeTab === 'upload' && (
        <div className="upload-card">
          <div className="upload-icon">⬆️</div>
          <h3>Upload Dataset</h3>
          <p>CSV with columns: <code>date, state, area, aqi_value</code></p>

          <div className="file-input-wrap">
            <input id="file" type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
          </div>

          <div className="actions">
            <button className="primary" onClick={handleUpload} disabled={!file || loading}>Predict</button>
            <button className="muted" onClick={()=>{ setFile(null); document.getElementById('file').value=''; }}>Clear</button>
          </div>

          {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />}

          {predictedAvailable && (
            <div className="result-actions">
              <button onClick={() => { navigate('/dashboard'); }} className="outline">View Prediction</button>
              <button onClick={downloadPredicted} className="outline">Download Predicted CSV</button>
              <button className="outline" onClick={() => { setPreviewOpen(true); fetch('http://localhost:5000/api/predict/download').then(r=>r.text()).then(t=>setPreviewData(t)).catch(()=>setPreviewData(null)) }}>Preview CSV</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="results-card">
          <h3>Prediction Results</h3>
          {!parsedResults ? (
            <div style={{padding:12}}>
              <p>No predicted data loaded yet. Use the <strong>Preview CSV</strong> or <strong>Download Predicted CSV</strong> action above, or click the button below to load it for analysis.</p>
              <div style={{display:'flex', gap:8, justifyContent:'center', marginTop:8}}>
                <button className="outline" onClick={loadPredictedData}>Load Predicted Data</button>
              </div>
            </div>
          ) : (
            <div>
              {/* Filters */}
              <div className="results-filters" style={{display:'flex', gap:12, justifyContent:'center', marginTop:6}}>
                <div>
                  <label>State:</label>
                  <select onChange={e=>setResultsState(e.target.value)} value={resultsState}>
                    {['All', ...Array.from(new Set(parsedResults.map(r=>r.state))).filter(Boolean)].map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label>Month:</label>
                  <select onChange={e=>setResultsMonth(e.target.value)} value={resultsMonth}>
                    {monthOptions.map(m => (
                      <option key={String(m)} value={String(m)}>{m === 'All' ? 'All' : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* KPIs and suggestions */}
              <div className="results-kpis" style={{display:'flex', gap:12, justifyContent:'center', marginTop:12}}>
                <div className="kpi">Avg AQI<br/>{resultsFiltered.length ? Math.round(resultsFiltered.reduce((s,d)=>s+d.aqi_value,0)/resultsFiltered.length) : '-'}</div>
                <div className="kpi">Max AQI<br/>{resultsFiltered.length ? Math.max(...resultsFiltered.map(d=>d.aqi_value)) : '-'}</div>
                <div className="kpi">Prominent Pollutant<br/>{resultsTopPollutant || '-'}</div>
                <div className="kpi">Purifier Suggestion<br/><small style={{fontSize:11, display:'block', maxWidth:220, margin:'6px auto 0'}}>{resultsPurifier || '-'}</small></div>
              </div>

              {/* Chart */}
              <div style={{marginTop:12}}>
                <BarChart width={800} height={280} data={resultsAreaData} {...{isAnimationActive:true}}>
                  <XAxis dataKey="area" tick={<CustomTick />} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip/>} />
                  <Bar dataKey="avgAQI" fill="#3b82f6"/>
                </BarChart>
              </div>

            </div>
          )}
        </div>
      )}

      <p className="hint">Tip: your CSV should include columns: <code>date, state, area, aqi_value</code></p>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <div className="loading-text">Processing prediction...</div>
        </div>
      )}

      <Modal open={previewOpen} title="Predicted CSV Preview" onClose={() => setPreviewOpen(false)}>
        {previewData ? (
          <pre style={{whiteSpace:'pre-wrap',fontSize:12}}>{previewData}</pre>
        ) : (
          <p>No preview available</p>
        )}
      </Modal>
    </div>
  );
}
