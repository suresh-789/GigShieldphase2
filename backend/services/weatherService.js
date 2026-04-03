const WeatherLog = require('../models/WeatherLog');

/**
 * Weather Service
 * Handles weather data fetching and logging
 */

// City-specific base weather patterns
const CITY_WEATHER_PATTERNS = {
  bangalore: { baseTemp: 28, baseAqi: 120 },
  mumbai: { baseTemp: 32, baseAqi: 180 },
  delhi: { baseTemp: 35, baseAqi: 250 },
  hyderabad: { baseTemp: 33, baseAqi: 140 },
  chennai: { baseTemp: 34, baseAqi: 130 },
  pune: { baseTemp: 30, baseAqi: 100 },
  kolkata: { baseTemp: 31, baseAqi: 200 },
  ahmedabad: { baseTemp: 36, baseAqi: 160 }
};

/**
 * Get weather data for a city
 * In production, this would call real weather APIs
 * For demo, we simulate realistic weather data
 */
const getWeatherData = async (city) => {
  const pattern = CITY_WEATHER_PATTERNS[city.toLowerCase()] || { baseTemp: 30, baseAqi: 150 };
  
  // Simulate realistic weather variations
  const temperature = pattern.baseTemp + Math.floor(Math.random() * 10) - 5;
  const aqi = Math.max(50, pattern.baseAqi + Math.floor(Math.random() * 100) - 50);
  const rainfall = Math.random() > 0.7 ? Math.floor(Math.random() * 100) : 0;
  const humidity = Math.floor(Math.random() * 40) + 40;
  const windSpeed = Math.floor(Math.random() * 30) + 5;
  const curfewActive = Math.random() > 0.95;
  const trafficDisruption = Math.random() > 0.85;
  
  return {
    city,
    temperature,
    aqi,
    rainfall,
    humidity,
    windSpeed,
    curfewActive,
    trafficDisruption,
    timestamp: new Date().toISOString()
  };
};

/**
 * Log weather data to database
 */
const logWeatherData = async (weatherData) => {
  try {
    const weatherLog = new WeatherLog(weatherData);
    await weatherLog.save();
    return weatherLog;
  } catch (error) {
    console.error('Weather logging error:', error);
    throw error;
  }
};

/**
 * Get weather history for a city
 */
const getWeatherHistory = async (city, days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await WeatherLog.find({
    city: city.toLowerCase(),
    timestamp: { $gte: startDate }
  }).sort({ timestamp: -1 });
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
 * Calculate weather-based risk score
 */
const calculateWeatherRisk = (weatherData) => {
  let riskScore = 0;
  
  if (weatherData.temperature > 40) riskScore += 0.3;
  if (weatherData.aqi > 300) riskScore += 0.3;
  if (weatherData.rainfall > 50) riskScore += 0.2;
  if (weatherData.curfewActive) riskScore += 0.5;
  if (weatherData.trafficDisruption) riskScore += 0.1;
  
  return Math.min(riskScore, 1.0);
};

module.exports = {
  getWeatherData,
  logWeatherData,
  getWeatherHistory,
  getCurrentSeason,
  calculateWeatherRisk,
  CITY_WEATHER_PATTERNS
};
