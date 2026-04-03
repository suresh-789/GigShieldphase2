const express = require('express');
const router = express.Router();
const { calculateDynamicPremium, getPremiumQuote, getCurrentSeason } = require('../services/premiumService');

console.log("🔥 premiumRoutes loaded");

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
    
    // Get current season
    const season = getCurrentSeason();
    
    // Get base premium for the plan
    const basePremiums = {
      basic: 15,
      standard: 20,
      premium: 30
    };
    const basePremium = basePremiums[plan] || basePremiums.standard;
    
    // Calculate dynamic premium
    const quote = calculateDynamicPremium(
      basePremium, 
      city, 
      season, 
      vehicleType || 'bike', 
      null
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
 * @route   GET /api/premium/plans
 * @desc    Get all available plans
 * @access  Public
 */
router.get('/plans', async (req, res) => {
  try {
    const { getAllPlans } = require('../services/premiumService');
    const plans = getAllPlans();
    
    res.json({ 
      success: true, 
      plans 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/premium/city/:city
 * @desc    Get city risk information
 * @access  Public
 */
router.get('/city/:city', async (req, res) => {
  try {
    const { getCityRiskInfo } = require('../services/premiumService');
    const cityInfo = getCityRiskInfo(req.params.city);
    
    res.json({ 
      success: true, 
      cityInfo 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
