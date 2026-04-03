import { useState, useEffect } from 'react'

const PLATFORMS = [
  { id: 'swiggy', name: 'Swiggy', color: '#FF8C00', icon: '🍔' },
  { id: 'zomato', name: 'Zomato', color: '#CB202D', icon: '🍕' },
  { id: 'zepto', name: 'Zepto', color: '#7C3AED', icon: '⚡' },
  { id: 'blinkit', name: 'Blinkit', color: '#F59E0B', icon: '🛒' },
  { id: 'dunzo', name: 'Dunzo', color: '#10B981', icon: '📦' },
  { id: 'uber_eats', name: 'Uber Eats', color: '#06C167', icon: '🚗' },
  { id: 'amazon_flex', name: 'Amazon Flex', color: '#FF9900', icon: '📱' },
  { id: 'flipkart', name: 'Flipkart', color: '#2874F0', icon: '🛍️' },
  { id: 'other', name: 'Other', color: '#6B7280', icon: '📋' }
]

const VEHICLE_TYPES = [
  { id: 'bike', name: 'Motorcycle', icon: '🏍️', factor: 1.0 },
  { id: 'ev', name: 'Electric Vehicle', icon: '⚡', factor: 0.85 },
  { id: 'scooter', name: 'Scooter', icon: '🛵', factor: 0.95 },
  { id: 'bicycle', name: 'Bicycle', icon: '🚲', factor: 0.7 }
]

const CITIES = [
  { id: 'bangalore', name: 'Bangalore', risk: 'medium' },
  { id: 'mumbai', name: 'Mumbai', risk: 'high' },
  { id: 'delhi', name: 'Delhi', risk: 'high' },
  { id: 'hyderabad', name: 'Hyderabad', risk: 'medium' },
  { id: 'chennai', name: 'Chennai', risk: 'medium' },
  { id: 'pune', name: 'Pune', risk: 'low' },
  { id: 'kolkata', name: 'Kolkata', risk: 'high' },
  { id: 'ahmedabad', name: 'Ahmedabad', risk: 'medium' }
]

export default function Register({ onLogin, onSwitchToLogin, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    platform: '',
    password: '',
    vehicleType: 'bike'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [premiumQuote, setPremiumQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)

  // Fetch dynamic premium quote when city or vehicle changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!formData.city) return
      
      setQuoteLoading(true)
      try {
        const response = await fetch('http://localhost:5000/api/premium/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: formData.city,
            vehicleType: formData.vehicleType,
            plan: 'standard'
          })
        })
        
        const data = await response.json()
        if (data.success) {
          setPremiumQuote(data.quote)
        }
      } catch (err) {
        console.error('Quote fetch error:', err)
      } finally {
        setQuoteLoading(false)
      }
    }

    const debounce = setTimeout(fetchQuote, 500)
    return () => clearTimeout(debounce)
  }, [formData.city, formData.vehicleType])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePlatformSelect = (platformId) => {
    setFormData({ ...formData, platform: platformId })
  }

  const handleVehicleSelect = (vehicleId) => {
    setFormData({ ...formData, vehicleType: vehicleId })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        onLogin(data.user, data.token)
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">GigShield AI</h1>
          <p className="text-primary-200 mt-2">Get Protected Today</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select your city</option>
                  {CITIES.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name} ({city.risk} risk)
                    </option>
                  ))}
                </select>
                {formData.city && (
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(CITIES.find(c => c.id === formData.city)?.risk)}`}>
                      {CITIES.find(c => c.id === formData.city)?.risk.charAt(0).toUpperCase() + 
                       CITIES.find(c => c.id === formData.city)?.risk.slice(1)} Risk Zone
                    </span>
                  </div>
                )}
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {VEHICLE_TYPES.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => handleVehicleSelect(vehicle.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        formData.vehicleType === vehicle.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{vehicle.icon}</span>
                      <span className="text-xs font-medium">{vehicle.name}</span>
                    </button>
                  ))}
                </div>
                {formData.vehicleType === 'ev' && (
                  <p className="text-xs text-green-600 mt-2">⚡ EV discount: 15% off premium!</p>
                )}
                {formData.vehicleType === 'bicycle' && (
                  <p className="text-xs text-green-600 mt-2">🚲 Eco-friendly: 30% off premium!</p>
                )}
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which platform do you work on? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => handlePlatformSelect(platform.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        formData.platform === platform.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{platform.icon}</span>
                      <span className="text-xs font-medium">{platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Premium Preview */}
              {premiumQuote && (
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Your Personalized Premium</span>
                    {quoteLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    )}
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-primary-600">
                      ₹{premiumQuote.finalPremium}
                    </span>
                    <span className="text-gray-500">/week</span>
                    {premiumQuote.weatherDiscount > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Save ₹{premiumQuote.weatherDiscount}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Base premium:</span>
                      <span>₹{premiumQuote.basePremium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>City adjustment:</span>
                      <span className={premiumQuote.factors.city > 1 ? 'text-red-600' : 'text-green-600'}>
                        {premiumQuote.factors.city > 1 ? '+' : ''}{((premiumQuote.factors.city - 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Season adjustment:</span>
                      <span className={premiumQuote.factors.season > 1 ? 'text-red-600' : 'text-green-600'}>
                        {premiumQuote.factors.season > 1 ? '+' : ''}{((premiumQuote.factors.season - 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vehicle discount:</span>
                      <span className="text-green-600">
                        {premiumQuote.factors.vehicle < 1 ? `-${((1 - premiumQuote.factors.vehicle) * 100).toFixed(0)}%` : '0%'}
                      </span>
                    </div>
                    {premiumQuote.savings !== 0 && (
                      <div className="flex justify-between font-medium pt-1 border-t border-primary-200">
                        <span>Your savings:</span>
                        <span className={premiumQuote.savings > 0 ? 'text-green-600' : 'text-red-600'}>
                          {premiumQuote.savings > 0 ? '-' : '+'}₹{Math.abs(premiumQuote.savings)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !formData.platform}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : `Get Started - ₹${premiumQuote?.finalPremium || 20}/week`}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Login Now
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🤖</div>
            <p className="text-xs text-white">Zero-Touch Claims</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-xs text-white">Instant Payouts</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🛡️</div>
            <p className="text-xs text-white">AI Protection</p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-primary-200 hover:text-white text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
