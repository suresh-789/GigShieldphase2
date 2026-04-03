const express = require('express');
const router = express.Router();

console.log("🔥 aiRoutes loaded");

// Health
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Risk Prediction
router.post("/risk", (req, res) => {
  res.json({ riskScore: 65 });
});

// Fraud Detection
router.post("/fraud", (req, res) => {
  res.json({ fraudProbability: 0.1 });
});

// Dynamic Premium
router.post("/premium", (req, res) => {
  res.json({ premium: 320 });
});

// Forecast
router.get("/forecast", (req, res) => {
  res.json({ forecast: [10, 20, 30, 40, 50, 60, 70] });
});

// Claim Verification
router.post("/claim-verify", (req, res) => {
  res.json({ valid: true });
});

// Recommendations
router.get("/recommendations", (req, res) => {
  res.json({ recommendations: ["Avoid pollution", "Wear mask"] });
});

module.exports = router;
