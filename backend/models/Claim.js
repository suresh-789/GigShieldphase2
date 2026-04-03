const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trigger: { type: String, required: true },
  triggerType: { type: String, required: true },
  condition: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'verified', 'paid', 'rejected'], 
    default: 'pending' 
  },
  location: {
    lat: Number,
    lng: Number,
    city: String
  },
  verified: { type: Boolean, default: false },
  verificationData: {
    weatherMatch: Boolean,
    locationValid: Boolean,
    timestampValid: Boolean,
    fraudScore: Number
  },
  autoProcessed: { type: Boolean, default: false },
  processedAt: Date,
  paidAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
ClaimSchema.index({ userId: 1, createdAt: -1 });
ClaimSchema.index({ status: 1 });
ClaimSchema.index({ triggerType: 1 });

module.exports = mongoose.model('Claim', ClaimSchema);
