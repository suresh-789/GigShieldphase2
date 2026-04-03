import React from 'react'

export default function StatsCards({ user, weather, claims, riskInfo }) {
  return (
    <div className="grid md:grid-cols-5 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-500 mb-1">Platform</p>
        <p className="text-2xl font-bold">{user?.platform || 'N/A'}</p>
        <p className="text-sm text-gray-600 mt-1">Active</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-500 mb-1">Coverage Amount</p>
        <p className="text-3xl font-bold text-primary-600">₹{user?.coverage?.toLocaleString() || '2,000'}</p>
        <p className="text-sm text-green-600 mt-1">{user?.plan || 'Standard'} Plan</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-500 mb-1">Today's Risk</p>
        <p className={`text-3xl font-bold ${riskInfo.color}`}>{riskInfo.level}</p>
        <p className="text-sm text-gray-600 mt-1">AQI: {weather.aqi}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-500 mb-1">Total Claims</p>
        <p className="text-3xl font-bold text-gray-900">{claims.length}</p>
        <p className="text-sm text-green-600 mt-1">₹{claims.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0)} earned</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-500 mb-1">Weekly Premium</p>
        <p className="text-3xl font-bold text-gray-900">₹{user?.weeklyPremium || 20}</p>
        <p className="text-sm text-gray-600 mt-1">{user?.riskLevel || 'Medium'} risk</p>
      </div>
    </div>
  )
}
