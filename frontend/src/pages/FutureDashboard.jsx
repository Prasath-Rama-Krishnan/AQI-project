import { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";
import { API_ENDPOINTS } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./Dashboard.css";
import CustomTick from "../components/CustomTick";
import CustomTooltip from "../components/CustomTooltip";

const MONTHS = [
  "All",
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function FutureDashboard() {
  const [rawFuture, setRawFuture] = useState([]);
  const [rawHistorical, setRawHistorical] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");

  const [pastAvg, setPastAvg] = useState(null);

  /* ================= LOAD HISTORICAL CSV (for past year comparison) ================= */
  useEffect(() => {
    fetch(API_ENDPOINTS.historical || '/api/predict/historical')
      .then(res => res.text())
      .then(csv => {
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
        const data = parsed.data.map(d => ({
          ...d,
          aqi_value: Number(d.aqi_value),
          date: new Date(d.date),
          month: new Date(d.date).toLocaleString("default", { month: "long" })
        }));
        setRawHistorical(data);
      })
      .catch(err => console.warn("Historical data not available:", err));
  }, []);

  /* ================= LOAD PREDICTED CSV (for future months) ================= */
  useEffect(() => {
    fetch(API_ENDPOINTS.download)
      .then(res => res.text())
      .then(csv => {
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });

        const data = parsed.data.map(d => ({
          ...d,
          aqi_value: Number(d.aqi_value),
          date: new Date(d.date),
          month: new Date(d.date).toLocaleString("default", { month: "long" })
        }));

        setRawFuture(data);
        setStates(["All", ...new Set([...data, ...rawHistorical].map(d => d.state))]);
      })
      .catch(err => console.error("Failed to load predicted data:", err));
  }, []);

  /* ================= LOAD PAST DATA (AVG ONLY) ================= */
  useEffect(() => {
    fetch("/past_aqi_sample.csv") // optional static file
      .then(res => res.text())
      .then(csv => {
        const parsed = Papa.parse(csv, { header: true });
        const avg =
          parsed.data.reduce((s, d) => s + Number(d.aqi_value || 0), 0) /
          parsed.data.length;
        setPastAvg(Math.round(avg));
      })
      .catch(() => setPastAvg(null));
  }, []);

  const [insights, setInsights] = useState(null);

  useEffect(()=>{
    // request enriched suggestions from server
    fetch(`${API_ENDPOINTS.insights}?enrich=1`)
      .then(r=>r.json())
      .then(setInsights)
      .catch(()=>setInsights(null));
  },[]);

  // compute overall prominent pollutant and purifier suggestion (used when State = All)
  const overallProminent = (() => {
    if (!insights) return null;
    // count pollutants across stateSummaries
    const counts = {};
    (insights.stateSummaries || []).forEach(s => {
      (s.topPollutants || []).forEach(p => { counts[p.pollutant] = (counts[p.pollutant] || 0) + 1; });
    });
    const items = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    return items[0] ? items[0][0] : null;
  })();

  const overallPurifier = (() => {
    if (!overallProminent) return null;
    const map = {
      'PM2.5': 'Use HEPA-grade air purifiers (True HEPA) and control indoor sources.',
      'PM10': 'Use HEPA-grade air purifiers and regular cleaning to reduce dust.',
      'NO2': 'Reduce vehicle emissions; consider activated carbon filters for gases indoors.',
      'SO2': 'Reduce industrial SO2 emissions; use activated carbon filters indoors.',
      'O3': 'Avoid producing ozone indoors. Mechanical filtration helps little for O3; ensure ventilation and control sources.',
      'CO': 'Address combustion sources and use CO detectors; activated carbon can help some VOCs.'
    };
    return map[overallProminent] || 'Maintain ventilation and use appropriate filters';
  })();
  // month-year aggregation helper removed (not used)

  /* CustomTick moved to src/components/CustomTick.jsx */

  const monthlyComparison = () => {
    // Merge historical and predicted data
    const allData = [...rawHistorical, ...rawFuture];

    // Get current and last year
    const thisYear = new Date().getFullYear();
    const lastYear = thisYear - 1;

    // Filter data by year
    const thisYearData = allData.filter(d => new Date(d.date).getFullYear() === thisYear);
    const lastYearData = allData.filter(d => new Date(d.date).getFullYear() === lastYear);
    const priorYearsData = allData.filter(d => new Date(d.date).getFullYear() < thisYear);

    const makeMonthMap = (arr) => {
      const map = {};
      arr.forEach(d => {
        const m = new Date(d.date).getMonth();
        if (!map[m]) map[m] = { sum: 0, count: 0 };
        map[m].sum += d.aqi_value;
        map[m].count++;
      });
      return map;
    };

    const thisYearMap = makeMonthMap(thisYearData);
    const lastYearMap = makeMonthMap(lastYearData);
    const priorYearsMap = makeMonthMap(priorYearsData);

    // Build monthly comparison array with LY fallback using prior years' month averages
    const comparison = [];
    for (let i = 0; i < 12; i++) {
      const thisAvg = thisYearMap[i] ? Math.round(thisYearMap[i].sum / thisYearMap[i].count) : 0;

      let lastAvg = 0;
      let usedFallback = false;
      if (lastYearMap[i]) {
        lastAvg = Math.round(lastYearMap[i].sum / lastYearMap[i].count);
      } else if (priorYearsMap[i]) {
        // Fallback: use average of the same month across any prior years available
        lastAvg = Math.round(priorYearsMap[i].sum / priorYearsMap[i].count);
        usedFallback = true;
      }

      comparison.push({
        month: i,
        monthName: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
        thisYearAvg: thisAvg,
        lastYearAvg: lastAvg,
        lastYearFallback: usedFallback
      });
    }

    return comparison;
  };

  const monthCompare = monthlyComparison();

  /* ================= APPLY FILTERS ================= */
  const filteredData = useMemo(() => {
    let data = [...rawFuture, ...rawHistorical]; // Merge both datasets

    if (selectedState !== "All") data = data.filter(d => d.state === selectedState);
    if (selectedMonth !== "All") data = data.filter(d => d.month === selectedMonth);

    return data;
  }, [selectedState, selectedMonth, rawFuture, rawHistorical]);

  if (!filteredData.length) return <p className="page">Loading dashboard...</p>;

  // animations and improved chart props
  const chartAnim = { isAnimationActive: true, animationDuration: 900 };

  /* ================= KPIs ================= */
  const avgAQI = Math.round(
    filteredData.reduce((s, d) => s + d.aqi_value, 0) / filteredData.length
  );
  const maxAQI = Math.max(...filteredData.map(d => d.aqi_value));

  const poorSevere = filteredData.filter(
    d => d.air_quality_status === "Poor" || d.air_quality_status === "Severe"
  ).length;

  const goodDays = filteredData.filter(d => d.air_quality_status === "Good").length;

  /* ================= CATEGORY ================= */
  const categoryMap = {};
  filteredData.forEach(d => {
    categoryMap[d.air_quality_status] =
      (categoryMap[d.air_quality_status] || 0) + 1;
  });

  const pieData = Object.entries(categoryMap).map(([k, v]) => ({
    name: k, value: v
  }));

  /* ================= AREA ================= */
  const areaMap = {};
  filteredData.forEach(d => {
    if (!areaMap[d.area]) areaMap[d.area] = { sum: 0, count: 0 };
    areaMap[d.area].sum += d.aqi_value;
    areaMap[d.area].count++;
  });

  const areaData = Object.entries(areaMap).map(([area, v]) => ({
    area,
    avgAQI: Math.round(v.sum / v.count)
  }));

  // compute prominent pollutant + purifier suggestion for current filtered selection
  const pollutantCounts = {};
  filteredData.forEach(d => {
    (d.prominent_pollutants || d.prominent_pollutant || '').split(',').map(s=>s.trim()).filter(Boolean).forEach(p => pollutantCounts[p] = (pollutantCounts[p]||0) + 1);
  });
  const dynamicTop = Object.entries(pollutantCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
  const purifierMap = {
    'PM2.5': 'Use HEPA-grade air purifiers (True HEPA) and control indoor sources.',
    'PM10': 'Use HEPA-grade air purifiers and regular cleaning to reduce dust.',
    'NO2': 'Reduce vehicle emissions; consider activated carbon filters for gases indoors.',
    'SO2': 'Reduce industrial SO2 emissions; use activated carbon filters indoors.',
    'O3': 'Avoid producing ozone indoors. Mechanical filtration helps little for O3; ensure ventilation and control sources.',
    'CO': 'Address combustion sources and use CO detectors; activated carbon can help some VOCs.'
  };

  // final suggestion values with fallbacks to insights / overall
  const suggestionPollutant = dynamicTop
    || (selectedState !== 'All' ? insights?.stateSummaries?.find(s=>s.state===selectedState)?.topPollutants?.[0]?.pollutant : null)
    || (selectedMonth !== 'All' ? insights?.monthSummaries?.find(m=>m.month===selectedMonth)?.topPollutants?.[0]?.pollutant : null)
    || overallProminent;
  const suggestionPurifier = suggestionPollutant
    ? (purifierMap[suggestionPollutant] || 'Maintain ventilation and use appropriate filters')
    : (selectedState === 'All' ? overallPurifier : (insights?.stateSummaries?.find(s=>s.state===selectedState)?.purifierSuggestion))
    || overallPurifier || insights?.suggestion || null;

  const sortedAreas = [...areaData].sort((a,b)=>b.avgAQI-a.avgAQI);
  const top5 = sortedAreas.slice(0,5);
  const bottom5 = sortedAreas.slice(-5).reverse();
  const maxAvg = Math.max(...sortedAreas.map(a=>a.avgAQI)) || 1;

  /* ================= TREND ================= */
  const trend = [...filteredData]
    .sort((a,b)=> new Date(a.date) - new Date(b.date))
    .map(d => ({ date: new Date(d.date).toLocaleDateString(), AQI: d.aqi_value }));

  const generateReportHtml = () => {
    const topRows = top5.map(a => `<tr><td>${a.area}</td><td>${a.avgAQI}</td></tr>`).join('');
    const bottomRows = bottom5.map(a => `<tr><td>${a.area}</td><td>${a.avgAQI}</td></tr>`).join('');

    const insightsHtml = insights ? `
      <h4>Insights</h4>
      <p><strong>Avg AQI:</strong> ${insights.avgAQI}</p>
      <p><strong>% Poor/Severe days:</strong> ${insights.percentPoorSevere}%</p>
      <p><strong>Most affected states:</strong> ${insights.topStates.map(s=>s.state + ` (${s.avg})`).join(', ')}</p>
      <blockquote>${insights.externalSuggestion || insights.suggestion}</blockquote>
    ` : '<p>No insights available</p>';

    return `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>AQI Report</title>
        <style>
          body{font-family:Arial,Helvetica,sans-serif;background:#0b1520;color:#e6f0f6;padding:20px}
          h1{color:#bfefff}
          table{width:100%;border-collapse:collapse;margin-top:12px}
          td,th{padding:8px;border:1px solid rgba(255,255,255,0.04)}
          .kpi{display:inline-block;padding:8px 12px;background:rgba(255,255,255,0.02);margin-right:8px;border-radius:6px}
        </style>
      </head>
      <body>
        <h1>AQI Report — Generated</h1>
        <div class="kpi">Avg AQI: ${avgAQI}</div>
        <div class="kpi">Max AQI: ${maxAQI}</div>
        <div class="kpi">Days: ${filteredData.length}</div>

        <h3>Top 5 Polluted Areas</h3>
        <table><thead><tr><th>Area</th><th>Avg AQI</th></tr></thead><tbody>${topRows}</tbody></table>

        <h3>Bottom 5 Cleanest Areas</h3>
        <table><thead><tr><th>Area</th><th>Avg AQI</th></tr></thead><tbody>${bottomRows}</tbody></table>

        ${insightsHtml}
      </body>
      </html>`;
  }

  const downloadReport = () => {
    const html = generateReportHtml();
    const b = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url; a.download = 'aqi_report.html'; a.click(); URL.revokeObjectURL(url);
  }

  const viewReport = () => {
    const html = generateReportHtml();
    const b = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(b);
    window.open(url, '_blank');
  }

  return (
    <div className="page">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1>Future AQI Dashboard (Prediction)</h1>
      </div>

      {/* FILTERS */}
      <div className="filter-row">
        <div>
          <label>State:</label>
          <select value={selectedState} onChange={e=>setSelectedState(e.target.value)}>
            {states.map(s=> <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label>Month:</label>
          <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)}>
            {MONTHS.map(m=> <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi">Avg AQI<br/>{avgAQI}</div>
        <div className="kpi">Max AQI<br/>{maxAQI}</div>
        <div className="kpi">Days<br/>{filteredData.length}</div>
        <div className="kpi">Poor + Severe<br/>{filteredData.length ? Math.round((poorSevere/filteredData.length)*100) : 0}%</div>
        <div className="kpi">Good Days<br/>{filteredData.length ? Math.round((goodDays/filteredData.length)*100) : 0}%</div>
        {/* pollutant & purifier cards removed; suggestions relocated to insights area below */}
      </div>

      {/* PAST VS FUTURE */}
      {pastAvg && (
        <>
          <h3>Past vs Future AQI Comparison</h3>
          <BarChart width={500} height={250} data={[
            { name:"Past Avg", AQI: pastAvg },
            { name:"Future Avg", AQI: avgAQI }
          ]} {...chartAnim}>
            <XAxis dataKey="name" tick={<CustomTick />} />
            <YAxis/>
            <Tooltip/>
            <Bar dataKey="AQI" fill="#06b6d4"/>
          </BarChart>
        </>
      )}

      {/* TREND */}
      <h3>AQI Trend</h3>
      <LineChart width={1000} height={300} data={trend} {...chartAnim}>
        <XAxis dataKey="date" tick={<CustomTick />} />
        <YAxis tick={{fill:'#e6f0f6'}}/>
        <Tooltip content={<CustomTooltip/>} />        <Line dataKey="AQI" stroke="#06b6d4" dot={false} isAnimationActive={true} animationDuration={900}/>
      </LineChart>      {/* MONTH-WISE COMPARISON (CY vs LY) */}
      <h3>Monthly Comparison (Current Year vs Last Year)</h3>
      <div className="card">
        <BarChart width={1000} height={300} data={monthCompare} {...chartAnim}>
          <XAxis dataKey="month" tick={<CustomTick formatter={(m)=>["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m]} />} />
          <YAxis tick={{fill:'#e6f0f6'}}/>
          <Tooltip content={<CustomTooltip/>} />
          {/* bars share a stackId to appear stacked rather than side-by-side */}
          <Bar dataKey="thisYearAvg" fill="#06b6d4" name="This Year" stackId="a" />
          <Bar dataKey="lastYearAvg" fill="#8b5cf6" name="Last Year" stackId="a" />
        </BarChart>

        {/* REPORTS */}
        <div className="report-section" style={{marginTop:16}}>
          <div className="report-card">
            <h4>Reports & Predictions</h4>
            <p>Download or view the latest predicted dataset and consolidated AQI report.</p>
            <div className="report-buttons" style={{marginTop:8}}>
              <button className="outline" onClick={async()=>{ const r=await fetch(API_ENDPOINTS.download); if(!r.ok) return alert('No predicted file'); const b=await r.blob(); const u=URL.createObjectURL(b); const aEl=document.createElement('a'); aEl.href=u; aEl.download='predicted.csv'; aEl.click(); URL.revokeObjectURL(u); }}>Download Predicted CSV</button>
              <button className="outline" onClick={async()=>{ const r=await fetch(API_ENDPOINTS.download); if(!r.ok) return alert('No predicted file'); const txt=await r.text(); const blob=new Blob([txt],{type:'text/csv'}); const url=URL.createObjectURL(blob); window.open(url,'_blank'); }}>View Predicted CSV</button>
              <button className="primary" onClick={downloadReport}>Download Report</button>
              <button className="outline" onClick={viewReport}>View Report</button>
            </div>
          </div>
        </div>
      </div>

      {/* AREA */}
      <h3>Area-wise Avg AQI</h3>
      <div className="card">
        <BarChart width={1000} height={300} data={areaData} {...chartAnim}>
          <XAxis dataKey="area" tick={<CustomTick />} />
          <YAxis tick={{fill:'#e6f0f6'}}/>
          <Tooltip content={<CustomTooltip/>} />
          <Bar dataKey="avgAQI" fill="#3b82f6"/>
        </BarChart>
        <div className="report-buttons" style={{marginTop:10}}>
          <button className="outline" onClick={()=>{ const csv = areaData.map(a=>`${a.area},${a.avgAQI}`).join('\n'); const b=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(b); const aEl=document.createElement('a'); aEl.href=url; aEl.download='area_avg.csv'; aEl.click(); URL.revokeObjectURL(url); }}>Download Area CSV</button>
          <button className="outline" onClick={()=>{ const csv = areaData.map(a=>`${a.area},${a.avgAQI}`).join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); window.open(url,'_blank'); URL.revokeObjectURL(url); }}>View Area CSV</button>
        </div>
      </div>

      {/* CATEGORY */}
      <h3>AQI Category Distribution</h3>
      <div className="card" style={{display:'flex', gap:18, alignItems:'center'}}>
        <PieChart width={400} height={300} {...chartAnim}>
          <Pie data={pieData} dataKey="value" nameKey="name" label>
            {pieData.map((_,i)=>{ const colors = ["#06b6d4","#3b82f6","#8b5cf6","#f97316","#ef4444"] ; return <Cell key={i} fill={colors[i % colors.length]} /> })}
          </Pie>
        </PieChart>
        <div style={{flex:1}}>
          {pieData.map((d,i)=> (
            <div key={d.name} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 8px'}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div style={{width:14, height:14, borderRadius:3, background:["#06b6d4","#3b82f6","#8b5cf6","#f97316","#ef4444"][i % 5]}}></div>
                <strong>{d.name}</strong>
              </div>
              <span>{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="top-bottom-grid">
        <div className="card top-list">
          <h3>Top 5 Polluted Areas</h3>
          <div className="list">
            {top5.map((a, idx)=> (
              <div className="list-row" key={a.area}>
                <div className="rank">{idx+1}</div>
                <div className="area-name">{a.area}</div>
                <div className="bar-wrap"><div className="bar" style={{width:`${(a.avgAQI/maxAvg)*100}%`}}></div></div>
                <div className="val">{a.avgAQI}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bottom-list">
          <h3>Bottom 5 Cleanest Areas</h3>
          <div className="list">
            {bottom5.map((a, idx)=> (
              <div className="list-row" key={a.area}>
                <div className="rank">{idx+1}</div>
                <div className="area-name">{a.area}</div>
                <div className="bar-wrap"><div className="bar" style={{width:`${(a.avgAQI/maxAvg)*100}%`}}></div></div>
                <div className="val">{a.avgAQI}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INSIGHTS / SOLUTION */}
      <div className="insights">
        <h3>Automated Insights & Suggested Actions</h3>
        {insights ? (
          <div className="insight-box">
            <p><strong>Avg AQI:</strong> {insights.avgAQI}</p>
            <p><strong>% Poor/Severe days:</strong> {insights.percentPoorSevere}%</p>
            <p><strong>Most affected states:</strong> {insights.topStates.map(s=>s.state + ` (${s.avg})`).join(', ')}</p>
            <blockquote>{insights.externalSuggestion || insights.suggestion}</blockquote>

            {/* filter-specific suggestion */}
            {suggestionPollutant && (
              <div style={{marginTop:12}}>
                <h4>Selection-specific suggestion</h4>
                <p>When viewing <strong>{selectedState}</strong>{selectedMonth !== 'All' ? ` in ${selectedMonth}` : ''}:</p>
                <p><strong>Top pollutant:</strong> {suggestionPollutant}</p>
                <p><strong>Purifier:</strong> {suggestionPurifier}</p>
              </div>
            )}

            <h4>State-specific pollutant & purifier suggestion</h4>
            <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
              {(insights.stateSummaries || []).slice(0,8).map(s=> (
                <div key={s.state} style={{minWidth:180, padding:8, borderRadius:8, background:'rgba(255,255,255,0.02)'}}>
                  <strong>{s.state}</strong>
                  <div style={{fontSize:12, marginTop:6}}>
                    <div>Top: {s.topPollutants[0]?.pollutant || '-'}</div>
                    <div style={{marginTop:6, fontSize:12}}>Suggestion: {s.purifierSuggestion}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* month-specific area */}
            {insights.monthSummaries && (
              <>
                <h4 style={{marginTop:16}}>Month-specific summaries</h4>
                <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
                  {(selectedMonth === 'All'
                    ? insights.monthSummaries
                    : insights.monthSummaries.filter(m=>m.month === selectedMonth)
                  ).map(m=> (
                    <div key={m.month} style={{minWidth:160, padding:8, borderRadius:8, background:'rgba(255,255,255,0.02)'}}>
                      <strong>{m.month}</strong>
                      <div style={{fontSize:12, marginTop:6}}>
                        <div>Top: {m.topPollutants[0]?.pollutant || '-'}</div>
                        <div style={{marginTop:6, fontSize:12}}>Suggestion: {m.purifierSuggestion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <p>Loading suggestions...</p>
        )}
      </div>
    </div>
  );
}
