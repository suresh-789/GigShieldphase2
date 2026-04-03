import React from 'react'

export default function OverviewTab({ user, walletBalance, onUpgradePlan, onViewClaims, onViewTransactions }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Protection Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Your Protection Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 rounded-full p-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Active Coverage</span>
            </div>
            <span className="text-green-700">₹{user?.weeklyPremium || 20}/week plan</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 rounded-full p-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Next Billing</span>
            </div>
            <span className="text-blue-700">3 days (₹{user?.weeklyPremium || 20})</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 rounded-full p-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <span className="font-medium">Wallet Balance</span>
            </div>
            <span className="text-purple-700 font-bold">₹{walletBalance}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowClaimModal(true)}
            className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📝</div>
            <p className="font-medium text-primary-700">Submit Claim</p>
            <p className="text-xs text-primary-600">Zero-touch process</p>
          </button>
          <button
            onClick={onUpgradePlan}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <div className="text-2xl mb-2">⬆️</div>
            <p className="font-medium text-green-700">Upgrade Plan</p>
            <p className="text-xs text-green-600">Better coverage</p>
          </button>
          <button
            onClick={onViewClaims}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📊</div>
            <p className="font-medium text-blue-700">View Claims</p>
            <p className="text-xs text-blue-600">Claim history</p>
          </button>
          <button
            onClick={onViewTransactions}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
          >
            <div className="text-2xl mb-2">💰</div>
            <p className="font-medium text-purple-700">Transactions</p>
            <p className="text-xs text-purple-600">Payment history</p>
          </button>
        </div>
      </div>
    </div>
  )
}
