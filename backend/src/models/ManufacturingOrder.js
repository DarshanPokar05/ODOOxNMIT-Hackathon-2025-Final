const mongoose = require('mongoose');

const manufacturingOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  product: { type: String, required: true },
  billOfMaterials: { type: String },
  quantity: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['planned', 'in_progress', 'done', 'cancelled'], 
    default: 'planned' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  startDate: Date,
  deadline: Date,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  progress: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ManufacturingOrder', manufacturingOrderSchema);