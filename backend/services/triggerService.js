/**
 * Trigger Service
 * Handles automated trigger detection and processing
 */

// Trigger configuration with conditions and payouts
const TRIGGERS = {
  rain: {
    name: 'Heavy Rain',
    condition: 'rainfall > 50mm',
    check: (weather) => weather.rainfall > 50,
    payout: { basic: 150, standard: 200, premium: 300 },
    description: 'Heavy rainfall disrupting deliveries',
    icon: '🌧️'
  },
  aqi_high: {
    name: 'High AQI',
    condition: 'AQI > 300',
    check: (weather) => weather.aqi > 300,
    payout: { basic: 100, standard: 150, premium: 250 },
    description: 'Poor air quality affecting health',
    icon: '💨'
  },
  aqi_severe: {
    name: 'Severe AQI',
    condition: 'AQI > 400',
    check: (weather) => weather.aqi > 400,
    payout: { basic: 150, standard: 250, premium: 350 },
    description: 'Severe air quality emergency',
    icon: '☠️'
  },
  heat: {
    name: 'Extreme Heat',
    condition: 'temperature > 42°C',
    check: (weather) => weather.temperature > 42,
    payout: { basic: 100, standard: 150, premium: 200 },
    description: 'Extreme heat wave conditions',
    icon: '🌡️'
  },
  curfew: {
    name: 'Curfew/Lockdown',
    condition: 'Government restriction active',
    check: (weather) => weather.curfewActive,
    payout: { basic: 200, standard: 300, premium: 500 },
    description: 'Government-imposed movement restrictions',
    icon: '🚫'
  },
  traffic: {
    name: 'Traffic Disruption',
    condition: 'Major traffic disruption',
    check: (weather) => weather.trafficDisruption,
    payout: { basic: 50, standard: 100, premium: 150 },
    description: 'Major traffic disruption in area',
    icon: '🚗'
  }
};

/**
 * Check all triggers for given weather data
 */
const checkTriggers = (weatherData) => {
  const activeTriggers = [];
  
  Object.entries(TRIGGERS).forEach(([key, trigger]) => {
    if (trigger.check(weatherData)) {
      activeTriggers.push({
        type: key,
        name: trigger.name,
        condition: trigger.condition,
        payout: trigger.payout,
        description: trigger.description,
        icon: trigger.icon
      });
    }
  });
  
  return activeTriggers;
};

/**
 * Get trigger by type
 */
const getTrigger = (triggerType) => {
  return TRIGGERS[triggerType] || null;
};

/**
 * Get payout amount for a trigger based on user plan
 */
const getTriggerPayout = (triggerType, plan) => {
  const trigger = TRIGGERS[triggerType];
  if (!trigger) return 0;
  
  return trigger.payout[plan] || trigger.payout.standard;
};

/**
 * Get all available triggers
 */
const getAllTriggers = () => {
  return Object.entries(TRIGGERS).map(([key, trigger]) => ({
    type: key,
    name: trigger.name,
    condition: trigger.condition,
    payout: trigger.payout,
    description: trigger.description,
    icon: trigger.icon
  }));
};

/**
 * Calculate total potential payout for active triggers
 */
const calculateTotalPayout = (activeTriggers, plan) => {
  return activeTriggers.reduce((total, trigger) => {
    return total + (trigger.payout[plan] || trigger.payout.standard);
  }, 0);
};

module.exports = {
  TRIGGERS,
  checkTriggers,
  getTrigger,
  getTriggerPayout,
  getAllTriggers,
  calculateTotalPayout
};
