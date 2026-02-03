import { useNavigate } from "react-router-dom";
import "./Home.css";

const features = [
  { icon: "🧠", title: "AI-Powered Detection", desc: "Data cleaning, feature engineering, and model training for accurate AQI forecasts." },
  { icon: "⏱️", title: "Real-time Processing", desc: "Fast prediction pipelines and APIs to process large datasets with low latency." },
  { icon: "📊", title: "Comprehensive Analytics", desc: "Interactive dashboards, exportable reports, and detailed AQI visualizations." },
  { icon: "🔔", title: "Automated Alerts", desc: "Threshold-based alerts and notifications for high AQI events and trends." },
  { icon: "🧭", title: "Policy Recommendations", desc: "Actionable suggestions and purifier recommendations based on predicted patterns." },
  { icon: "🔍", title: "Root-cause Analysis", desc: "Pollutant correlation and area-level diagnostics to find likely sources." }
];

const teammates = [
  { name: "Prasath", role: "ML Engineer", bio: "Feature engineering, model training, and evaluation.", tags: ["ML","Data Cleaning","Modeling"] },
  { name: "Karthick", role: "Backend Engineer", bio: "API design, scheduling, and data pipelines.", tags: ["API","ETL","Performance"] },
  { name: "Santhosh", role: "Frontend Engineer", bio: "Dashboards, visualizations, and UX improvements.", tags: ["React","Charts","UX"] }
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
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="team-section">
        <h2>Meet the Team</h2>
        <div className="team-grid">
          {teammates.map((t, i) => (
            <div className="team-card" key={i}>
              <div className="team-top">
                <div className="avatar">{t.name.split(' ').map(n=>n[0]).join('').toUpperCase()}</div>
                <div className="team-meta">
                  <h4>{t.name}</h4>
                  <div className="role">{t.role}</div>
                </div>
              </div>
              <p className="bio">{t.bio}</p>
              <div className="tags">{t.tags.map(tag=> <span key={tag} className="tag">{tag}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
