import React from 'react'

export default function TransactionsTab({ transactions }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Transaction History</h3>
      </div>
      {transactions.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((trans, idx) => (
              <tr key={trans._id || idx}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(trans.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    trans.type === 'payout' ? 'bg-green-100 text-green-800' :
                    trans.type === 'payment' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {trans.type}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  trans.type === 'payout' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {trans.type === 'payout' ? '+' : '-'}₹{trans.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{trans.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {trans.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">💰</div>
          <p className="text-gray-600">No transactions yet</p>
          <p className="text-sm text-gray-500">Transactions will appear here</p>
        </div>
      )}
    </div>
  )
}
