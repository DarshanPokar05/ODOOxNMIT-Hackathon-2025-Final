const mongoose = require('mongoose');

const workCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  location: { type: String },
  costPerHour: { type: Number, default: 0 },
  capacity: { type: Number, default: 1 },
  currentUtilization: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'maintenance', 'idle'], default: 'idle' },
  currentWorkOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder' },
  assignedOperator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  qrCode: { type: String, unique: true },
  isActive: { type: Boolean, default: true },
  utilization: { type: Number, default: 0 },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('WorkCenter', workCenterSchema);