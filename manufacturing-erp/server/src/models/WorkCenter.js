const mongoose = require('mongoose');

const workCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  qrCode: { type: String, unique: true },
  costPerHour: { type: Number, default: 0 },
  capacity: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  currentWorkOrder: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WorkOrder',
    default: null 
  }
}, { timestamps: true });

module.exports = mongoose.model('WorkCenter', workCenterSchema);