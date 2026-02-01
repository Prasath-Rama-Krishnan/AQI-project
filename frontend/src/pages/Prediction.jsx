import { useState } from "react";
import Papa from "papaparse";
import Dashboard from "./Dashboard";
import "./Prediction.css";

export default function Prediction() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [csvText, setCsvText] = useState("");

  const handleSubmit = async () => {
    if (!file) return alert("Upload CSV file");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    const res = await fetch("http://localhost:5000/api/predict", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    setCsvText(json.csv);

    Papa.parse(json.csv, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const formatted = result.data.map(d => ({
          ...d,
          aqi_value: Number(d.aqi_value),
          month: new Date(d.date).toLocaleString("default", { month: "long" })
        }));
        setDashboardData(formatted);
        setLoading(false);
      }
    });
  };

  const downloadCSV = () => {
    const blob = new Blob([csvText], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "future_aqi_prediction.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="prediction fade-in">
      <h1>AQI Future Prediction</h1>

      {!dashboardData && (
        <>
          <input
            type="file"
            accept=".csv"
            onChange={e => setFile(e.target.files[0])}
          />
          <button onClick={handleSubmit}>
            {loading ? "Predicting..." : "Predict AQI"}
          </button>
        </>
      )}

      {dashboardData && (
        <>
          <button className="download-btn" onClick={downloadCSV}>
            ⬇ Download Predicted CSV
          </button>

          <Dashboard data={dashboardData} />
        </>
      )}
    </div>
  );
}
