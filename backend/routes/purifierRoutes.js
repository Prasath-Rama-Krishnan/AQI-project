const express = require("express");
const router = express.Router();
const { getPurifierSuggestions } = require("../controllers/purifierController");

// Purifier suggestions based on state and pollutant
router.get("/suggestions", getPurifierSuggestions);

module.exports = router;
