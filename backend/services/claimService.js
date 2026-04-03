const Claim = require('../models/Claim');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { getTriggerPayout } = require('./triggerService');

/**
 * Claim Service
 * Handles zero-touch claim processing and verification
 */

/**
 * Process auto-claim for a user
 */
const processAutoClaim = async (userId, triggerType, weatherData) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.active) {
      throw new Error('User not found or inactive');
    }
    
    // Calculate payout based on plan
    const payoutAmount = getTriggerPayout(triggerType, user.plan);
    
    // Fraud detection checks
    const verificationData = {
      weatherMatch: verifyWeatherMatch(triggerType, weatherData),
      locationValid: true, // Would validate GPS in production
      timestampValid: true,
      fraudScore: calculateFraudScore(user, triggerType)
    };
    
    // Determine claim status based on verification
    const isVerified = verificationData.weatherMatch && verificationData.fraudScore < 0.5;
    
    // Create claim
    const claim = new Claim({
      userId: user._id,
      trigger: getTriggerName(triggerType),
      triggerType,
      condition: getTriggerCondition(triggerType),
      amount: payoutAmount,
      status: isVerified ? 'verified' : 'pending',
      location: {
        city: user.city
      },
      verificationData,
      autoProcessed: true,
      processedAt: new Date()
    });
    
    await claim.save();
    
    // If verified, process payout immediately
    if (isVerified) {
      await processPayout(user, claim);
    }
    
    return claim;
  } catch (error) {
    console.error('Auto-claim processing error:', error);
    throw error;
  }
};

/**
 * Process payout for verified claim
 */
const processPayout = async (user, claim) => {
  try {
    // Update claim status
    claim.status = 'paid';
    claim.paidAt = new Date();
    await claim.save();
    
    // Update user wallet
    user.walletBalance += claim.amount;
    user.totalClaims += 1;
    user.totalPayouts += claim.amount;
    await user.save();
    
    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'payout',
      amount: claim.amount,
      description: `Auto-claim: ${claim.trigger}`,
      claimId: claim._id
    });
    await transaction.save();
    
    console.log(`Auto-claim processed: ${claim.trigger} - ₹${claim.amount} paid to ${user.name}`);
    
    return { claim, transaction };
  } catch (error) {
    console.error('Payout processing error:', error);
    throw error;
  }
};

/**
 * Verify weather match for trigger
 */
const verifyWeatherMatch = (triggerType, weatherData) => {
  switch (triggerType) {
    case 'rain':
      return weatherData.rainfall > 50;
    case 'aqi_high':
      return weatherData.aqi > 300;
    case 'aqi_severe':
      return weatherData.aqi > 400;
    case 'heat':
      return weatherData.temperature > 42;
    case 'curfew':
      return weatherData.curfewActive === true;
    case 'traffic':
      return weatherData.trafficDisruption === true;
    default:
      return false;
  }
};

/**
 * Calculate fraud score for claim
 */
const calculateFraudScore = (user, triggerType) => {
  let fraudScore = 0;
  
  // Check claim frequency (simplified)
  if (user.totalClaims > 10) {
    fraudScore += 0.2;
  }
  
  // Add random variation for demo
  fraudScore += Math.random() * 0.3;
  
  return Math.min(fraudScore, 1.0);
};

/**
 * Get trigger name by type
 */
const getTriggerName = (triggerType) => {
  const names = {
    rain: 'Heavy Rain',
    aqi_high: 'High AQI',
    aqi_severe: 'Severe AQI',
    heat: 'Extreme Heat',
    curfew: 'Curfew/Lockdown',
    traffic: 'Traffic Disruption'
  };
  return names[triggerType] || triggerType;
};

/**
 * Get trigger condition by type
 */
const getTriggerCondition = (triggerType) => {
  const conditions = {
    rain: 'rainfall > 50mm',
    aqi_high: 'AQI > 300',
    aqi_severe: 'AQI > 400',
    heat: 'temperature > 42°C',
    curfew: 'Government restriction active',
    traffic: 'Major traffic disruption'
  };
  return conditions[triggerType] || '';
};

/**
 * Get claims for a user
 */
const getUserClaims = async (userId, limit = 50) => {
  return await Claim.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Get claim statistics for a user
 */
const getClaimStats = async (userId) => {
  const totalClaims = await Claim.countDocuments({ userId });
  const paidClaims = await Claim.countDocuments({ userId, status: 'paid' });
  const totalPayout = await Claim.aggregate([
    { $match: { userId, status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const recentClaims = await Claim.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5);
  
  return {
    totalClaims,
    paidClaims,
    totalPayout: totalPayout[0]?.total || 0,
    recentClaims
  };
};

/**
 * Verify claim manually (for admin review)
 */
const verifyClaimManually = async (claimId, approved) => {
  const claim = await Claim.findById(claimId);
  if (!claim) {
    throw new Error('Claim not found');
  }
  
  if (approved) {
    claim.status = 'verified';
    claim.verified = true;
    
    // Process payout
    const user = await User.findById(claim.userId);
    await processPayout(user, claim);
  } else {
    claim.status = 'rejected';
  }
  
  await claim.save();
  return claim;
};

module.exports = {
  processAutoClaim,
  processPayout,
  getUserClaims,
  getClaimStats,
  verifyClaimManually,
  verifyWeatherMatch,
  calculateFraudScore
};
