const mongoose = require('mongoose');

const workCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  location: { type: String },
  costPerHour: { type: Number, default: 0 },
  capacity: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  utilization: { type: Number, default: 0 },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WorkCenter', workCenterSchema);