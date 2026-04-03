/**
 * Premium Service
 * Handles dynamic premium calculation with ML integration
 */

// City risk factors
const CITY_RISK_FACTORS = {
  bangalore: { risk: 'medium', factor: 1.0 },
  mumbai: { risk: 'high', factor: 1.4 },
  delhi: { risk: 'high', factor: 1.5 },
  hyderabad: { risk: 'medium', factor: 1.1 },
  chennai: { risk: 'medium', factor: 1.2 },
  pune: { risk: 'low', factor: 0.8 },
  kolkata: { risk: 'high', factor: 1.3 },
  ahmedabad: { risk: 'medium', factor: 1.0 }
};

// Season factors
const SEASON_FACTORS = {
  monsoon: 1.3,
  winter: 0.9,
  summer: 1.1,
  normal: 1.0
};

// Vehicle type factors
const VEHICLE_FACTORS = {
  bike: 1.0,
  ev: 0.85,
  scooter: 0.95,
  bicycle: 0.7
};

// Plan base premiums
const PLAN_BASE_PREMIUMS = {
  basic: 15,
  standard: 20,
  premium: 30
};

// Plan coverage amounts
const PLAN_COVERAGE = {
  basic: 1500,
  standard: 2000,
  premium: 3000
};

/**
 * Calculate dynamic premium based on multiple risk factors
 */
const calculateDynamicPremium = (basePremium, city, season, vehicleType, weatherData = null) => {
  // Get city factor
  const cityData = CITY_RISK_FACTORS[city.toLowerCase()] || { risk: 'medium', factor: 1.0 };
  
  // Get season factor
  const seasonFactor = SEASON_FACTORS[season] || 1.0;
  
  // Get vehicle factor
  const vehicleFactor = VEHICLE_FACTORS[vehicleType.toLowerCase()] || 1.0;
  
  // Calculate base multiplier
  const multiplier = cityData.factor * seasonFactor * vehicleFactor;
  
  // Weather-based adjustments
  let weatherDiscount = 0;
  let weatherRisk = 0;
  
  if (weatherData) {
    // Safe zone discount (₹2 less for safe conditions)
    if (weatherData.aqi < 100 && weatherData.rainfall === 0) {
      weatherDiscount = 2;
    }
    
    // Risk surcharge for dangerous conditions
    if (weatherData.temperature > 40) {
      weatherRisk += 2;
    }
    if (weatherData.aqi > 300) {
      weatherRisk += 3;
    }
    if (weatherData.rainfall > 50) {
      weatherRisk += 2;
    }
  }
  
  // Calculate final premium
  const dynamicPremium = basePremium * multiplier;
  const finalPremium = dynamicPremium - weatherDiscount + weatherRisk;
  const clampedPremium = Math.max(10, Math.min(50, finalPremium)); // Clamp between ₹10-50
  
  // Determine risk level
  let riskLevel = 'medium';
  if (clampedPremium < 18) riskLevel = 'low';
  else if (clampedPremium > 25) riskLevel = 'high';
  
  return {
    basePremium,
    dynamicPremium: Math.round(dynamicPremium * 100) / 100,
    weatherDiscount,
    weatherRiskSurcharge: weatherRisk,
    finalPremium: Math.round(clampedPremium * 100) / 100,
    riskLevel,
    factors: {
      city: cityData.factor,
      season: seasonFactor,
      vehicle: vehicleFactor
    },
    savings: Math.round((basePremium - clampedPremium) * 100) / 100,
    cityRisk: cityData.risk
  };
};

/**
 * Get premium quote for registration
 */
const getPremiumQuote = (city, vehicleType, plan, weatherData = null) => {
  const basePremium = PLAN_BASE_PREMIUMS[plan] || PLAN_BASE_PREMIUMS.standard;
  const season = getCurrentSeason();
  
  return calculateDynamicPremium(basePremium, city, season, vehicleType, weatherData);
};

/**
 * Get current season based on month
 */
const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 6 && month <= 9) return 'monsoon';
  if (month >= 10 || month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'summer';
  return 'normal';
};

/**
 * Get plan details
 */
const getPlanDetails = (plan) => {
  return {
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    basePremium: PLAN_BASE_PREMIUMS[plan] || PLAN_BASE_PREMIUMS.standard,
    coverage: PLAN_COVERAGE[plan] || PLAN_COVERAGE.standard
  };
};

/**
 * Get all available plans
 */
const getAllPlans = () => {
  return Object.entries(PLAN_BASE_PREMIUMS).map(([plan, premium]) => ({
    id: plan,
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    basePremium: premium,
    coverage: PLAN_COVERAGE[plan]
  }));
};

/**
 * Calculate risk level based on premium
 */
const calculateRiskLevel = (premium) => {
  if (premium < 18) return 'low';
  if (premium > 25) return 'high';
  return 'medium';
};

/**
 * Get city risk information
 */
const getCityRiskInfo = (city) => {
  return CITY_RISK_FACTORS[city.toLowerCase()] || { risk: 'medium', factor: 1.0 };
};

module.exports = {
  calculateDynamicPremium,
  getPremiumQuote,
  getCurrentSeason,
  getPlanDetails,
  getAllPlans,
  calculateRiskLevel,
  getCityRiskInfo,
  CITY_RISK_FACTORS,
  SEASON_FACTORS,
  VEHICLE_FACTORS,
  PLAN_BASE_PREMIUMS,
  PLAN_COVERAGE
};
