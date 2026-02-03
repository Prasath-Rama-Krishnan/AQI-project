import { useNavigate } from "react-router-dom";
import "./Home.css";

const features = [
  {
    icon: "🧠",
    title: "AI-Powered Detection",
    desc: "Data cleaning, feature engineering, and ML model training for accurate AQI prediction (Prasath).",
    by: "Prasath"
  },
  {
    icon: "⏱️",
    title: "Real-time Processing",
    desc: "Backend API, prediction scheduling, and fast processing pipeline for large datasets (Karthick).",
    by: "Karthick"
  },
  {
    icon: "📊",
    title: "Comprehensive Analytics",
    desc: "UI, interactive dashboards, charts, and export features for analysis and reporting (Santhosh).",
    by: "Santhosh"
  }
];

const teammates = [
  { name: "Prasath" },
  { name: "Karthick" },
  { name: "Santhosh" }
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="hero">
        <h1>Air Quality Index (AQI) Prediction System</h1>
        <p className="tag">Predict future air quality and get actionable suggestions</p>
        <div className="cta-row">
          <button className="primary bright" onClick={() => navigate("/prediction")}>Create New Prediction</button>
          <button className="secondary bright" onClick={() => navigate("/dashboard")}>View Latest Dashboard</button>
        </div>
      </div>

      <div className="features-section">
        <h2 className="features-title">Powerful AI-Driven Features</h2>
        <p className="features-sub">Comprehensive AQI prediction and analytics with cutting-edge technology and automation.</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-content">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="feature-by">By: <span>{f.by}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="team-section">
        <h2>Meet the Team</h2>
        <div className="team-list">
          {teammates.map((t, i) => (
            <div className="team-card" key={i}>{t.name}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
