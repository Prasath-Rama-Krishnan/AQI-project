import { useMemo, useState } from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie,
  XAxis, YAxis, Tooltip, Cell
} from "recharts";
import "./Dashboard.css";

const MONTHS = [
  "All",
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function Dashboard({ data }) {
  const [state, setState] = useState("All");
  const [month, setMonth] = useState("All");

  /* ---------- FILTER DATA (SAFE: useMemo) ---------- */
  const filtered = useMemo(() => {
    let temp = data;

    if (state !== "All")
      temp = temp.filter(d => d.state === state);

    if (month !== "All")
      temp = temp.filter(d => d.month === month);

    return temp;
  }, [state, month, data]);

  if (!filtered.length) {
    return <p className="dash">No data to display</p>;
  }

  /* ---------- KPIs ---------- */
  const avgAQI = Math.round(
    filtered.reduce((s,d)=>s+d.aqi_value,0) / filtered.length
  );
  const maxAQI = Math.max(...filtered.map(d=>d.aqi_value));

  /* ---------- TREND ---------- */
  const trend = filtered.map(d => ({
    date: d.date,
    AQI: d.aqi_value
  }));

  /* ---------- CATEGORY PIE ---------- */
  const categoryMap = {};
  filtered.forEach(d=>{
    categoryMap[d.air_quality_status] =
      (categoryMap[d.air_quality_status] || 0) + 1;
  });

  const pieData = Object.entries(categoryMap).map(([k,v])=>({
    name:k, value:v
  }));

  /* ---------- AREA BAR ---------- */
  const areaMap = {};
  filtered.forEach(d=>{
    if(!areaMap[d.area]) areaMap[d.area]={sum:0,count:0};
    areaMap[d.area].sum+=d.aqi_value;
    areaMap[d.area].count++;
  });

  const areaData = Object.entries(areaMap).map(([k,v])=>({
    area:k,
    avgAQI:Math.round(v.sum/v.count)
  }));

  const states = ["All", ...new Set(data.map(d=>d.state))];

  return (
    <div className="dash">
      <h2>Future AQI Dashboard</h2>

      {/* FILTERS */}
      <div className="filters">
        <select value={state} onChange={e=>setState(e.target.value)}>
          {states.map(s=><option key={s}>{s}</option>)}
        </select>

        <select value={month} onChange={e=>setMonth(e.target.value)}>
          {MONTHS.map(m=><option key={m}>{m}</option>)}
        </select>
      </div>

      {/* KPIs */}
      <div className="kpis">
        <div className="card">Avg AQI<br/>{avgAQI}</div>
        <div className="card">Max AQI<br/>{maxAQI}</div>
        <div className="card">Days<br/>{filtered.length}</div>
      </div>

      {/* LINE CHART */}
      <h3>AQI Trend</h3>
      <LineChart width={900} height={280} data={trend}>
        <XAxis dataKey="date" hide/>
        <YAxis/>
        <Tooltip/>
        <Line dataKey="AQI" stroke="#38bdf8" dot={false}/>
      </LineChart>

      {/* BAR CHART */}
      <h3>Area-wise Avg AQI</h3>
      <BarChart width={900} height={280} data={areaData}>
        <XAxis dataKey="area" hide/>
        <YAxis/>
        <Tooltip/>
        <Bar dataKey="avgAQI" fill="#60a5fa"/>
      </BarChart>

      {/* PIE */}
      <h3>AQI Category Distribution</h3>
      <PieChart width={400} height={300}>
        <Pie data={pieData} dataKey="value" nameKey="name" label>
          {pieData.map((_,i)=><Cell key={i} fill="#94a3b8"/>)}
        </Pie>
      </PieChart>
    </div>
  );
}
