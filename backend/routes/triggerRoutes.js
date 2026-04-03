const express = require('express');
const router = express.Router();
const { checkTriggers } = require('../services/triggerService');

console.log("🔥 triggerRoutes loaded");

/**
 * @route   GET /api/triggers/check/:city
 * @desc    Check active triggers for a city
 * @access  Public
 */
router.get('/check/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    const weatherService = require('../services/weatherService');
    const weatherData = await weatherService.getWeatherData(city);
    
    const triggers = checkTriggers(weatherData);
    
    res.json({
      success: true,
      triggers,
      city
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
