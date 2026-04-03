const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken, authLimiter, otpLimiter } = require('../middleware/auth');
const { getPremiumQuote, getCurrentSeason } = require('../services/premiumService');
const { getWeatherData } = require('../services/weatherService');

const JWT_SECRET = process.env.JWT_SECRET || 'gigshield-secret-key-change-in-production';

// OTP Storage (in production, use Redis)
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @route   POST /api/users/register
 * @desc    Register new user with dynamic premium calculation
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, phone, city, platform, password, vehicleType } = req.body;
    
    // Validate required fields
    if (!name || !phone || !city || !platform || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }
    
    // Get current weather for premium calculation
    const weatherData = await getWeatherData(city);
    
    // Calculate dynamic premium
    const premiumQuote = getPremiumQuote(city, vehicleType || 'bike', 'standard', weatherData);
    
    // Determine risk level
    const riskLevel = premiumQuote.riskLevel;
    
    const user = new User({
      name,
      phone,
      password,
      city,
      platform,
      vehicleType: vehicleType || 'bike',
      riskLevel,
      weeklyPremium: premiumQuote.finalPremium,
      coverage: premiumQuote.riskLevel === 'low' ? 2500 : premiumQuote.riskLevel === 'high' ? 1500 : 2000
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, phone: user.phone }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      success: true, 
      user: user.toJSON(),
      token,
      premiumDetails: {
        basePremium: premiumQuote.basePremium,
        dynamicPremium: premiumQuote.finalPremium,
        season: getCurrentSeason(),
        riskLevel,
        savings: premiumQuote.savings
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false, 
        message: 'Phone number already registered' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
});

/**
 * @route   POST /api/users/request-otp
 * @desc    Request OTP for login
 * @access  Public
 */
router.post('/request-otp', otpLimiter, async (req, res) => {
  try {
    const { phone } = req.body;
    
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please register first.' 
      });
    }
    
    // Generate and store OTP
    const otp = generateOTP();
    otpStore.set(phone, {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });
    
    console.log(`OTP for ${phone}: ${otp}`);
    
    res.json({ 
      success: true, 
      message: 'OTP sent to your phone',
      demo_otp: otp 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   POST /api/users/login
 * @desc    Login with password
 * @access  Public
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and password are required' 
      });
    }
    
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please register first.' 
      });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, phone: user.phone }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true, 
      user: user.toJSON(),
      token 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   POST /api/users/login-otp
 * @desc    Login with OTP
 * @access  Public
 */
router.post('/login-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and OTP are required' 
      });
    }
    
    const storedOTP = otpStore.get(phone);
    
    if (!storedOTP) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP not requested. Please request OTP first.' 
      });
    }
    
    if (Date.now() > storedOTP.expires) {
      otpStore.delete(phone);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired. Please request a new one.' 
      });
    }
    
    if (storedOTP.otp !== otp) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }
    
    // OTP verified - clear OTP and generate token
    otpStore.delete(phone);
    
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, phone: user.phone }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true, 
      user: user.toJSON(),
      token 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({ 
      success: true, 
      user: user.toJSON() 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   PUT /api/users/plan
 * @desc    Update user plan
 * @access  Private
 */
router.put('/plan', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!['basic', 'standard', 'premium'].includes(plan)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid plan' 
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const coverageMap = { basic: 1500, standard: 2000, premium: 3000 };
    const premiumMap = { basic: 15, standard: 20, premium: 30 };
    
    user.plan = plan;
    user.coverage = coverageMap[plan];
    user.weeklyPremium = premiumMap[plan];
    
    await user.save();
    
    res.json({ 
      success: true, 
      user: user.toJSON() 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
