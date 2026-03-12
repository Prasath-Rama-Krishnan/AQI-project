import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading AQI Analytics...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="error-container">
          <h2>⚠️ Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Air Quality Intelligence Platform</h1>
          <p className="hero-subtitle">
            Real-time AQI monitoring, predictive analytics, and smart purifier recommendations
          </p>
          <div className="hero-buttons">
            <Link to="/dashboard" className="btn btn-primary">
              📊 View Dashboard
            </Link>
            <Link to="/prediction" className="btn btn-secondary">
              📈 Prediction Analysis
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="aqi-indicator">
            <div className="aqi-value good">42</div>
            <div className="aqi-label">Current AQI</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Real-time Monitoring</h3>
              <p>Live air quality data from multiple monitoring stations across India</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Prediction Page</h3>
              <p>Upload AQI data and get AI-powered predictions and analysis</p>
              <Link to="/prediction" className="feature-link">Start Analysis →</Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔮</div>
              <h3>Future Predictions</h3>
              <p>Get AI-powered AQI forecasts and trend analysis</p>
              <Link to="/dashboard" className="feature-link">View Dashboard →</Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Smart Recommendations</h3>
              <p>Dynamic purifier suggestions based on air quality data</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌡️</div>
              <h3>Health Impact Analysis</h3>
              <p>Personalized health insights based on air quality exposure levels</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Interactive Maps</h3>
              <p>Geographic visualization of air quality patterns and hotspots</p>
            </div>
          </div>
        </div>
      </section>

      {/* Prediction Analysis Section */}
      <section className="powerbi-section">
        <div className="container">
          <h2 className="section-title">Prediction Analysis Platform</h2>
          <div className="powerbi-card">
            <div className="powerbi-info">
              <div className="powerbi-icon">�</div>
              <div className="powerbi-details">
                <h3>AI-Powered Predictions</h3>
                <p>
                  Upload your historical AQI data and get advanced AI-powered predictions 
                  for future air quality trends. Analyze patterns, forecast values, and 
                  make informed decisions based on predictive insights.
                </p>
                <div className="powerbi-features">
                  <span>📈 Historical Analysis</span>
                  <span>� Future Predictions</span>
                  <span>📊 Trend Visualization</span>
                  <span>🤖 AI Insights</span>
                </div>
                <Link 
                  to="https://app.powerbi.com/view?r=eyJrIjoiNTBmZTIxZGQtY2ZkNC00NzkyLWFkZDEtNzM1NzQ0YzdmZTFiIiwidCI6ImM2ZTU0OWIzLTVmNDUtNDAzMi1hYWU5LWQ0MjQ0ZGM1YjJjNCJ9"
                  className="btn btn-powerbi"
                >
                  🚀 View Historical Analysis
                </Link>
              </div>
            </div>
            <div className="powerbi-preview">
              <div className="preview-placeholder">
                <div className="preview-chart"></div>
                <div className="preview-chart"></div>
                <div className="preview-chart"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h2 className="section-title">Quick Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">28</div>
              <div className="stat-label">States Monitored</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">150+</div>
              <div className="stat-label">Monitoring Stations</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Real-time Updates</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">95%</div>
              <div className="stat-label">Prediction Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="how-to-section">
        <div className="container">
          <h2 className="section-title">How to Use Dynamic Features</h2>
          <div className="how-to-grid">
            <div className="how-to-card">
              <div className="step-number">1</div>
              <h3>Select Your Location</h3>
              <p>Choose your state from the dropdown menu in the dashboard</p>
            </div>
            <div className="how-to-card">
              <div className="step-number">2</div>
              <h3>View Real-time Data</h3>
              <p>See current AQI levels and prominent pollutants in your area</p>
            </div>
            <div className="how-to-card">
              <div className="step-number">3</div>
              <h3>Get Smart Recommendations</h3>
              <p>Receive dynamic purifier suggestions based on local air quality</p>
            </div>
            <div className="how-to-card">
              <div className="step-number">4</div>
              <h3>Explore Products</h3>
              <p>Click on purifier suggestions to see real-time product searches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>AQI Analytics Platform</h4>
              <p>Comprehensive air quality monitoring and prediction system</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/analytics">Analytics</Link></li>
                <li><a href="https://app.powerbi.com/view?r=eyJrIjoiNTBmZTIxZGQtY2ZkNC00NzkyLWFkZDEtNzM1NzQ0YzdmZTFiIiwidCI6ImM2ZTU0OWIzLTVmNDUtNDAzMi1hYWU5LWQ0MjQ0ZGM1YjJjNCJ9" target="_blank" rel="noopener noreferrer">Power BI</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Data Sources</h4>
              <p>Real-time monitoring stations, satellite data, and predictive models</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 AQI Analytics Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
