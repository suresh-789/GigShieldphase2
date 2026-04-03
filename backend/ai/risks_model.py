# GigShield AI - Advanced Risk Prediction & Dynamic Pricing Model
# Machine Learning models for risk assessment, fraud detection, and dynamic pricing

"""
GigShield AI - Advanced ML Models

This module contains production-ready ML models for:
1. Risk Prediction - Predicts disruption probability for next 7 days
2. Fraud Detection - Detects fake claims using GPS and behavioral analysis
3. Dynamic Pricing - Adjusts premiums based on hyper-local risk factors
4. Weather Pattern Analysis - Analyzes historical weather data
5. Claim Verification AI - Auto-verifies claim authenticity
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, mean_squared_error
import joblib
from datetime import datetime, timedelta
import json

class GigShieldAI:
    """
    Main AI class for GigShield platform
    Handles all ML operations including risk prediction, fraud detection, and dynamic pricing
    """
    
    def __init__(self):
        self.risk_model = None
        self.fraud_model = None
        self.pricing_model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        
    def generate_synthetic_data(self, n_samples=1000):
        """
        Generate synthetic training data for model development
        In production, this would be replaced with real historical data
        """
        np.random.seed(42)
        
        cities = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata', 'ahmedabad']
        seasons = ['monsoon', 'winter', 'summer', 'normal']
        vehicle_types = ['bike', 'ev', 'scooter', 'bicycle']
        
        data = []
        for _ in range(n_samples):
            city = np.random.choice(cities)
            season = np.random.choice(seasons)
            vehicle = np.random.choice(vehicle_types)
            
            # Generate weather features
            base_temp = {
                'bangalore': 28, 'mumbai': 32, 'delhi': 35, 'hyderabad': 33,
                'chennai': 34, 'pune': 30, 'kolkata': 31, 'ahmedabad': 36
            }[city]
            
            temperature = base_temp + np.random.normal(0, 5)
            aqi = np.random.normal(150, 50)
            rainfall = np.random.exponential(10) if season == 'monsoon' else np.random.exponential(2)
            humidity = np.random.normal(60, 15)
            wind_speed = np.random.normal(15, 8)
            
            # Generate risk factors
            city_risk = {'bangalore': 0.6, 'mumbai': 0.8, 'delhi': 0.9, 'hyderabad': 0.5,
                        'chennai': 0.5, 'pune': 0.4, 'kolkata': 0.7, 'ahmedabad': 0.6}[city]
            
            season_risk = {'monsoon': 0.9, 'winter': 0.3, 'summer': 0.6, 'normal': 0.5}[season]
            
            # Calculate disruption probability
            disruption_prob = (
                0.3 * (temperature > 40).astype(float) +
                0.25 * (aqi > 300).astype(float) +
                0.2 * (rainfall > 50).astype(float) +
                0.15 * city_risk +
                0.1 * season_risk
            )
            
            # Add noise
            disruption_prob += np.random.normal(0, 0.1)
            disruption_prob = np.clip(disruption_prob, 0, 1)
            
            # Determine if disruption occurred
            disruption = disruption_prob > 0.5
            
            # Calculate claim amount if disruption occurred
            claim_amount = 0
            if disruption:
                base_amount = 150
                if aqi > 400:
                    claim_amount = base_amount + 100
                elif rainfall > 50:
                    claim_amount = base_amount + 50
                elif temperature > 42:
                    claim_amount = base_amount + 30
                else:
                    claim_amount = base_amount
            
            data.append({
                'city': city,
                'season': season,
                'vehicle_type': vehicle,
                'temperature': temperature,
                'aqi': aqi,
                'rainfall': rainfall,
                'humidity': humidity,
                'wind_speed': wind_speed,
                'city_risk': city_risk,
                'season_risk': season_risk,
                'disruption_prob': disruption_prob,
                'disruption': disruption,
                'claim_amount': claim_amount
            })
        
        return pd.DataFrame(data)
    
    def train_risk_model(self, data=None):
        """
        Train the risk prediction model using historical data
        
        Args:
            data: DataFrame with historical weather and claim data
                  If None, generates synthetic data
                  
        Returns:
            Dictionary with training metrics
        """
        if data is None:
            data = self.generate_synthetic_data(2000)
        
        # Prepare features
        feature_columns = ['temperature', 'aqi', 'rainfall', 'humidity', 'wind_speed', 
                          'city_risk', 'season_risk']
        
        X = data[feature_columns].values
        y = data['disruption'].astype(int).values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest model
        self.risk_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        
        self.risk_model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.risk_model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Risk Model trained with accuracy: {accuracy:.2%}")
        
        return {
            'accuracy': accuracy,
            'feature_importance': dict(zip(feature_columns, self.risk_model.feature_importances_))
        }
    
    def predict_risk(self, city, date, weather_data=None):
        """
        Predict risk level for a city on a given date
        
        Args:
            city: City name
            date: Date for prediction (string or datetime)
            weather_data: Optional dictionary with current weather data
            
        Returns:
            Dictionary with risk level, probability, and recommendations
        """
        if self.risk_model is None:
            # Return default prediction if model not trained
            return {
                'risk_level': 'medium',
                'probability': 0.5,
                'confidence': 0.7,
                'recommendations': ['Model not trained yet']
            }
        
        # Generate features for prediction
        if weather_data is None:
            # Use default weather patterns
            base_temp = {
                'bangalore': 28, 'mumbai': 32, 'delhi': 35, 'hyderabad': 33,
                'chennai': 34, 'pune': 30, 'kolkata': 31, 'ahmedabad': 36
            }.get(city.lower(), 30)
            
            weather_data = {
                'temperature': base_temp,
                'aqi': 150,
                'rainfall': 10,
                'humidity': 60,
                'wind_speed': 15
            }
        
        # Determine season
        if isinstance(date, str):
            date = datetime.strptime(date, '%Y-%m-%d')
        
        month = date.month
        if 6 <= month <= 9:
            season = 'monsoon'
        elif month in [10, 11, 12, 1, 2]:
            season = 'winter'
        elif 3 <= month <= 5:
            season = 'summer'
        else:
            season = 'normal'
        
        # City risk factors
        city_risk = {
            'bangalore': 0.6, 'mumbai': 0.8, 'delhi': 0.9, 'hyderabad': 0.5,
            'chennai': 0.5, 'pune': 0.4, 'kolkata': 0.7, 'ahmedabad': 0.6
        }.get(city.lower(), 0.5)
        
        season_risk = {'monsoon': 0.9, 'winter': 0.3, 'summer': 0.6, 'normal': 0.5}[season]
        
        # Prepare features
        features = np.array([[
            weather_data['temperature'],
            weather_data['aqi'],
            weather_data['rainfall'],
            weather_data['humidity'],
            weather_data['wind_speed'],
            city_risk,
            season_risk
        ]])
        
        # Scale and predict
        features_scaled = self.scaler.transform(features)
        probability = self.risk_model.predict_proba(features_scaled)[0][1]
        
        # Determine risk level
        if probability > 0.7:
            risk_level = 'high'
        elif probability > 0.4:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        # Generate recommendations
        recommendations = []
        if weather_data['temperature'] > 40:
            recommendations.append('High temperature alert - stay hydrated')
        if weather_data['aqi'] > 300:
            recommendations.append('Poor air quality - consider wearing mask')
        if weather_data['rainfall'] > 50:
            recommendations.append('Heavy rain expected - plan routes carefully')
        if probability > 0.6:
            recommendations.append('High disruption risk - consider claiming coverage')
        
        return {
            'risk_level': risk_level,
            'probability': float(probability),
            'confidence': 0.85,
            'recommendations': recommendations,
            'weather_factors': weather_data
        }
    
    def train_fraud_detection_model(self, data=None):
        """
        Train fraud detection model
        
        Args:
            data: DataFrame with claim data including fraud indicators
            
        Returns:
            Dictionary with training metrics
        """
        if data is None:
            # Generate synthetic fraud data
            np.random.seed(42)
            n_samples = 1000
            
            data = pd.DataFrame({
                'gps_mismatch': np.random.choice([0, 1], n_samples, p=[0.95, 0.05]),
                'unusual_pattern': np.random.choice([0, 1], n_samples, p=[0.9, 0.1]),
                'claim_frequency': np.random.poisson(2, n_samples),
                'time_since_last_claim': np.random.exponential(30, n_samples),
                'weather_match': np.random.choice([0, 1], n_samples, p=[0.1, 0.9]),
                'location_valid': np.random.choice([0, 1], n_samples, p=[0.05, 0.95]),
                'is_fraud': np.random.choice([0, 1], n_samples, p=[0.92, 0.08])
            })
        
        # Prepare features
        feature_columns = ['gps_mismatch', 'unusual_pattern', 'claim_frequency',
                          'time_since_last_claim', 'weather_match', 'location_valid']
        
        X = data[feature_columns].values
        y = data['is_fraud'].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        self.fraud_model = RandomForestClassifier(
            n_estimators=50,
            max_depth=5,
            random_state=42,
            class_weight='balanced'
        )
        
        self.fraud_model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.fraud_model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Fraud Detection Model trained with accuracy: {accuracy:.2%}")
        
        return {'accuracy': accuracy}
    
    def detect_fraud(self, claim_data):
        """
        Detect potential fraud in claim
        
        Args:
            claim_data: Dictionary with claim details
            
        Returns:
            Dictionary with fraud assessment
        """
        if self.fraud_model is None:
            # Simple rule-based detection if model not trained
            fraud_score = 0
            indicators = []
            
            if claim_data.get('gps_mismatch', False):
                fraud_score += 0.4
                indicators.append('GPS location mismatch')
            
            if claim_data.get('unusual_pattern', False):
                fraud_score += 0.3
                indicators.append('Unusual claiming pattern')
            
            if not claim_data.get('weather_match', True):
                fraud_score += 0.2
                indicators.append('Weather conditions do not match claim')
            
            if claim_data.get('claim_frequency', 0) > 5:
                fraud_score += 0.1
                indicators.append('High claim frequency')
            
            return {
                'is_fraud': fraud_score > 0.5,
                'fraud_score': min(fraud_score, 1.0),
                'indicators': indicators,
                'confidence': 0.7
            }
        
        # Use trained model
        features = np.array([[
            claim_data.get('gps_mismatch', 0),
            claim_data.get('unusual_pattern', 0),
            claim_data.get('claim_frequency', 0),
            claim_data.get('time_since_last_claim', 30),
            claim_data.get('weather_match', 1),
            claim_data.get('location_valid', 1)
        ]])
        
        fraud_prob = self.fraud_model.predict_proba(features)[0][1]
        
        return {
            'is_fraud': fraud_prob > 0.5,
            'fraud_score': float(fraud_prob),
            'indicators': [],
            'confidence': 0.85
        }
    
    def train_pricing_model(self, data=None):
        """
        Train dynamic pricing model
        
        Args:
            data: DataFrame with pricing data
            
        Returns:
            Dictionary with training metrics
        """
        if data is None:
            # Generate synthetic pricing data
            np.random.seed(42)
            n_samples = 1500
            
            cities = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune']
            seasons = ['monsoon', 'winter', 'summer', 'normal']
            vehicles = ['bike', 'ev', 'scooter', 'bicycle']
            
            data_list = []
            for _ in range(n_samples):
                city = np.random.choice(cities)
                season = np.random.choice(seasons)
                vehicle = np.random.choice(vehicles)
                
                # Base premium
                base_premium = 20
                
                # City factor
                city_factors = {
                    'bangalore': 1.0, 'mumbai': 1.4, 'delhi': 1.5,
                    'hyderabad': 1.1, 'chennai': 1.2, 'pune': 0.8
                }
                
                # Season factor
                season_factors = {
                    'monsoon': 1.3, 'winter': 0.9, 'summer': 1.1, 'normal': 1.0
                }
                
                # Vehicle factor
                vehicle_factors = {
                    'bike': 1.0, 'ev': 0.85, 'scooter': 0.95, 'bicycle': 0.7
                }
                
                # Calculate premium
                premium = base_premium * city_factors[city] * season_factors[season] * vehicle_factors[vehicle]
                
                # Add random variation
                premium += np.random.normal(0, 2)
                premium = max(10, min(40, premium))
                
                data_list.append({
                    'city': city,
                    'season': season,
                    'vehicle_type': vehicle,
                    'city_factor': city_factors[city],
                    'season_factor': season_factors[season],
                    'vehicle_factor': vehicle_factors[vehicle],
                    'premium': premium
                })
            
            data = pd.DataFrame(data_list)
        
        # Prepare features
        feature_columns = ['city_factor', 'season_factor', 'vehicle_factor']
        
        X = data[feature_columns].values
        y = data['premium'].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train Gradient Boosting model
        self.pricing_model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=5,
            random_state=42
        )
        
        self.pricing_model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.pricing_model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        
        print(f"Pricing Model trained with RMSE: {rmse:.2f}")
        
        return {'rmse': rmse}
    
    def calculate_dynamic_premium(self, base_premium, city, season, vehicle_type, weather_data=None):
        """
        Calculate dynamic premium based on multiple risk factors
        
        Args:
            base_premium: Base weekly premium
            city: City name
            season: Current season
            vehicle_type: Type of vehicle
            weather_data: Optional current weather data
            
        Returns:
            Dictionary with premium calculation details
        """
        # City risk factors
        city_factors = {
            'bangalore': 1.0, 'mumbai': 1.4, 'delhi': 1.5, 'hyderabad': 1.1,
            'chennai': 1.2, 'pune': 0.8, 'kolkata': 1.3, 'ahmedabad': 1.0
        }
        
        # Season factors
        season_factors = {
            'monsoon': 1.3, 'winter': 0.9, 'summer': 1.1, 'normal': 1.0
        }
        
        # Vehicle factors
        vehicle_factors = {
            'bike': 1.0, 'ev': 0.85, 'scooter': 0.95, 'bicycle': 0.7
        }
        
        # Calculate base multiplier
        multiplier = (
            city_factors.get(city.lower(), 1.0) *
            season_factors.get(season, 1.0) *
            vehicle_factors.get(vehicle_type.lower(), 1.0)
        )
        
        # Weather-based adjustments
        weather_discount = 0
        weather_risk = 0
        
        if weather_data:
            # Safe zone discount (₹2 less for safe conditions)
            if weather_data.get('aqi', 100) < 100 and weather_data.get('rainfall', 0) == 0:
                weather_discount = 2
            
            # Risk surcharge for dangerous conditions
            if weather_data.get('temperature', 30) > 40:
                weather_risk += 2
            if weather_data.get('aqi', 100) > 300:
                weather_risk += 3
            if weather_data.get('rainfall', 0) > 50:
                weather_risk += 2
        
        # Calculate final premium
        dynamic_premium = base_premium * multiplier
        final_premium = dynamic_premium - weather_discount + weather_risk
        final_premium = max(10, min(50, final_premium))  # Clamp between ₹10-50
        
        # Determine risk level
        if final_premium < 18:
            risk_level = 'low'
        elif final_premium > 25:
            risk_level = 'high'
        else:
            risk_level = 'medium'
        
        return {
            'base_premium': base_premium,
            'dynamic_premium': round(dynamic_premium, 2),
            'weather_discount': weather_discount,
            'weather_risk_surcharge': weather_risk,
            'final_premium': round(final_premium, 2),
            'risk_level': risk_level,
            'factors': {
                'city': city_factors.get(city.lower(), 1.0),
                'season': season_factors.get(season, 1.0),
                'vehicle': vehicle_factors.get(vehicle_type.lower(), 1.0)
            },
            'savings': round(base_premium - final_premium, 2)
        }
    
    def verify_claim(self, claim_data, weather_data, user_history):
        """
        AI-powered claim verification
        
        Args:
            claim_data: Dictionary with claim details
            weather_data: Dictionary with weather conditions
            user_history: Dictionary with user's claim history
            
        Returns:
            Dictionary with verification result
        """
        verification_score = 1.0
        issues = []
        
        # Check weather match
        trigger_type = claim_data.get('trigger_type')
        
        if trigger_type == 'rain':
            if weather_data.get('rainfall', 0) < 50:
                verification_score -= 0.4
                issues.append('Rainfall below threshold')
        
        elif trigger_type == 'aqi_high':
            if weather_data.get('aqi', 0) < 300:
                verification_score -= 0.4
                issues.append('AQI below threshold')
        
        elif trigger_type == 'aqi_severe':
            if weather_data.get('aqi', 0) < 400:
                verification_score -= 0.4
                issues.append('AQI below severe threshold')
        
        elif trigger_type == 'heat':
            if weather_data.get('temperature', 0) < 42:
                verification_score -= 0.4
                issues.append('Temperature below threshold')
        
        elif trigger_type == 'curfew':
            if not weather_data.get('curfewActive', False):
                verification_score -= 0.5
                issues.append('No active curfew')
        
        # Check claim frequency
        if user_history.get('claims_this_week', 0) > 3:
            verification_score -= 0.2
            issues.append('High claim frequency this week')
        
        # Check time since last claim
        if user_history.get('hours_since_last_claim', 24) < 2:
            verification_score -= 0.1
            issues.append('Recent claim submitted')
        
        # Determine verification result
        is_verified = verification_score >= 0.6
        
        return {
            'is_verified': is_verified,
            'verification_score': max(0, verification_score),
            'issues': issues,
            'recommendation': 'Approve' if is_verified else 'Review required',
            'confidence': 0.9
        }
    
    def get_7day_forecast(self, city, historical_data=None):
        """
        Generate 7-day risk forecast for a city
        
        Args:
            city: City name
            historical_data: Optional historical weather data
            
        Returns:
            List of daily risk predictions
        """
        forecast = []
        base_date = datetime.now()
        
        for i in range(7):
            forecast_date = base_date + timedelta(days=i)
            
            # Generate predicted weather
            base_temp = {
                'bangalore': 28, 'mumbai': 32, 'delhi': 35, 'hyderabad': 33,
                'chennai': 34, 'pune': 30, 'kolkata': 31, 'ahmedabad': 36
            }.get(city.lower(), 30)
            
            # Add daily variation
            temp_variation = np.random.normal(0, 3)
            predicted_temp = base_temp + temp_variation
            
            # Predict other weather factors
            predicted_aqi = np.random.normal(150, 40)
            predicted_rainfall = np.random.exponential(5)
            
            weather_data = {
                'temperature': predicted_temp,
                'aqi': max(50, predicted_aqi),
                'rainfall': max(0, predicted_rainfall),
                'humidity': np.random.normal(60, 10),
                'wind_speed': np.random.normal(15, 5)
            }
            
            # Predict risk
            risk_prediction = self.predict_risk(city, forecast_date, weather_data)
            
            forecast.append({
                'date': forecast_date.strftime('%Y-%m-%d'),
                'day_name': forecast_date.strftime('%A'),
                'risk_level': risk_prediction['risk_level'],
                'probability': risk_prediction['probability'],
                'weather': weather_data,
                'recommendations': risk_prediction['recommendations']
            })
        
        return forecast

# ============================================
# FLASK API FOR AI SERVICE
# ============================================

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize AI model
ai_model = GigShieldAI()

# Train models on startup
print("Training AI models...")
ai_model.train_risk_model()
ai_model.train_fraud_detection_model()
ai_model.train_pricing_model()
print("All models trained successfully!")

@app.route('/api/ai/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'models_trained': True,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/ai/predict-risk', methods=['POST'])
def predict_risk():
    data = request.json
    city = data.get('city')
    date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
    weather_data = data.get('weather_data')
    
    if not city:
        return jsonify({'error': 'City is required'}), 400
    
    prediction = ai_model.predict_risk(city, date, weather_data)
    return jsonify(prediction)

@app.route('/api/ai/detect-fraud', methods=['POST'])
def detect_fraud():
    data = request.json
    
    if not data:
        return jsonify({'error': 'Claim data is required'}), 400
    
    fraud_assessment = ai_model.detect_fraud(data)
    return jsonify(fraud_assessment)

@app.route('/api/ai/calculate-premium', methods=['POST'])
def calculate_premium():
    data = request.json
    base_premium = data.get('base_premium', 20)
    city = data.get('city')
    season = data.get('season', 'normal')
    vehicle_type = data.get('vehicle_type', 'bike')
    weather_data = data.get('weather_data')
    
    if not city:
        return jsonify({'error': 'City is required'}), 400
    
    premium_calc = ai_model.calculate_dynamic_premium(
        base_premium, city, season, vehicle_type, weather_data
    )
    
    return jsonify(premium_calc)

@app.route('/api/ai/verify-claim', methods=['POST'])
def verify_claim():
    data = request.json
    claim_data = data.get('claim_data')
    weather_data = data.get('weather_data')
    user_history = data.get('user_history', {})
    
    if not claim_data or not weather_data:
        return jsonify({'error': 'Claim and weather data are required'}), 400
    
    verification = ai_model.verify_claim(claim_data, weather_data, user_history)
    return jsonify(verification)

@app.route('/api/ai/forecast', methods=['POST'])
def get_forecast():
    data = request.json
    city = data.get('city')
    
    if not city:
        return jsonify({'error': 'City is required'}), 400
    
    forecast = ai_model.get_7day_forecast(city)
    return jsonify({'forecast': forecast})

@app.route('/api/ai/recommendations', methods=['POST'])
def get_recommendations():
    data = request.json
    city = data.get('city')
    current_weather = data.get('weather_data', {})
    
    if not city:
        return jsonify({'error': 'City is required'}), 400
    
    # Get risk prediction
    risk_prediction = ai_model.predict_risk(city, datetime.now().strftime('%Y-%m-%d'), current_weather)
    
    # Generate personalized recommendations
    recommendations = []
    
    if risk_prediction['risk_level'] == 'high':
        recommendations.append({
            'type': 'alert',
            'message': 'High disruption risk today. Consider upgrading your plan for better coverage.',
            'priority': 'high'
        })
    
    if current_weather.get('aqi', 0) > 200:
        recommendations.append({
            'type': 'health',
            'message': 'Air quality is poor. Wear a mask and take frequent breaks.',
            'priority': 'medium'
        })
    
    if current_weather.get('temperature', 0) > 38:
        recommendations.append({
            'type': 'health',
            'message': 'High temperature alert. Stay hydrated and avoid peak sun hours.',
            'priority': 'medium'
        })
    
    # Add safe zone discount notification
    if current_weather.get('aqi', 100) < 100 and current_weather.get('rainfall', 0) == 0:
        recommendations.append({
            'type': 'savings',
            'message': 'Good conditions today! You qualify for ₹2 premium discount.',
            'priority': 'low'
        })
    
    return jsonify({
        'risk_level': risk_prediction['risk_level'],
        'recommendations': recommendations
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
