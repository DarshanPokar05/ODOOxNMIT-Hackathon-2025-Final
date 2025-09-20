const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  workOrderNumber: { type: String, required: true, unique: true },
  manufacturingOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturingOrder' },
  workCenter: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkCenter', required: true },
  operation: { type: String, required: true },
  sequence: { type: Number, default: 1 },
  status: { 
    type: String, 
    enum: ['planned', 'started', 'paused', 'completed', 'cancelled', 'delayed'], 
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
  actualStartTime: Date,
  actualEndTime: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  progress: { type: Number, default: 0 },
  qrCode: { type: String, unique: true },
  issues: [{
    description: String,
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportedAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
  }],
  timeTracking: [{
    action: { type: String, enum: ['start', 'pause', 'resume', 'complete'] },
    timestamp: { type: Date, default: Date.now },
    operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('WorkOrder', workOrderSchema);