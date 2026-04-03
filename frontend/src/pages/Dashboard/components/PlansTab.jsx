import React from 'react'

export default function PlansTab({ user, onPlanChange, planChangeLoading }) {
  const plans = [
    { id: 'basic', name: 'Basic', price: 15, coverage: 1500, features: ['Rain protection (₹150)', 'AQI protection (₹100)', 'Basic support'] },
    { id: 'standard', name: 'Standard', price: 20, coverage: 2000, features: ['Rain protection (₹200)', 'AQI protection (₹150)', 'Curfew protection (₹300)', 'Priority support'], popular: true },
    { id: 'premium', name: 'Premium', price: 30, coverage: 3000, features: ['Rain protection (₹300)', 'AQI protection (₹250)', 'Curfew protection (₹500)', '24/7 support', 'Higher coverage'] }
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map(plan => (
        <div 
          key={plan.id}
          className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
            plan.popular ? 'border-primary-500 relative' : 'border-gray-200'
          }`}
        >
          {plan.popular && (
            <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs px-2 py-1 rounded-bl-lg">Popular</div>
          )}
          <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
          <p className="text-3xl font-bold mb-4">₹{plan.price}<span className="text-sm font-normal text-gray-500">/week</span></p>
          <p className="text-sm text-gray-600 mb-4">Coverage: ₹{plan.coverage.toLocaleString()}</p>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            {plan.features.map((feature, idx) => (
              <li key={idx}>✓ {feature}</li>
            ))}
          </ul>
          <button 
            onClick={() => onPlanChange(plan.id)}
            disabled={user?.plan === plan.id || planChangeLoading}
            className={`w-full py-2 px-4 rounded-lg ${
              user?.plan === plan.id
                ? 'bg-gray-100 text-gray-600 cursor-default'
                : plan.popular
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {user?.plan === plan.id ? 'Current Plan' : planChangeLoading ? 'Upgrading...' : 'Upgrade'}
          </button>
        </div>
      ))}
    </div>
  )
}
