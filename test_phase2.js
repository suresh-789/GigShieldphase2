const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const AI_BASE = 'http://localhost:5001/api/ai';

let authToken = null;
let userId = null;

async function testHealthCheck() {
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ PASS - Health Check');
    console.log(`   Server status: ${response.data.status}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - Health Check');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testDynamicPremiumQuote() {
  try {
    const response = await axios.post(`${API_BASE}/premium/quote`, {
      city: 'bangalore',
      vehicleType: 'bike',
      plan: 'standard'
    });
    console.log('✅ PASS - Dynamic Premium Quote');
    console.log(`   Premium: ₹${response.data.quote.finalPremium}/week`);
    console.log(`   Risk Level: ${response.data.quote.riskLevel}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - Dynamic Premium Quote');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testUserRegistration() {
  try {
    const response = await axios.post(`${API_BASE}/users/register`, {
      name: 'Test Worker',
      phone: '9876543210',
      password: 'test123',
      city: 'bangalore',
      platform: 'swiggy',
      vehicleType: 'bike'
    });
    console.log('✅ PASS - User Registration');
    console.log(`   User: ${response.data.user.name}`);
    authToken = response.data.token;
    userId = response.data.user._id;
    return true;
  } catch (error) {
    console.log('❌ FAIL - User Registration');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testUserLogin() {
  try {
    const response = await axios.post(`${API_BASE}/users/login`, {
      phone: '9876543210',
      password: 'test123'
    });
    console.log('✅ PASS - User Login');
    console.log(`   Token received`);
    authToken = response.data.token;
    userId = response.data.user._id;
    return true;
  } catch (error) {
    console.log('❌ FAIL - User Login');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testWeatherDataAPI() {
  try {
    const response = await axios.get(`${API_BASE}/weather/bangalore`);
    console.log('✅ PASS - Weather Data API');
    console.log(`   Temp: ${response.data.data.temperature}°C, AQI: ${response.data.data.aqi}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - Weather Data API');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testActiveTriggersCheck() {
  try {
    const response = await axios.get(`${API_BASE}/triggers/check/bangalore`);
    console.log('✅ PASS - Active Triggers Check');
    console.log(`   Active triggers: ${response.data.triggers.length}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - Active Triggers Check');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testManualClaimSubmission() {
  try {
    const response = await axios.post(`${API_BASE}/claims/submit`, {
      triggerType: 'rain'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ PASS - Manual Claim Submission');
    console.log(`   Claim ID: ${response.data.claim._id}`);
    console.log(`   Amount: ₹${response.data.claim.amount}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - Manual Claim Submission');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testClaimsHistory() {
  try {
    const response = await axios.get(`${API_BASE}/claims`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ PASS - Claims History');
    console.log(`   Found ${response.data.claims.length} claims`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - Claims History');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testTransactionsHistory() {
  try {
    const response = await axios.get(`${API_BASE}/claims/transactions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ PASS - Transactions History');
    console.log(`   Found ${response.data.transactions.length} transactions`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - Transactions History');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testUserProfile() {
  try {
    const response = await axios.get(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ PASS - User Profile');
    console.log(`   Name: ${response.data.user.name}`);
    console.log(`   Plan: ${response.data.user.plan}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - User Profile');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testUpdateUserPlan() {
  try {
    const response = await axios.put(`${API_BASE}/users/plan`, {
      plan: 'premium'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ PASS - Update User Plan');
    console.log(`   Plan updated to: ${response.data.user.plan}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - Update User Plan');
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testAIServiceHealth() {
  try {
    const response = await axios.get(`${AI_BASE}/health`);
    console.log('✅ PASS - AI Service Health');
    console.log(`   Status: ${response.data.status}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - AI Service Health');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testAIRiskPrediction() {
  try {
    const response = await axios.post(`${AI_BASE}/predict-risk`, {
      city: 'bangalore',
      date: '2026-03-29'
    });
    console.log('✅ PASS - AI Risk Prediction');
    console.log(`   Risk Level: ${response.data.risk_level}`);
    console.log(`   Probability: ${response.data.probability}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - AI Risk Prediction');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testAIFraudDetection() {
  try {
    const response = await axios.post(`${AI_BASE}/detect-fraud`, {
      claim_data: {
        trigger_type: 'rain',
        amount: 200,
        location: { lat: 12.9716, lng: 77.5946 }
      },
      user_history: {
        total_claims: 5,
        claims_this_week: 2
      }
    });
    console.log('✅ PASS - AI Fraud Detection');
    console.log(`   Is Fraud: ${response.data.is_fraud}`);
    console.log(`   Fraud Score: ${response.data.fraud_score}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - AI Fraud Detection');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testAIDynamicPremium() {
  try {
    const response = await axios.post(`${AI_BASE}/calculate-premium`, {
      base_premium: 20,
      city: 'bangalore',
      season: 'normal',
      vehicle_type: 'bike',
      weather_data: { temperature: 28, aqi: 75, rainfall: 0 }
    });
    console.log('✅ PASS - AI Dynamic Premium');
    console.log(`   Final Premium: ₹${response.data.final_premium}`);
    console.log(`   Risk Level: ${response.data.risk_level}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - AI Dynamic Premium');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testAI7DayForecast() {
  try {
    const response = await axios.post(`${AI_BASE}/forecast`, {
      city: 'bangalore'
    });
    console.log('✅ PASS - AI 7-Day Forecast');
    console.log(`   Forecast days: ${response.data.forecast.length}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - AI 7-Day Forecast');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testAIClaimVerification() {
  try {
    const response = await axios.post(`${AI_BASE}/verify-claim`, {
      claim_data: {
        trigger_type: 'rain',
        amount: 200,
        location: { lat: 12.9716, lng: 77.5946 }
      },
      weather_data: { temperature: 28, aqi: 75, rainfall: 60 }
    });
    console.log('✅ PASS - AI Claim Verification');
    console.log(`   Is Verified: ${response.data.is_verified}`);
    console.log(`   Verification Score: ${response.data.verification_score}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - AI Claim Verification');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testAIRecommendations() {
  try {
    const response = await axios.post(`${AI_BASE}/recommendations`, {
      city: 'bangalore',
      weather_data: { temperature: 28, aqi: 75, rainfall: 0 }
    });
    console.log('✅ PASS - AI Recommendations');
    console.log(`   Recommendations: ${response.data.recommendations.length}`);
    return true;
  } catch (error) {
    console.log('❌ FAIL - AI Recommendations');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('========================================');
  console.log('GigShield AI - Phase 2 Test Suite');
  console.log('========================================\n');

  const results = [];
  
  results.push(await testHealthCheck());
  results.push(await testDynamicPremiumQuote());
  results.push(await testUserRegistration());
  results.push(await testUserLogin());
  results.push(await testWeatherDataAPI());
  results.push(await testActiveTriggersCheck());
  results.push(await testManualClaimSubmission());
  results.push(await testClaimsHistory());
  results.push(await testTransactionsHistory());
  results.push(await testUserProfile());
  results.push(await testUpdateUserPlan());
  results.push(await testAIServiceHealth());
  results.push(await testAIRiskPrediction());
  results.push(await testAIFraudDetection());
  results.push(await testAIDynamicPremium());
  results.push(await testAI7DayForecast());
  results.push(await testAIClaimVerification());
  results.push(await testAIRecommendations());

  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;

  console.log('\n========================================');
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  } else {
    console.log('✅ All tests passed! Phase 2 implementation is complete.');
  }
}

runAllTests().catch(console.error);
