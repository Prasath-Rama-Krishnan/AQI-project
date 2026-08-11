# 🌍 AQI Prediction & Analysis Dashboard

A full-stack **Air Quality Index (AQI) Prediction and Analysis Dashboard** that uses historical AQI data to predict future air quality and provide interactive insights through state-wise, area-wise, and time-based analysis.

The application allows users to upload a historical CSV dataset, generate future AQI predictions using a **Linear Regression model**, and explore the results through interactive dashboards and visualizations.

## 🚀 Live Demo

🔗 **Live Application:** https://aqi-analysis-project.vercel.app/

🔗 **GitHub Repository:** https://github.com/Prasath-Rama-Krishnan/AQI-project

---

## 📌 Project Overview

Air pollution is an important environmental concern, and understanding historical AQI patterns can help identify polluted areas and observe changes over time.

This project provides a web-based platform where users can:

* Upload historical AQI datasets
* Generate future AQI predictions
* Analyze AQI by state and area
* Filter results by month
* Identify prominent pollutants
* View interactive charts and KPIs
* Get pollutant-based purifier suggestions
* Download predicted datasets and reports

The system combines a **React frontend**, **Node.js/Express backend**, and **Python-based machine learning prediction module**.

---

## ✨ Features

### 📂 CSV Dataset Upload

Users can upload their own historical AQI dataset through the Prediction page.

The application validates important columns such as:

* `date`
* `state`
* `area`
* `aqi_value`

### 🤖 AQI Prediction

The backend sends the uploaded dataset to the Python prediction module.

The prediction system:

1. Reads the historical AQI data
2. Converts dates into numerical values
3. Groups data by state and area
4. Trains a Linear Regression model for each group
5. Generates predictions for the next **365 days**
6. Classifies the predicted AQI into air-quality categories

### 📊 Interactive Dashboard

The dashboard provides interactive visualizations including:

* AQI trend charts
* Area-wise AQI bar charts
* Monthly comparisons
* Pollutant distribution
* AQI category distribution
* Past vs Future AQI comparison
* Top 5 polluted areas
* Top 5 cleanest areas

### 🔎 Dynamic Filtering

Users can filter the analysis using:

* State
* Month
* Area-related analysis

The KPIs and charts update according to the selected filters.

### 🌫️ Pollutant Analysis

The system identifies prominent pollutants such as:

* PM2.5
* PM10
* NO₂
* SO₂
* O₃
* CO

The detected pollutant can be used to provide context-aware recommendations.

### 💨 Purifier Suggestions

The application provides suggestions based on the detected prominent pollutant.

Examples include:

* **PM2.5** → HEPA-grade filtration
* **PM10** → HEPA filtration with dust control
* **NO₂** → Activated carbon filtration
* **CO** → Combustion-source control and detectors

### 📄 Reports & Downloads

Users can:

* Download predicted AQI CSV data
* Preview CSV data
* View generated reports
* Download HTML reports

---

## 🧠 Machine Learning

The prediction module is implemented in Python using **Scikit-learn's Linear Regression**.

### Prediction Process

```text
Historical AQI CSV
        ↓
Data Cleaning
        ↓
Date Processing
        ↓
Group by State + Area
        ↓
Linear Regression
        ↓
365-Day AQI Prediction
        ↓
AQI Classification
        ↓
Predicted CSV
        ↓
Interactive Dashboard
```

The model uses the historical date and AQI value to estimate future AQI values for each state/area combination.

---

## 🏷️ AQI Classification

The application classifies predicted AQI values into categories:

| AQI Value | Category |
| --------- | -------- |
| 0 – 50    | Good     |
| 51 – 100  | Moderate |
| 101 – 200 | Poor     |
| 201+      | Severe   |

---

## 🛠️ Technologies Used

### Frontend

* React 19
* Vite
* React Router
* Axios
* Recharts
* PapaParse
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* Multer
* CORS
* Node.js Child Process
* REST APIs

### Machine Learning / Data Processing

* Python
* Pandas
* Scikit-learn
* Linear Regression
* CSV data processing

The project's frontend dependencies include React, Vite, Axios, PapaParse, React Router and Recharts, while the backend uses Express, Multer and CORS.

---

## 📁 Project Structure

```text
AQI-project/
│
├── backend/
│   ├── controllers/
│   │   ├── predictController.js
│   │   └── purifierController.js
│   │
│   ├── python/
│   │   ├── predict_aqi.py
│   │   └── requirements.txt
│   │
│   ├── routes/
│   ├── temp/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── .env.example
├── .gitignore
├── PRODUCTION_READY.md
├── PROJECT_SUMMARY.md
├── SYSTEM_FLOW_DOCUMENTATION.md
└── vercel.json
```

The repository currently contains separate `frontend` and `backend` applications, with React source organized into components, pages, services and utilities, and the backend containing controllers, routes and the Python prediction module.

---

## 🔄 System Workflow

```text
User
 │
 ▼
Home Page
 │
 ├───────────────┐
 ▼               ▼
Prediction     Dashboard
 │               │
 ▼               │
Upload CSV       │
 │               │
 ▼               │
Node.js API      │
 │               │
 ▼               │
Python ML Model  │
 │               │
 ▼               │
Predicted CSV ───┘
 │
 ▼
Data Analysis
 │
 ├── State Analysis
 ├── Area Analysis
 ├── Monthly Analysis
 ├── AQI Trends
 ├── Pollutant Analysis
 └── Purifier Suggestions
```

The documented system flow follows the same architecture: historical CSV → backend prediction → predicted CSV → frontend analysis and visualization.

---

## 🔌 Backend API

### Upload & Predict

```http
POST /api/predict/upload
```

Uploads a CSV dataset and runs the Python prediction process.

### Download Predictions

```http
GET /api/predict/download
```

Downloads the generated predicted AQI dataset.

### Insights

```http
GET /api/predict/insights?enrich=1
```

Returns analysis and recommendation information.

### Health Check

```http
GET /health
```

Used to verify that the backend service is running.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Prasath-Rama-Krishnan/AQI-project.git

cd AQI-project
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run using Vite.

### 3. Setup Backend

Open another terminal:

```bash
cd backend
npm install
npm start
```

### 4. Setup Python Dependencies

```bash
cd backend/python
pip install -r requirements.txt
```

### 5. Environment Variables

Create the required `.env` files using the provided examples:

```text
backend/.env.example
frontend/.env.example
```

For production, the frontend uses `VITE_BACKEND_URL`, while the backend supports configuration such as `BACKEND_PORT`, `NODE_ENV`, and `FRONTEND_URL`.

---

## 📊 Sample Dataset Format

The prediction workflow expects historical AQI data containing fields such as:

```csv
date,state,area,aqi_value,prominent_pollutants
01-01-2025,Tamil Nadu,Chennai,85,PM2.5
02-01-2025,Tamil Nadu,Chennai,92,PM10
03-01-2025,Tamil Nadu,Chennai,78,NO2
```

The prediction output contains:

```text
date
state
area
aqi_value
air_quality_status
prominent_pollutants
```

---

## 📈 Key Analytics

The dashboard provides:

* Average AQI
* Maximum AQI
* AQI category distribution
* Prominent pollutants
* Area-wise AQI
* Daily AQI trends
* Monthly comparisons
* Current vs future AQI
* Top polluted areas
* Cleanest areas
* Pollutant-based recommendations

---

## 🎯 What I Learned

Through this project, I gained practical experience in:

* Building a full-stack web application
* React component-based development
* REST API integration
* Node.js and Express backend development
* CSV file upload and processing
* Python integration with a Node.js backend
* Machine learning using Linear Regression
* Data preprocessing with Pandas
* Interactive data visualization with Recharts
* State and month-based data filtering
* Environment variable management
* Production-oriented frontend and backend configuration

---

## 🚀 Future Improvements

* Improve prediction accuracy using advanced time-series models
* Add more machine learning algorithms for comparison
* Add real-time AQI data integration
* Add location-based AQI monitoring
* Improve prediction evaluation with MAE, RMSE and R² metrics
* Add more detailed pollutant-level analysis
* Add user authentication
* Improve dashboard export options
* Add automated notifications for high AQI levels

---

## 👨‍💻 Author

### Prasath R

Computer Science & Engineering

🌐 **Portfolio:**
https://portfolio-005.vercel.app/

💼 **LinkedIn:**
https://www.linkedin.com/in/prasath-ramakrishnan-567a71295

💻 **GitHub:**
https://github.com/Prasath-Rama-Krishnan

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

**Thank you for visiting the project!**
