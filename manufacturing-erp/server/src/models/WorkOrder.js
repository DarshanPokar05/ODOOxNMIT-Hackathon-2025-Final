const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  manufacturingOrder: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ManufacturingOrder', 
    required: true 
  },
  workCenter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WorkCenter', 
    required: true 
  },
  assignedOperator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  status: { 
    type: String, 
    enum: ['planned', 'in_progress', 'paused', 'completed', 'cancelled'], 
    default: 'planned' 
  },
  startTime: Date,
  endTime: Date,
  duration: { type: Number, default: 0 }, // in minutes
  comments: [{ 
    text: String, 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  sequence: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('WorkOrder', workOrderSchema);