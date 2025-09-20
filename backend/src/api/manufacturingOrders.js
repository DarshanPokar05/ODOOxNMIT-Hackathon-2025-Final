const express = require('express');
const ManufacturingOrder = require('../models/ManufacturingOrder');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const orders = await ManufacturingOrder.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { orderNumber, product, billOfMaterials, quantity, priority, startDate, deadline } = req.body;
    
    const finalOrderNumber = orderNumber || `MO-${new Date().getFullYear()}-${String(await ManufacturingOrder.countDocuments() + 1).padStart(3, '0')}`;

    const manufacturingOrder = new ManufacturingOrder({
      orderNumber: finalOrderNumber,
      product,
      billOfMaterials,
      quantity,
      priority,
      startDate,
      deadline,
      createdBy: req.user._id
    });

    await manufacturingOrder.save();
    await manufacturingOrder.populate('createdBy', 'name email');

    req.app.get('io').emit('manufacturing_order_created', manufacturingOrder);

    res.status(201).json(manufacturingOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

    req.app.get('io').emit('manufacturing_order_updated', order);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;