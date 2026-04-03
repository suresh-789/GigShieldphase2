const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  city: { type: String, required: true },
  platform: { type: String, required: true },
  vehicleType: { type: String, enum: ['bike', 'ev', 'scooter', 'bicycle'], default: 'bike' },
  plan: { type: String, enum: ['basic', 'standard', 'premium'], default: 'standard' },
  coverage: { type: Number, default: 2000 },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  weeklyPremium: { type: Number, default: 20 },
  active: { type: Boolean, default: true },
  walletBalance: { type: Number, default: 0 },
  totalClaims: { type: Number, default: 0 },
  totalPayouts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', UserSchema);
