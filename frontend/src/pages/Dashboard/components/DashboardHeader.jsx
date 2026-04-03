import React from 'react'

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

const getPlatformInfo = (platformId) => {
  return PLATFORMS.find(p => p.id === platformId) || PLATFORMS.find(p => p.id === 'other')
}

export default function DashboardHeader({ user, walletBalance, onLogout }) {
  const platformInfo = getPlatformInfo(user?.platform)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-primary-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">GigShield AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
            <span className="text-green-700 font-semibold">₹{walletBalance}</span>
            <span className="text-green-600 text-sm">wallet</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
            <span className="text-lg">{platformInfo?.icon}</span>
            <span className="text-sm font-medium">{platformInfo?.name}</span>
          </div>
          <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
          <button
            onClick={onLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
