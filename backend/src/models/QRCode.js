const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['work_center', 'work_order'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  data: { type: Object }, // Additional data for QR code
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('QRCode', qrCodeSchema);