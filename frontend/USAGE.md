AQI Project - quick usage

- Landing page now contains a clear **Create New Prediction** CTA and instructions.
- Prediction page accepts CSV upload (columns: `date,state,area,aqi_value`) or you can run server-side samples.
- Available backend endpoints (local):
  - POST `http://localhost:5000/api/predict/upload` (multipart form with `file`)
  - GET `http://localhost:5000/api/predict/sample/:name` (e.g. `aqi.csv` or `aqi2026n.csv`)
  - GET `http://localhost:5000/api/predict/download` (download latest predicted CSV)
  - GET `http://localhost:5000/api/predict/insights` (JSON suggestions and high-level metrics)

- After running a prediction you can view the dashboard (`/dashboard`) which shows state/month filters, charts and a "Solutions" box with automated suggestions.