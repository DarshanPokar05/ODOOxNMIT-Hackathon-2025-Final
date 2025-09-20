const express = require('express');
const ManufacturingOrder = require('../models/ManufacturingOrder');
const WorkOrder = require('../models/WorkOrder');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

// Get all manufacturing orders with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const orders = await ManufacturingOrder.find(filter)
      .populate('createdBy', 'name email')
      .populate('workOrders')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create manufacturing order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product, quantity, deadline, priority } = req.body;
    
    // Generate order number
    const orderCount = await ManufacturingOrder.countDocuments();
    const orderNumber = `MO${String(orderCount + 1).padStart(4, '0')}`;

    const manufacturingOrder = new ManufacturingOrder({
      orderNumber,
      product,
      quantity,
      deadline,
      priority,
      createdBy: req.user._id
    });

    await manufacturingOrder.save();
    await manufacturingOrder.populate('createdBy', 'name email');

    // Emit real-time update
    req.app.get('io').emit('manufacturing_order_created', manufacturingOrder);

    res.status(201).json(manufacturingOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update manufacturing order status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await ManufacturingOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Manufacturing order not found' });
    }

    // Emit real-time update
    req.app.get('io').emit('manufacturing_order_updated', order);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;