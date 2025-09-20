const express = require('express');
const ManufacturingOrder = require('../models/ManufacturingOrder');
const WorkCenter = require('../models/WorkCenter');
const Product = require('../models/Product');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

router.get('/kpis', authenticateToken, async (req, res) => {
  try {
    const totalOrders = await ManufacturingOrder.countDocuments();
    const completedOrders = await ManufacturingOrder.countDocuments({ status: 'done' });
    const inProgressOrders = await ManufacturingOrder.countDocuments({ status: 'in_progress' });
    const plannedOrders = await ManufacturingOrder.countDocuments({ status: 'planned' });

    const totalWorkCenters = await WorkCenter.countDocuments({ isActive: true });
    const totalProducts = await Product.countDocuments();
    const totalStockValue = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$stockLevel', '$unitCost'] } } } }
    ]);

    res.json({
      manufacturingOrders: {
        total: totalOrders,
        completed: completedOrders,
        inProgress: inProgressOrders,
        planned: plannedOrders
      },
      workCenters: {
        total: totalWorkCenters,
        active: totalWorkCenters
      },
      inventory: {
        totalProducts,
        stockValue: totalStockValue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;