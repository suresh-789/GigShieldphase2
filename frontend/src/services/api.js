/**
 * Central API Service
 * Handles all API calls with consistent error handling
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Generic fetch wrapper with error handling
 */
const fetchApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

/**
 * Weather API
 */
export const weatherApi = {
  getWeather: (city) => fetchApi(`/api/weather/${city}`),
  getWeatherHistory: (city, days = 7) => fetchApi(`/api/weather/${city}/history?days=${days}`),
}

/**
 * Triggers API
 */
export const triggersApi = {
  checkTriggers: (city) => fetchApi(`/api/triggers/check/${city}`),
  getAllTriggers: () => fetchApi('/api/triggers/all'),
}

/**
 * Claims API
 */
export const claimsApi = {
  getClaims: (token) => fetchApi('/api/claims', {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  getClaimStats: (token) => fetchApi('/api/claims/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  submitClaim: (triggerType, token) => fetchApi('/api/claims/submit', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ triggerType })
  }),
  getTransactions: (token) => fetchApi('/api/transactions', {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
}

/**
 * Users API
 */
export const usersApi = {
  register: (userData) => fetchApi('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  login: (phone, password) => fetchApi('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password })
  }),
  loginOtp: (phone) => fetchApi('/api/users/login-otp', {
    method: 'POST',
    body: JSON.stringify({ phone })
  }),
  getProfile: (token) => fetchApi('/api/users/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  updatePlan: (plan, token) => fetchApi('/api/users/plan', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ plan })
  }),
}

/**
 * Premium API
 */
export const premiumApi = {
  getQuote: (city, vehicleType, plan) => fetchApi('/api/premium/quote', {
    method: 'POST',
    body: JSON.stringify({ city, vehicleType, plan })
  }),
}

/**
 * AI API
 */
export const aiApi = {
  predictRisk: (city, date) => fetchApi('/api/ai/predict-risk', {
    method: 'POST',
    body: JSON.stringify({ city, date })
  }),
  detectFraud: (claimData, userHistory) => fetchApi('/api/ai/detect-fraud', {
    method: 'POST',
    body: JSON.stringify({ claim_data: claimData, user_history: userHistory })
  }),
  calculatePremium: (basePremium, city, season, vehicleType, weatherData) => 
    fetchApi('/api/ai/calculate-premium', {
      method: 'POST',
      body: JSON.stringify({ 
        base_premium: basePremium, 
        city, 
        season, 
        vehicle_type: vehicleType, 
        weather_data: weatherData 
      })
  }),
  getForecast: (city) => fetchApi('/api/ai/forecast', {
    method: 'POST',
    body: JSON.stringify({ city })
  }),
  verifyClaim: (claimData, weatherData) => fetchApi('/api/ai/verify-claim', {
    method: 'POST',
    body: JSON.stringify({ claim_data: claimData, weather_data: weatherData })
  }),
  getRecommendations: (city, weatherData) => fetchApi('/api/ai/recommendations', {
    method: 'POST',
    body: JSON.stringify({ city, weather_data: weatherData })
  }),
}

export default {
  weather: weatherApi,
  triggers: triggersApi,
  claims: claimsApi,
  users: usersApi,
  premium: premiumApi,
  ai: aiApi,
}
