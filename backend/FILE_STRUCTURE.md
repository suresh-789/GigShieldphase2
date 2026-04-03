# GigShield AI - Backend File Structure

## 📁 Project Structure

```
backend/
├── server.js                 # Main application entry point
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables
│
├── models/                  # Database models
│   ├── User.js             # User schema and methods
│   ├── Claim.js            # Claim schema and indexes
│   ├── Transaction.js      # Transaction schema
│   └── WeatherLog.js       # Weather data logging schema
│
├── routes/                  # API route handlers
│   ├── userRoutes.js       # User registration, login, profile
│   ├── claimRoutes.js      # Claims management
│   └── weatherRoutes.js    # Weather, triggers, premium
│
├── middleware/              # Express middleware
│   └── auth.js             # Authentication, rate limiting, error handling
│
├── services/                # Business logic services
│   ├── weatherService.js   # Weather data fetching and logging
│   ├── triggerService.js   # Automated trigger detection
│   ├── claimService.js     # Zero-touch claims processing
│   └── premiumService.js   # Dynamic premium calculation
│
└── ai/                      # AI/ML models
    └── risks_model.py      # Risk prediction, fraud detection, pricing
```

---

## 📋 File Descriptions

### 🗄️ Models

#### [`User.js`](models/User.js)

User schema with fields:

- `name`, `phone`, `password` (hashed)
- `city`, `platform`, `vehicleType`
- `plan` (basic/standard/premium)
- `coverage`, `riskLevel`, `weeklyPremium`
- `walletBalance`, `totalClaims`, `totalPayouts`
- Methods: `comparePassword()`, `toJSON()`

#### [`Claim.js`](models/Claim.js)

Claim schema with fields:

- `userId`, `trigger`, `triggerType`, `condition`
- `amount`, `status` (pending/processing/verified/paid/rejected)
- `location`, `verified`, `verificationData`
- `autoProcessed`, `processedAt`, `paidAt`
- Indexes for faster queries

#### [`Transaction.js`](models/Transaction.js)

Transaction schema with fields:

- `userId`, `type` (payment/payout/refund)
- `amount`, `status`, `description`
- `claimId` (reference to claim)

#### [`WeatherLog.js`](models/WeatherLog.js)

Weather logging schema with fields:

- `city`, `temperature`, `aqi`, `rainfall`
- `humidity`, `windSpeed`
- `curfewActive`, `trafficDisruption`
- `timestamp`

---

### 🛣️ Routes

#### [`userRoutes.js`](routes/userRoutes.js)

User management endpoints:

- `POST /api/users/register` - Register with dynamic premium
- `POST /api/users/request-otp` - Request OTP for login
- `POST /api/users/login` - Login with password
- `POST /api/users/login-otp` - Login with OTP
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/plan` - Update user plan (protected)

#### [`claimRoutes.js`](routes/claimRoutes.js)

Claims management endpoints:

- `GET /api/claims` - Get user claims (protected)
- `GET /api/claims/stats` - Get claim statistics (protected)
- `POST /api/claims/submit` - Submit manual claim (protected)
- `GET /api/transactions` - Get user transactions (protected)

#### [`weatherRoutes.js`](routes/weatherRoutes.js)

Weather and trigger endpoints:

- `GET /api/weather/:city` - Get weather data
- `GET /api/weather/:city/history` - Get weather history
- `GET /api/triggers/check/:city` - Check active triggers
- `GET /api/triggers/all` - Get all available triggers
- `POST /api/premium/quote` - Get dynamic premium quote

---

### 🔧 Middleware

#### [`auth.js`](middleware/auth.js)

Authentication and utility middleware:

- `authenticateToken` - JWT token verification
- `authLimiter` - Rate limiting for login attempts
- `otpLimiter` - Rate limiting for OTP requests
- `requestLogger` - Logs all incoming requests
- `errorHandler` - Global error handling
- `notFoundHandler` - 404 error handling

---

### 🛠️ Services

#### [`weatherService.js`](services/weatherService.js)

Weather data management:

- `getWeatherData(city)` - Fetch weather data (simulated)
- `logWeatherData(data)` - Log weather to database
- `getWeatherHistory(city, days)` - Get historical data
- `getCurrentSeason()` - Determine current season
- `calculateWeatherRisk(data)` - Calculate risk score

#### [`triggerService.js`](services/triggerService.js)

Automated trigger system:

- `TRIGGERS` - Configuration for 6 triggers
- `checkTriggers(weather)` - Check active triggers
- `getTrigger(type)` - Get trigger by type
- `getTriggerPayout(type, plan)` - Get payout amount
- `getAllTriggers()` - List all triggers
- `calculateTotalPayout(triggers, plan)` - Total potential payout

#### [`claimService.js`](services/claimService.js)

Zero-touch claims processing:

- `processAutoClaim(userId, trigger, weather)` - Auto-process claim
- `processPayout(user, claim)` - Process instant payout
- `verifyWeatherMatch(trigger, weather)` - Verify conditions
- `calculateFraudScore(user, trigger)` - Fraud detection
- `getUserClaims(userId)` - Get user claims
- `getClaimStats(userId)` - Get claim statistics
- `verifyClaimManually(claimId, approved)` - Manual verification

#### [`premiumService.js`](services/premiumService.js)

Dynamic premium calculation:

- `calculateDynamicPremium(base, city, season, vehicle, weather)` - Calculate premium
- `getPremiumQuote(city, vehicle, plan, weather)` - Get quote
- `getCurrentSeason()` - Get current season
- `getPlanDetails(plan)` - Get plan information
- `getAllPlans()` - List all plans
- `calculateRiskLevel(premium)` - Determine risk level
- `getCityRiskInfo(city)` - Get city risk data

---

### 🤖 AI/ML

#### [`risks_model.py`](ai/risks_model.py)

Machine learning models:

- `GigShieldAI` - Main AI class
- `train_risk_model()` - Train risk prediction model
- `predict_risk(city, date, weather)` - Predict risk level
- `train_fraud_detection_model()` - Train fraud detection
- `detect_fraud(claim_data)` - Detect fraudulent claims
- `train_pricing_model()` - Train dynamic pricing model
- `calculate_dynamic_premium()` - Calculate personalized premium
- `verify_claim()` - AI-powered claim verification
- `get_7day_forecast()` - Generate 7-day risk forecast

Flask API endpoints:

- `POST /api/ai/predict-risk` - Risk prediction
- `POST /api/ai/detect-fraud` - Fraud detection
- `POST /api/ai/calculate-premium` - Premium calculation
- `POST /api/ai/verify-claim` - Claim verification
- `POST /api/ai/forecast` - 7-day forecast
- `POST /api/ai/recommendations` - Personalized recommendations

---

## 🔄 Data Flow

### Registration Flow

```
User Request → userRoutes.js → premiumService.js → weatherService.js
    ↓
Calculate Dynamic Premium → Save User → Generate JWT → Response
```

### Claim Processing Flow

```
Cron Job (15 min) → weatherService.js → triggerService.js
    ↓
Check Active Triggers → claimService.js → processAutoClaim()
    ↓
Verify Conditions → Process Payout → Update Wallet → Log Transaction
```

### Weather Monitoring Flow

```
Cron Job (1 hour) → weatherService.js → getWeatherData()
    ↓
Log to Database → Available for API Queries
```

---

## 🚀 Key Features

### 1. Modular Architecture

- Separation of concerns (models, routes, services, middleware)
- Easy to maintain and scale
- Clear dependency injection

### 2. Automated Trigger System

- 6 automated triggers (rain, AQI, heat, curfew, traffic)
- 15-minute monitoring cycle
- Auto-claim processing

### 3. Zero-Touch Claims

- Fully automated from detection to payout
- AI-powered verification
- Instant wallet credit

### 4. Dynamic Premium Calculation

- ML-powered pricing
- Hyper-local risk factors
- Weather-based discounts

### 5. Real-time Monitoring

- Hourly weather logging
- Live trigger detection
- Instant notifications

---

## 📊 API Endpoints Summary

| Method | Endpoint                  | Description         | Auth |
| ------ | ------------------------- | ------------------- | ---- |
| POST   | /api/users/register       | Register user       | No   |
| POST   | /api/users/login          | Login with password | No   |
| POST   | /api/users/login-otp      | Login with OTP      | No   |
| GET    | /api/users/profile        | Get profile         | Yes  |
| PUT    | /api/users/plan           | Update plan         | Yes  |
| GET    | /api/claims               | Get claims          | Yes  |
| GET    | /api/claims/stats         | Get statistics      | Yes  |
| POST   | /api/claims/submit        | Submit claim        | Yes  |
| GET    | /api/transactions         | Get transactions    | Yes  |
| GET    | /api/weather/:city        | Get weather         | No   |
| GET    | /api/triggers/check/:city | Check triggers      | No   |
| POST   | /api/premium/quote        | Get premium quote   | No   |

---

_Built with ❤️ for India's Gig Economy_
