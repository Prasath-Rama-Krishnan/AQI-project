import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadDataset } from "../services/api";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import "./Prediction.css";

export default function Prediction() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [predictedAvailable, setPredictedAvailable] = useState(false);

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

  return (
    <div className="prediction-container">
      <div className="pred-hero">
        <div className="pred-hero-inner">
          <h1>Upload Telecom Dataset</h1>
          <p>Upload your data to generate AQI predictions and automated insights.</p>
        </div>
      </div>

      <div className="pred-tabs">
        <button className={activeTab==='upload' ? 'tab active' : 'tab'} onClick={()=>setActiveTab('upload')}>Upload Data</button>
        <button className={activeTab==='results' ? 'tab active' : 'tab'} onClick={()=>setActiveTab('results')}>Results & Analysis</button>
      </div>

      {activeTab === 'upload' && (
        <div className="upload-card">
          <div className="upload-icon">⬆️</div>
          <h3>Upload Telecom Dataset</h3>
          <p>CSV with columns: <code>date, state, area, aqi_value</code></p>

          <div className="file-input-wrap">
            <input id="file" type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
          </div>

          <div className="actions">
            <button className="primary" onClick={handleUpload} disabled={loading}>Predict</button>
            <button className="muted" onClick={()=>{ setFile(null); document.getElementById('file').value=''; }}>Clear</button>
          </div>

          {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />}

          {predictedAvailable && (
            <div className="result-actions">
              <button onClick={() => navigate('/dashboard')} className="outline">View Prediction</button>
              <button onClick={downloadPredicted} className="outline">Download Predicted CSV</button>
              <button className="outline" onClick={() => { setPreviewOpen(true); fetch('http://localhost:5000/api/predict/download').then(r=>r.text()).then(t=>setPreviewData(t)).catch(()=>setPreviewData(null)) }}>Preview CSV</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="results-card">
          <h3>Prediction Results</h3>
          <p>Visit the dashboard to explore predicted AQI, trends, and insights.</p>
          <div style={{display:'flex', gap:8, justifyContent:'center', marginTop:12}}>
            <button className="outline" onClick={()=>navigate('/dashboard')}>Open Dashboard</button>
            <button className="outline" onClick={downloadPredicted}>Download Predicted CSV</button>
          </div>
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
