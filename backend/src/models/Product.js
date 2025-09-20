const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  stockLevel: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },
  unitCost: { type: Number, default: 0 },
  unit: { type: String, default: 'pieces' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);