const mongoose = require('mongoose');

const WeatherLogSchema = new mongoose.Schema({
  city: { type: String, required: true },
  temperature: Number,
  aqi: Number,
  rainfall: Number,
  humidity: Number,
  windSpeed: Number,
  curfewActive: { type: Boolean, default: false },
  trafficDisruption: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

// Index for faster queries
WeatherLogSchema.index({ city: 1, timestamp: -1 });
WeatherLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('WeatherLog', WeatherLogSchema);
