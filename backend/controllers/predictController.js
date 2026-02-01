const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

exports.runPrediction = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(
      __dirname,
      "..",
      "temp",
      "predicted.csv"
    );

    const scriptPath = path.join(
      __dirname,
      "..",
      "python",
      "predict_aqi.py"
    );

    const cmd = `python "${scriptPath}" "${inputPath}" "${outputPath}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        return res.status(500).json({ error: "Prediction failed" });
      }

      const csv = fs.readFileSync(outputPath, "utf-8");

      /* cleanup uploaded file */
      fs.unlinkSync(inputPath);

      res.json({
        success: true,
        csv
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
