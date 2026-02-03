const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const {
  uploadAndPredict,
  runPredictionOnSample,
  downloadPredicted,
  getInsights
} = require("../controllers/predictController");

// Accept multipart file upload (field name: file)
router.post("/upload", upload.single("file"), uploadAndPredict);

// Run prediction on server-side sample file: /api/predict/sample/aqi.csv
router.get("/sample/:name", runPredictionOnSample);

// Download predicted CSV
router.get("/download", downloadPredicted);

// Insights and suggestions
router.get("/insights", getInsights);

module.exports = router;
