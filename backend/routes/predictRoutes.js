const express = require("express");
const multer = require("multer");
const { runPrediction } = require("../controllers/predictController");

const router = express.Router();

/* upload in memory, NOT permanent */
const upload = multer({ dest: "temp/" });

router.post("/", upload.single("file"), runPrediction);

module.exports = router;
