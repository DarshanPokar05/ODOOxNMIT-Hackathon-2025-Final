const express = require('express');
const WorkOrder = require('../models/WorkOrder');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, workCenter, priority } = req.query;
    const filter = {};
    
    if (status && status !== 'all') filter.status = status;
    if (workCenter && workCenter !== 'all') filter.workCenter = workCenter;
    if (priority) filter.priority = priority;

    const workOrders = await WorkOrder.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { workCenter, operation, priority, estimatedDuration, startDate, endDate, assignedTo } = req.body;
    
    const orderCount = await WorkOrder.countDocuments();
    const workOrderNumber = `WO-${new Date().getFullYear()}-${String(orderCount + 1).padStart(3, '0')}`;

    const workOrder = new WorkOrder({
      workOrderNumber,
      workCenter,
      operation,
      priority,
      estimatedDuration,
      startDate,
      endDate,
      assignedTo,
      createdBy: req.user._id
    });

    await workOrder.save();
    await workOrder.populate('createdBy', 'name email');

    req.app.get('io').emit('work_order_created', workOrder);

    res.status(201).json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update work order status with time tracking
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    
    // Add time tracking
    const timeEntry = {
      action: status,
      timestamp: new Date(),
      operator: req.user._id
    };
    
    if (status === 'started') {
      updateData.actualStartTime = new Date();
    } else if (status === 'completed') {
      updateData.actualEndTime = new Date();
      updateData.progress = 100;
    }
    
    const workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { 
        ...updateData,
        $push: { timeTracking: timeEntry }
      },
      { new: true }
    ).populate('createdBy', 'name email')
     .populate('assignedTo', 'name email')
     .populate('workCenter', 'name location');

    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    // Update work center status
    if (status === 'started') {
      await WorkCenter.findByIdAndUpdate(workOrder.workCenter._id, {
        status: 'active',
        currentWorkOrder: workOrder._id,
        assignedOperator: req.user._id
      });
    } else if (status === 'completed') {
      await WorkCenter.findByIdAndUpdate(workOrder.workCenter._id, {
        status: 'idle',
        currentWorkOrder: null,
        assignedOperator: null
      });
    }

    req.app.get('io').emit('work_order_updated', workOrder);
    req.app.get('io').emit('shop_floor_update', workOrder);

    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign work order to operator
router.patch('/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { operatorId } = req.body;
    
    const workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { assignedTo: operatorId },
      { new: true }
    ).populate('assignedTo', 'name email')
     .populate('workCenter', 'name location');

    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    req.app.get('io').emit('work_order_assigned', workOrder);
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Report issue
router.post('/:id/issue', authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;
    
    const issue = {
      description,
      reportedBy: req.user._id,
      reportedAt: new Date(),
      resolved: false
    };
    
    const workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { issues: issue },
        status: 'delayed'
      },
      { new: true }
    ).populate('assignedTo', 'name email')
     .populate('workCenter', 'name location');

    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    req.app.get('io').emit('work_order_issue_reported', {
      workOrder,
      issue: issue
    });

    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get work orders for operator (mobile PWA)
router.get('/operator/assigned', authenticateToken, async (req, res) => {
  try {
    const workOrders = await WorkOrder.find({ 
      assignedTo: req.user._id,
      status: { $in: ['planned', 'started', 'paused'] }
    })
    .populate('workCenter', 'name location')
    .populate('manufacturingOrder', 'orderNumber product')
    .sort({ priority: -1, createdAt: 1 });
    
    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get work order by QR code
router.get('/qr/:qrCode', authenticateToken, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findOne({ qrCode: req.params.qrCode })
      .populate('workCenter', 'name location')
      .populate('assignedTo', 'name email')
      .populate('manufacturingOrder', 'orderNumber product');
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;