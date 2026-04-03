import React from 'react'

const TRIGGERS = {
  rain: { name: 'Heavy Rain', icon: '🌧️', color: 'blue', payout: { basic: 150, standard: 200, premium: 300 } },
  aqi_high: { name: 'High AQI', icon: '💨', color: 'orange', payout: { basic: 100, standard: 150, premium: 250 } },
  aqi_severe: { name: 'Severe AQI', icon: '☠️', color: 'red', payout: { basic: 150, standard: 250, premium: 350 } },
  heat: { name: 'Extreme Heat', icon: '🌡️', color: 'red', payout: { basic: 100, standard: 150, premium: 200 } },
  curfew: { name: 'Curfew', icon: '🚫', color: 'purple', payout: { basic: 200, standard: 300, premium: 500 } },
  traffic: { name: 'Traffic', icon: '🚗', color: 'yellow', payout: { basic: 50, standard: 100, premium: 150 } }
}

export default function LiveConditions({ weather, activeTriggers, user, riskInfo, onClaimClick }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Live Conditions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Live Conditions in {user?.city || 'Your Area'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold">{weather.temp}°C</p>
              <p className="text-xs text-gray-500">Temperature</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${riskInfo.bg}`}>
              <svg className={`w-6 h-6 ${riskInfo.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold">{weather.aqi}</p>
              <p className="text-xs text-gray-500">AQI Level</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${weather.rainfall > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <svg className={`w-6 h-6 ${weather.rainfall > 0 ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold">{weather.rainfall > 0 ? `${weather.rainfall}mm` : 'Clear'}</p>
              <p className="text-xs text-gray-500">Rainfall</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold">{weather.humidity}%</p>
              <p className="text-xs text-gray-500">Humidity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Triggers */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Active Triggers</h2>
        {activeTriggers.length > 0 ? (
          <div className="space-y-3">
            {activeTriggers.map((trigger, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{TRIGGERS[trigger.type]?.icon || '⚠️'}</span>
                  <div>
                    <p className="font-medium text-red-800">{trigger.name}</p>
                    <p className="text-xs text-red-600">{trigger.condition}</p>
                  </div>
                </div>
                <button
                  onClick={() => onClaimClick(trigger.type)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                  Claim ₹{trigger.payout?.[user?.plan || 'basic'] || 0}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-600">No active triggers</p>
            <p className="text-sm text-gray-500">All conditions are normal</p>
          </div>
        )}
      </div>
    </div>
  )
}
