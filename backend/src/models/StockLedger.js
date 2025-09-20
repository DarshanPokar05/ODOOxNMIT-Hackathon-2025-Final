const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  transactionType: { 
    type: String, 
    enum: ['in', 'out', 'adjustment'], 
    required: true 
  },
  quantity: { type: Number, required: true },
  balanceQuantity: { type: Number, required: true },
  reference: { type: String }, // MO number, WO number, etc.
  referenceType: { 
    type: String, 
    enum: ['manufacturing_order', 'work_order', 'adjustment', 'initial'] 
  },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('StockLedger', stockLedgerSchema);