const express = require('express');
const router = express.Router();
const { getWeatherData, logWeatherData, getWeatherHistory } = require('../services/weatherService');
const { checkTriggers, getAllTriggers } = require('../services/triggerService');
const { getPremiumQuote } = require('../services/premiumService');

/**
 * @route   GET /api/triggers/all
 * @desc    Get all available triggers
 * @access  Public
 */
router.get('/all', async (req, res) => {
  try {
    const triggers = getAllTriggers();
    
    res.json({ 
      success: true, 
      triggers 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/triggers/check/:city
 * @desc    Check active triggers for a city
 * @access  Public
 */
router.get('/check/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const weatherData = await getWeatherData(city);
    
    const activeTriggers = checkTriggers(weatherData);
    
    res.json({ 
      success: true, 
      triggers: activeTriggers,
      weather: weatherData,
      totalTriggers: activeTriggers.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   POST /api/premium/quote
 * @desc    Get dynamic premium quote
 * @access  Public
 */
router.post('/quote', async (req, res) => {
  try {
    const { city, vehicleType, plan } = req.body;
    
    if (!city) {
      return res.status(400).json({ 
        success: false, 
        message: 'City is required' 
      });
    }
    
    // Get current weather for accurate quote
    const weatherData = await getWeatherData(city);
    
    const quote = getPremiumQuote(
      city, 
      vehicleType || 'bike', 
      plan || 'standard',
      weatherData
    );
    
    res.json({ 
      success: true, 
      quote 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/weather/:city/history
 * @desc    Get weather history for a city
 * @access  Public
 */
router.get('/:city/history', async (req, res) => {
  try {
    const city = req.params.city;
    const days = parseInt(req.query.days) || 7;
    
    const history = await getWeatherHistory(city, days);
    
    res.json({ 
      success: true, 
      history 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/weather/:city
 * @desc    Get weather data for a city
 * @access  Public
 */
router.get('/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const weatherData = await getWeatherData(city);
    
    // Log weather data
    await logWeatherData(weatherData);
    
    res.json({ 
      success: true, 
      data: weatherData 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
