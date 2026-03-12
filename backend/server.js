const express = require("express");
const cors = require("cors");
const path = require("path");
const predictRoutes = require("./routes/predictRoutes");
const purifierRoutes = require("./routes/purifierRoutes");

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS configuration - adjust for production
const corsOptions = {
  origin: NODE_ENV === "production" 
    ? [process.env.FRONTEND_URL || "https://yourdomain.com"]
    : true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/predict", predictRoutes);
app.use("/api/purifier", purifierRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", env: NODE_ENV });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: NODE_ENV === "production" ? "Internal server error" : err.message
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} [${NODE_ENV}]`);
});
