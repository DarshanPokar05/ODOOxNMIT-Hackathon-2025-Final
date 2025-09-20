const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  product: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'pieces' },
  notes: String
});

const operationSchema = new mongoose.Schema({
  workCenter: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  description: String,
  sequence: { type: Number, default: 1 }
});

const billOfMaterialSchema = new mongoose.Schema({
  bomNumber: { type: String, required: true, unique: true },
  product: { type: String, required: true },
  version: { type: String, default: '1.0' },
  status: { 
    type: String, 
    enum: ['active', 'draft', 'archived'], 
    default: 'draft' 
  },
  components: [componentSchema],
  operations: [operationSchema],
  totalCost: { type: Number, default: 0 },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('BillOfMaterial', billOfMaterialSchema);