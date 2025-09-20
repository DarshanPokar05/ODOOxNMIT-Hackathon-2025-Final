const express = require('express');
const ManufacturingOrder = require('../models/ManufacturingOrder');
const WorkOrder = require('../models/WorkOrder');
const WorkCenter = require('../models/WorkCenter');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

// Get dashboard KPIs
router.get('/kpis', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Manufacturing Orders KPIs
    const totalOrders = await ManufacturingOrder.countDocuments();
    const completedOrders = await ManufacturingOrder.countDocuments({ status: 'done' });
    const inProgressOrders = await ManufacturingOrder.countDocuments({ status: 'in_progress' });
    const plannedOrders = await ManufacturingOrder.countDocuments({ status: 'planned' });

    // Work Orders KPIs
    const totalWorkOrders = await WorkOrder.countDocuments();
    const completedWorkOrders = await WorkOrder.countDocuments({ status: 'completed' });
    const activeWorkOrders = await WorkOrder.countDocuments({ 
      status: { $in: ['in_progress', 'paused'] } 
    });

    // Today's completed work orders
    const todayCompletedWorkOrders = await WorkOrder.countDocuments({
      status: 'completed',
      endTime: { $gte: startOfDay, $lte: endOfDay }
    });

    // Work Center Utilization
    const totalWorkCenters = await WorkCenter.countDocuments({ isActive: true });
    const activeWorkCenters = await WorkCenter.countDocuments({ 
      currentWorkOrder: { $ne: null } 
    });

    const utilizationRate = totalWorkCenters > 0 ? 
      Math.round((activeWorkCenters / totalWorkCenters) * 100) : 0;

    res.json({
      manufacturingOrders: {
        total: totalOrders,
        completed: completedOrders,
        inProgress: inProgressOrders,
        planned: plannedOrders,
        completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
      },
      workOrders: {
        total: totalWorkOrders,
        completed: completedWorkOrders,
        active: activeWorkOrders,
        todayCompleted: todayCompletedWorkOrders
      },
      workCenters: {
        total: totalWorkCenters,
        active: activeWorkCenters,
        utilizationRate
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get production analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Daily completion trends
    const completionTrend = await WorkOrder.aggregate([
      {
        $match: {
          status: 'completed',
          endTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$endTime' }
          },
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Work center performance
    const workCenterPerformance = await WorkOrder.aggregate([
      {
        $match: {
          status: 'completed',
          endTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'workcenters',
          localField: 'workCenter',
          foreignField: '_id',
          as: 'workCenterInfo'
        }
      },
      {
        $group: {
          _id: '$workCenter',
          workCenterName: { $first: { $arrayElemAt: ['$workCenterInfo.name', 0] } },
          completedTasks: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    res.json({
      completionTrend,
      workCenterPerformance,
      period
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;