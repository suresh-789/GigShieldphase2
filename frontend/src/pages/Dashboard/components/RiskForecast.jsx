import React from 'react'

export default function RiskForecast({ riskForecast }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4">7-Day Risk Forecast</h2>
      <div className="grid grid-cols-7 gap-2">
        {riskForecast.map((day, idx) => (
          <div 
            key={idx}
            className={`p-3 rounded-lg text-center ${
              day.riskLevel === 'high' ? 'bg-red-50 border border-red-200' :
              day.riskLevel === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-green-50 border border-green-200'
            }`}
          >
            <p className="text-xs font-medium text-gray-600">{day.dayName.slice(0, 3)}</p>
            <p className="text-lg font-bold my-1">{day.temp}°</p>
            <p className={`text-xs font-semibold ${
              day.riskLevel === 'high' ? 'text-red-600' :
              day.riskLevel === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {day.riskLevel.charAt(0).toUpperCase() + day.riskLevel.slice(1)}
            </p>
            <p className="text-xs text-gray-500">{(day.probability * 100).toFixed(0)}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}
