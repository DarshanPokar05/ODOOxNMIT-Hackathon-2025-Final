const express = require('express');
const WorkOrder = require('../models/WorkOrder');
const WorkCenter = require('../models/WorkCenter');
const ManufacturingOrder = require('../models/ManufacturingOrder');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

// Get work order by QR code scan
router.get('/qr/:qrCode', authenticateToken, async (req, res) => {
  try {
    const workCenter = await WorkCenter.findOne({ qrCode: req.params.qrCode });
    if (!workCenter) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    const workOrder = await WorkOrder.findOne({
      workCenter: workCenter._id,
      status: { $in: ['planned', 'in_progress', 'paused'] }
    })
    .populate('manufacturingOrder')
    .populate('workCenter')
    .populate('assignedOperator', 'name email');

    if (!workOrder) {
      return res.status(404).json({ message: 'No active work order for this work center' });
    }

    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update work order status (Start/Pause/Complete)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, comment } = req.body;
    const workOrder = await WorkOrder.findById(req.params.id);
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    // Update timestamps based on status
    const updateData = { status };
    
    if (status === 'in_progress' && !workOrder.startTime) {
      updateData.startTime = new Date();
      updateData.assignedOperator = req.user._id;
    } else if (status === 'completed') {
      updateData.endTime = new Date();
      if (workOrder.startTime) {
        updateData.duration = Math.round((new Date() - workOrder.startTime) / 60000); // minutes
      }
    }

    // Add comment if provided
    if (comment) {
      updateData.$push = {
        comments: {
          text: comment,
          user: req.user._id,
          timestamp: new Date()
        }
      };
    }

    const updatedWorkOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('manufacturingOrder')
    .populate('workCenter')
    .populate('assignedOperator', 'name email');

    // Update work center current work order
    if (status === 'in_progress') {
      await WorkCenter.findByIdAndUpdate(workOrder.workCenter, {
        currentWorkOrder: workOrder._id
      });
    } else if (status === 'completed') {
      await WorkCenter.findByIdAndUpdate(workOrder.workCenter, {
        currentWorkOrder: null
      });
    }

    // Emit real-time update
    req.app.get('io').emit('work_order_updated', updatedWorkOrder);

    res.json(updatedWorkOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all work orders for dashboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    const workOrders = await WorkOrder.find()
      .populate('manufacturingOrder')
      .populate('workCenter')
      .populate('assignedOperator', 'name email')
      .sort({ sequence: 1, createdAt: -1 });

    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;