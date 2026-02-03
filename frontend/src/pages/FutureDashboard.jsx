import { useEffect, useState } from "react";
import Papa from "papaparse";
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

const MONTHS = [
  "All",
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function FutureDashboard() {
  const [rawFuture, setRawFuture] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");

  const [pastAvg, setPastAvg] = useState(null);

  /* ================= LOAD FUTURE CSV ================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/predict/download")
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
        setFiltered(data);
        setStates(["All", ...new Set(data.map(d => d.state))]);
      });
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
    fetch("http://localhost:5000/api/predict/insights?enrich=1")
      .then(r=>r.json())
      .then(setInsights)
      .catch(()=>setInsights(null));
  },[]);

  // helper: month year (CY vs LY) aggregation
  const monthAgg = (arr) => {
    const byMonth = {};
    arr.forEach(d => {
      const dt = new Date(d.date);
      const m = dt.getMonth();
      const y = dt.getFullYear();
      const k = `${y}-${m}`;
      if (!byMonth[k]) byMonth[k] = { sum:0, count:0, year:y, month:m };
      byMonth[k].sum += d.aqi_value;
      byMonth[k].count++;
    });
    return Object.values(byMonth).map(v=>({ year:v.year, month:v.month, avg: Math.round(v.sum/v.count) }));
  };

  const monthlyComparison = () => {
    // compute current year and last year avg per month
    const thisYear = new Date().getFullYear();
    const lastYear = thisYear -1;
    const tx = rawFuture.filter(d=> new Date(d.date).getFullYear()===thisYear);
    const lx = rawFuture.filter(d=> new Date(d.date).getFullYear()===lastYear);

    const makeMap = (arr) => {
      const map = {};
      arr.forEach(d => {
        const m = new Date(d.date).getMonth();
        if (!map[m]) map[m] = { sum:0, count:0 };
        map[m].sum += d.aqi_value; map[m].count++;
      });
      const out = [];
      for (let i=0;i<12;i++) out.push({ month:i, thisYearAvg: Math.round((map[i]?.sum||0)/(map[i]?.count||1)), lastYearAvg: Math.round((map[i]?.sum||0)/(map[i]?.count||1)) });
      return out;
    }

    const txm = makeMap(tx);
    const lxm = makeMap(lx);

    return txm.map((m,i)=>({ month:i, thisYearAvg: txm[i].thisYearAvg, lastYearAvg: lxm[i]?.thisYearAvg||0 }));
  };

  const monthCompare = monthlyComparison();

  /* ================= APPLY FILTERS ================= */
  useEffect(() => {
    let data = [...rawFuture];

    if (selectedState !== "All")
      data = data.filter(d => d.state === selectedState);

    if (selectedMonth !== "All")
      data = data.filter(d => d.month === selectedMonth);

    setFiltered(data);
  }, [selectedState, selectedMonth, rawFuture]);

  if (!filtered.length) return <p className="page">Loading dashboard...</p>;

  // animations and improved chart props
  const chartAnim = { isAnimationActive: true, animationDuration: 900 };

  /* ================= KPIs ================= */
  const avgAQI = Math.round(
    filtered.reduce((s, d) => s + d.aqi_value, 0) / filtered.length
  );
  const maxAQI = Math.max(...filtered.map(d => d.aqi_value));

  const poorSevere = filtered.filter(
    d => d.air_quality_status === "Poor" || d.air_quality_status === "Severe"
  ).length;

  const goodDays = filtered.filter(d => d.air_quality_status === "Good").length;

  /* ================= CATEGORY ================= */
  const categoryMap = {};
  filtered.forEach(d => {
    categoryMap[d.air_quality_status] =
      (categoryMap[d.air_quality_status] || 0) + 1;
  });

  const pieData = Object.entries(categoryMap).map(([k, v]) => ({
    name: k, value: v
  }));

  /* ================= AREA ================= */
  const areaMap = {};
  filtered.forEach(d => {
    if (!areaMap[d.area]) areaMap[d.area] = { sum: 0, count: 0 };
    areaMap[d.area].sum += d.aqi_value;
    areaMap[d.area].count++;
  });

  const areaData = Object.entries(areaMap).map(([area, v]) => ({
    area,
    avgAQI: Math.round(v.sum / v.count)
  }));

  const sortedAreas = [...areaData].sort((a,b)=>b.avgAQI-a.avgAQI);
  const top5 = sortedAreas.slice(0,5);
  const bottom5 = sortedAreas.slice(-5).reverse();

  /* ================= TREND ================= */
  const trend = filtered
    .sort((a,b)=>a.date-b.date)
    .map(d => ({
      date: d.date.toLocaleDateString(),
      AQI: d.aqi_value
    }));

  return (
    <div className="page">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1>Future AQI Dashboard (Prediction)</h1>
        <div style={{display:'flex', gap:12}}>
          <button className="outline" onClick={async()=>{ const r=await fetch('http://localhost:5000/api/predict/download'); if(!r.ok) return alert('No predicted yet'); const b=await r.blob(); const url=URL.createObjectURL(b); const a=document.createElement('a'); a.href=url; a.download='predicted.csv'; a.click(); URL.revokeObjectURL(url); }}>Download Predicted CSV</button>
          <button className="outline" onClick={async()=>{ const r=await fetch('http://localhost:5000/api/predict/download'); if(!r.ok) return alert('No predicted yet'); const txt=await r.text(); setPreviewData(txt); setPreviewOpen(true); }}>View Predicted CSV</button>
        </div>
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
        <div className="kpi">Days<br/>{filtered.length}</div>
        <div className="kpi">Poor + Severe<br/>{Math.round((poorSevere/filtered.length)*100)}%</div>
        <div className="kpi">Good Days<br/>{Math.round((goodDays/filtered.length)*100)}%</div>

        <div className="kpi">Prominent Pollutant<br/>{insights?.stateSummaries?.find(s=>s.state===selectedState)?.topPollutants?.[0]?.pollutant || '-'}</div>
        <div className="kpi">Purifier Suggestion<br/><small>{insights?.stateSummaries?.find(s=>s.state===selectedState)?.purifierSuggestion || '-'}</small></div>
      </div>

      {/* PAST VS FUTURE */}
      {pastAvg && (
        <>
          <h3>Past vs Future AQI Comparison</h3>
          <BarChart width={500} height={250} data={[
            { name:"Past Avg", AQI: pastAvg },
            { name:"Future Avg", AQI: avgAQI }
          ]} {...chartAnim}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <Tooltip/>
            <Bar dataKey="AQI" fill="#06b6d4"/>
          </BarChart>
        </>
      )}

      {/* TREND */}
      <h3>AQI Trend</h3>
      <LineChart width={1000} height={300} data={trend} {...chartAnim}>
        <XAxis dataKey="date" hide/>
        <YAxis/>
        <Tooltip/>
        <Line dataKey="AQI" stroke="#06b6d4" dot={false} isAnimationActive={true} animationDuration={900}/>
      </LineChart>

      {/* MONTH-WISE COMPARISON (CY vs LY) */}
      <h3>Monthly Comparison (Current Year vs Last Year)</h3>
      <div className="card">
        <BarChart width={1000} height={300} data={monthCompare} {...chartAnim}>
          <XAxis dataKey="month" tickFormatter={(m)=>["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m]}/>
          <YAxis/>
          <Tooltip/>
          <Bar dataKey="thisYearAvg" fill="#06b6d4" name="This Year" />
          <Bar dataKey="lastYearAvg" fill="#8b5cf6" name="Last Year" />
        </BarChart>

        {/* REPORTS */}
        <div className="report-section" style={{marginTop:16}}>
          <div className="report-card">
            <h4>Generate Reports</h4>
            <p>Get downloadable reports and interactive visualizations for your analysis.</p>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button className="outline" onClick={()=>alert('Standard report generation not implemented (placeholder)')}>Generate Standard Report</button>
              <button className="primary" onClick={()=>alert('Detailed report generation not implemented (placeholder)')}>Generate Detailed Report</button>
              <button className="outline" onClick={()=>alert('Open interactive visualizations (placeholder)')}>View Interactive Visualizations</button>
            </div>
          </div>

          <div className="download-cards">
            <div className="download-card">
              <h5>Complete Analysis</h5>
              <button className="outline" onClick={async()=>{ const r=await fetch('/api/predict/download'); if(!r.ok) return alert('No predicted file'); const b=await r.blob(); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download='predicted.csv'; a.click(); URL.revokeObjectURL(u); }}>Download CSV</button>
            </div>
            <div className="download-card">
              <h5>Top Polluted Areas</h5>
              <button className="outline" onClick={()=>{ const csv = top5.map(a=>`${a.area},${a.avgAQI}`).join('\n'); const b=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(b); const aEl=document.createElement('a'); aEl.href=url; aEl.download='top5.csv'; aEl.click(); URL.revokeObjectURL(url); }}>Download CSV</button>
            </div>
            <div className="download-card">
              <h5>Clean Records</h5>
              <button className="outline" onClick={()=>alert('Clean records download not implemented (placeholder)')}>Download CSV</button>
            </div>
          </div>
        </div>
      </div>

      {/* AREA */}
      <h3>Area-wise Avg AQI</h3>
      <div className="card">
        <BarChart width={1000} height={300} data={areaData} {...chartAnim}>
          <XAxis dataKey="area" hide/>
          <YAxis/>
          <Tooltip/>
          <Bar dataKey="avgAQI" fill="#3b82f6"/>
        </BarChart>
        <div style={{marginTop:10, display:'flex', gap:12}}>
          <button className="outline" onClick={()=>{ const csv = areaData.map(a=>`${a.area},${a.avgAQI}`).join('\n'); const b=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(b); const aEl=document.createElement('a'); aEl.href=url; aEl.download='area_avg.csv'; aEl.click(); URL.revokeObjectURL(url); }}>Download Area CSV</button>
          <button className="outline" onClick={()=>{ setPreviewData(areaData.map(a=>`${a.area},${a.avgAQI}`).join('\n')); setPreviewOpen(true); }}>View Area CSV</button>
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
          {Object.entries(categoryMap).map(([k,v])=> (
            <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'6px 8px'}}>
              <strong>{k}</strong><span>{v}</span>
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
          </div>
        ) : (
          <p>Loading suggestions...</p>
        )}
      </div>
    </div>
  );
}
