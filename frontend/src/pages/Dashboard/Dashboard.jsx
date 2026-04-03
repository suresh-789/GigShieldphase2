import { useState, useEffect } from 'react'
import { weatherApi, triggersApi, claimsApi, usersApi } from '../../services/api'
import {
  DashboardHeader,
  StatsCards,
  LiveConditions,
  RiskForecast,
  DashboardTabs,
  OverviewTab,
  ClaimsTab,
  TransactionsTab,
  PlansTab,
  ClaimModal
} from './components'

const TRIGGERS = {
  rain: { name: 'Heavy Rain', icon: '🌧️', color: 'blue', payout: { basic: 150, standard: 200, premium: 300 } },
  aqi_high: { name: 'High AQI', icon: '💨', color: 'orange', payout: { basic: 100, standard: 150, premium: 250 } },
  aqi_severe: { name: 'Severe AQI', icon: '☠️', color: 'red', payout: { basic: 150, standard: 250, premium: 350 } },
  heat: { name: 'Extreme Heat', icon: '🌡️', color: 'red', payout: { basic: 100, standard: 150, premium: 200 } },
  curfew: { name: 'Curfew', icon: '🚫', color: 'purple', payout: { basic: 200, standard: 300, premium: 500 } },
  traffic: { name: 'Traffic', icon: '🚗', color: 'yellow', payout: { basic: 50, standard: 100, premium: 150 } }
}

export default function Dashboard({ user: initialUser, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState(initialUser)
  const [weather, setWeather] = useState({ 
    temp: 28, 
    aqi: 145, 
    rainfall: 0,
    humidity: 60,
    windSpeed: 15,
    curfewActive: false,
    trafficDisruption: false
  })
  const [claims, setClaims] = useState([])
  const [transactions, setTransactions] = useState([])
  const [activeTriggers, setActiveTriggers] = useState([])
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [selectedTrigger, setSelectedTrigger] = useState(null)
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance || 0)
  const [riskForecast, setRiskForecast] = useState([])
  const [planChangeLoading, setPlanChangeLoading] = useState(false)

  // Fetch real-time data
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setError(null)
        
        // Fetch weather data
        const weatherData = await weatherApi.getWeather(user?.city || 'bangalore')
        if (isMounted) {
          // Handle both response formats: { success: true, data: {...} } or { temp: ..., aqi: ... }
          if (weatherData.data) {
            // Map temperature to temp for frontend compatibility
            const data = weatherData.data
            setWeather({
              temp: data.temperature || data.temp,
              aqi: data.aqi,
              rainfall: data.rainfall,
              humidity: data.humidity,
              windSpeed: data.windSpeed,
              curfewActive: data.curfewActive,
              trafficDisruption: data.trafficDisruption
            })
          } else if (weatherData.temp !== undefined || weatherData.temperature !== undefined) {
            // Map temperature to temp for frontend compatibility
            setWeather({
              temp: weatherData.temperature || weatherData.temp,
              aqi: weatherData.aqi,
              rainfall: weatherData.rainfall,
              humidity: weatherData.humidity,
              windSpeed: weatherData.windSpeed,
              curfewActive: weatherData.curfewActive,
              trafficDisruption: weatherData.trafficDisruption
            })
          }
        }

        // Fetch active triggers
        const triggersData = await triggersApi.checkTriggers(user?.city || 'bangalore')
        if (isMounted) {
          // Handle both response formats: { success: true, triggers: [...] } or { triggers: [...] }
          const triggers = triggersData.triggers || []
          setActiveTriggers(triggers)
          
          // Generate alerts for active triggers (deduplicated)
          if (triggers.length > 0) {
            const newAlerts = triggers.map(trigger => {
              const triggerInfo = TRIGGERS[trigger.type] || {}
              return {
                id: `${trigger.type}-${Date.now()}`,
                type: trigger.type,
                message: `${triggerInfo.name || trigger.type}: Active`,
                timestamp: new Date().toISOString(),
                severity: trigger.type.includes('severe') ? 'high' : 'medium'
              }
            })
            // Deduplicate alerts by type
            setAlerts(prev => {
              const merged = [...newAlerts, ...prev]
              const unique = [...new Map(merged.map(a => [a.type, a])).values()]
              return unique.slice(0, 5)
            })
          }
        }

        // Fetch claims
        if (token && isMounted) {
          const claimsData = await claimsApi.getClaims(token)
          // Handle both response formats
          if (claimsData.claims) {
            setClaims(claimsData.claims)
          }

          // Fetch transactions
          const transData = await claimsApi.getTransactions(token)
          // Handle both response formats
          if (transData.transactions) {
            setTransactions(transData.transactions)
          }

          // Fetch user profile for wallet balance
          const profileData = await usersApi.getProfile(token)
          // Handle both response formats
          if (profileData.user) {
            setWalletBalance(profileData.user.walletBalance || 0)
          }
        }

        // Generate 7-day forecast
        if (isMounted) {
          generateForecast()
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        if (isMounted) {
          setError('Failed to fetch data. Please try again.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [user?.city, token])

  const generateForecast = () => {
    const forecast = []
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      
      const riskLevel = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
      const probability = Math.random() * 0.5 + (riskLevel === 'high' ? 0.5 : riskLevel === 'medium' ? 0.3 : 0.1)
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        dayName: days[date.getDay()],
        riskLevel,
        probability: probability.toFixed(2),
        temp: Math.floor(Math.random() * 10) + 25,
        aqi: Math.floor(Math.random() * 150) + 80
      })
    }
    
    setRiskForecast(forecast)
  }

  const getRiskLevel = (aqi) => {
    if (aqi > 300) return { level: 'High', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' }
    if (aqi > 200) return { level: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300' }
    if (aqi > 100) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-300' }
    return { level: 'Good', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' }
  }

  const riskInfo = getRiskLevel(weather.aqi)

  const handleClaimSubmit = async (triggerType) => {
    setIsLoading(true)
    try {
      const data = await claimsApi.submitClaim(triggerType, token)
      // Handle both response formats
      if (data.claim) {
        setClaims(prev => [data.claim, ...prev])
        if (data.claim.status === 'paid') {
          setWalletBalance(prev => prev + data.claim.amount)
          setAlerts(prev => [{
            id: `success-${Date.now()}`,
            type: 'success',
            message: `Claim auto-verified! ₹${data.claim.amount} credited to your wallet.`,
            timestamp: new Date().toISOString(),
            severity: 'low'
          }, ...prev].slice(0, 5))
        }
        setShowClaimModal(false)
      }
    } catch (error) {
      console.error('Claim submission error:', error)
      setError('Failed to submit claim. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  const handlePlanChange = async (newPlan) => {
    if (newPlan === user?.plan) return
    
    setPlanChangeLoading(true)
    try {
      const data = await usersApi.updatePlan(newPlan, token)
      if (data.success) {
        // Update local user state
        setUser(data.user)
        setAlerts(prev => [{
          id: `plan-${Date.now()}`,
          type: 'success',
          message: `Plan upgraded to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} successfully!`,
          timestamp: new Date().toISOString(),
          severity: 'low'
        }, ...prev].slice(0, 5))
      }
    } catch (error) {
      console.error('Plan change error:', error)
      setError('Failed to change plan. Please try again.')
    } finally {
      setPlanChangeLoading(false)
    }
  }

  const handleClaimClick = (triggerType) => {
    setSelectedTrigger(triggerType)
    setShowClaimModal(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader user={user} walletBalance={walletBalance} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl">⚠️</span>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map(alert => {
              const severityStyles = {
                high: 'bg-red-50 border-red-200',
                medium: 'bg-yellow-50 border-yellow-200',
                low: 'bg-green-50 border-green-200'
              }
              const severityText = {
                high: 'text-red-800',
                medium: 'text-yellow-800',
                low: 'text-green-800'
              }
              
              return (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg flex items-center justify-between border ${severityStyles[alert.severity] || severityStyles.medium}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {alert.type === 'success' ? '✅' : 
                       alert.type === 'rain' ? '🌧️' :
                       alert.type === 'aqi_high' ? '💨' :
                       alert.type === 'aqi_severe' ? '☠️' :
                       alert.type === 'heat' ? '🌡️' :
                       alert.type === 'curfew' ? '🚫' : '⚠️'}
                    </span>
                    <div>
                      <p className={`font-medium ${severityText[alert.severity] || severityText.medium}`}>{alert.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards user={user} weather={weather} claims={claims} riskInfo={riskInfo} />

        {/* Live Conditions & Active Triggers */}
        <LiveConditions 
          weather={weather} 
          activeTriggers={activeTriggers} 
          user={user} 
          riskInfo={riskInfo} 
          onClaimClick={handleClaimClick}
        />

        {/* 7-Day Risk Forecast */}
        <RiskForecast riskForecast={riskForecast} />

        {/* Tabs */}
        <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab 
            user={user} 
            walletBalance={walletBalance} 
            onUpgradePlan={() => setActiveTab('plans')}
            onViewClaims={() => setActiveTab('claims')}
            onViewTransactions={() => setActiveTab('transactions')}
          />
        )}

        {activeTab === 'claims' && (
          <ClaimsTab claims={claims} onNewClaim={() => setShowClaimModal(true)} />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab transactions={transactions} />
        )}

        {activeTab === 'plans' && (
          <PlansTab 
            user={user} 
            onPlanChange={handlePlanChange} 
            planChangeLoading={planChangeLoading}
          />
        )}
      </main>

      {/* Claim Modal */}
      <ClaimModal 
        show={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onSubmit={handleClaimSubmit}
        isLoading={isLoading}
        user={user}
      />
    </div>
  )
}
