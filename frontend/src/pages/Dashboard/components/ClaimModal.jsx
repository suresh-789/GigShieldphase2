import React from 'react'

const TRIGGERS = {
  rain: { name: 'Heavy Rain', icon: '🌧️', color: 'blue', payout: { basic: 150, standard: 200, premium: 300 } },
  aqi_high: { name: 'High AQI', icon: '💨', color: 'orange', payout: { basic: 100, standard: 150, premium: 250 } },
  aqi_severe: { name: 'Severe AQI', icon: '☠️', color: 'red', payout: { basic: 150, standard: 250, premium: 350 } },
  heat: { name: 'Extreme Heat', icon: '🌡️', color: 'red', payout: { basic: 100, standard: 150, premium: 200 } },
  curfew: { name: 'Curfew', icon: '🚫', color: 'purple', payout: { basic: 200, standard: 300, premium: 500 } },
  traffic: { name: 'Traffic', icon: '🚗', color: 'yellow', payout: { basic: 50, standard: 100, premium: 150 } }
}

export default function ClaimModal({ show, onClose, onSubmit, isLoading, user }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Submit Claim</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the type of disruption you experienced. Our AI will auto-verify your claim.
        </p>
        <div className="space-y-2 mb-6">
          {Object.entries(TRIGGERS).map(([key, trigger]) => (
            <button
              key={key}
              onClick={() => onSubmit(key)}
              disabled={isLoading}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{trigger.icon}</span>
                <span className="font-medium">{trigger.name}</span>
              </div>
              <span className="text-primary-600 font-semibold">
                ₹{trigger.payout?.[user?.plan || 'standard'] || 0}
              </span>
            </button>
          ))}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
