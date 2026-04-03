const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['payment', 'payout', 'refund'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'completed' },
  description: String,
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
