const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  workOrderNumber: { type: String, required: true, unique: true },
  manufacturingOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingOrder' },
  workCenter: { type: String, required: true },
  operation: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['planned', 'started', 'paused', 'completed', 'cancelled'], 
    default: 'planned' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  estimatedDuration: { type: Number }, // in minutes
  actualDuration: { type: Number }, // in minutes
  startDate: Date,
  endDate: Date,
  assignedTo: { type: String },
  progress: { type: Number, default: 0 },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('WorkOrder', workOrderSchema);