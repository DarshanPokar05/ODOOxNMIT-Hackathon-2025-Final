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

router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    req.app.get('io').emit('work_order_updated', workOrder);

    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;