const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  unit: { type: String, required: true, default: 'pieces' },
  type: { type: String, enum: ['finished', 'raw_material', 'component'], default: 'finished' },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  stockQuantity: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);