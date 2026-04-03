const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { processAutoClaim, getUserClaims, getClaimStats } = require('../services/claimService');
const { getWeatherData } = require('../services/weatherService');
const Transaction = require('../models/Transaction');

/**
 * @route   GET /api/claims
 * @desc    Get user claims
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const claims = await getUserClaims(req.user.id);
    res.json({ 
      success: true, 
      claims 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/claims/stats
 * @desc    Get claim statistics for user
 * @access  Private
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await getClaimStats(req.user.id);
    res.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   POST /api/claims/submit
 * @desc    Submit manual claim (for testing)
 * @access  Private
 */
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { triggerType } = req.body;
    
    if (!triggerType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Trigger type is required' 
      });
    }
    
    // Get user's city weather
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const weatherData = await getWeatherData(user.city);
    const claim = await processAutoClaim(user._id, triggerType, weatherData);
    
    res.json({ 
      success: true, 
      claim,
      message: claim.status === 'paid' 
        ? 'Claim auto-verified and paid!' 
        : 'Claim submitted for review'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/transactions
 * @desc    Get user transactions
 * @access  Private
 */
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      transactions 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
