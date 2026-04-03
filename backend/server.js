const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

console.log("🚀 SERVER FILE LOADED");

// Load environment variables
dotenv.config();

// Import middleware
const { requestLogger, errorHandler, notFoundHandler } = require('./middleware/auth');

// Import routes
const userRoutes = require('./routes/userRoutes');
const claimRoutes = require('./routes/claimRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const triggerRoutes = require('./routes/triggerRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Import services
const { getWeatherData, logWeatherData } = require('./services/weatherService');
const { checkTriggers } = require('./services/triggerService');
const { processAutoClaim } = require('./services/claimService');

// Import models
const User = require('./models/User');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ============================================
// DATABASE CONNECTION
// ============================================

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'GigShield AI Backend'
  });
});

// User routes
app.use('/api/users', userRoutes);

// Claim routes
app.use('/api/claims', claimRoutes);

// Transaction routes (direct access)
app.get('/api/transactions', async (req, res) => {
  try {
    const Transaction = require('./models/Transaction');
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(50);
    
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

// Weather routes
app.use('/api/weather', weatherRoutes);

// Trigger routes
app.use('/api/triggers', triggerRoutes);

// Premium routes
app.use('/api/premium', premiumRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// ============================================
// AUTOMATED MONITORING SYSTEM (Cron Jobs)
// ============================================

/**
 * Check conditions every 15 minutes and auto-process claims
 * This is the core of the zero-touch claims system
 */
cron.schedule('*/15 * * * *', async () => {
  console.log('⏰ Running automated trigger check...');
  try {
    const activeUsers = await User.find({ active: true });
    
    for (const user of activeUsers) {
      const weatherData = await getWeatherData(user.city);
      const activeTriggers = checkTriggers(weatherData);
      
      // Process each active trigger
      for (const trigger of activeTriggers) {
        // Check if claim already exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const Claim = require('./models/Claim');
        const existingClaim = await Claim.findOne({
          userId: user._id,
          triggerType: trigger.type,
          createdAt: { $gte: today }
        });
        
        if (!existingClaim) {
          // Auto-process new claim
          await processAutoClaim(user._id, trigger.type, weatherData);
        }
      }
    }
    
    console.log(`✅ Checked ${activeUsers.length} users for triggers`);
  } catch (error) {
    console.error('❌ Automated trigger check error:', error);
  }
});

/**
 * Log weather data every hour for all cities
 */
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Logging weather data...');
  try {
    const cities = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune'];
    
    for (const city of cities) {
      const weatherData = await getWeatherData(city);
      await logWeatherData(weatherData);
    }
    
    console.log('✅ Weather data logged for all cities');
  } catch (error) {
    console.error('❌ Weather logging error:', error);
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║                                                            ║
  ║   🛡️  GigShield AI Server Running                         ║
  ║                                                            ║
  ║   Port: ${PORT}                                           ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}   ║
  ║                                                            ║
  ║   ✅ Automated trigger system active                       ║
  ║   ✅ Zero-touch claims processing enabled                  ║
  ║   ✅ Real-time weather monitoring active                   ║
  ║                                                            ║
  ╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
