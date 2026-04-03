import React from 'react'

export default function ClaimsTab({ claims, onNewClaim }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Claims History</h3>
        <button
          onClick={onNewClaim}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
        >
          + New Claim
        </button>
      </div>
      {claims.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {claims.map((claim, idx) => (
              <tr key={claim._id || idx}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(claim.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{claim.trigger}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">₹{claim.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    claim.status === 'paid' ? 'bg-green-100 text-green-800' :
                    claim.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                    claim.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {claim.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {claim.autoProcessed ? '🤖 Auto' : '👤 Manual'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-gray-600">No claims yet</p>
          <p className="text-sm text-gray-500">Claims will appear here when triggers are activated</p>
        </div>
      )}
    </div>
  )
}
