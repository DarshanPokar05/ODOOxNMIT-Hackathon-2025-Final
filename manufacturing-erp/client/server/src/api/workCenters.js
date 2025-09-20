const express = require('express');
const QRCode = require('qrcode');
const WorkCenter = require('../models/WorkCenter');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

// Get all work centers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const workCenters = await WorkCenter.find()
      .populate('currentWorkOrder')
      .sort({ name: 1 });
    res.json(workCenters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create work center
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, code, costPerHour, capacity } = req.body;
    
    // Generate unique QR code
    const qrCode = `WC_${code}_${Date.now()}`;
    
    const workCenter = new WorkCenter({
      name,
      code,
      qrCode,
      costPerHour,
      capacity
    });

    await workCenter.save();
    res.status(201).json(workCenter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate QR code image
router.get('/:id/qr-code', authenticateToken, async (req, res) => {
  try {
    const workCenter = await WorkCenter.findById(req.params.id);
    if (!workCenter) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    const qrCodeDataURL = await QRCode.toDataURL(workCenter.qrCode, {
      width: 300,
      margin: 2
    });

    res.json({ 
      qrCode: workCenter.qrCode,
      qrCodeImage: qrCodeDataURL,
      workCenter: workCenter.name
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get work center dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const workCenters = await WorkCenter.find()
      .populate({
        path: 'currentWorkOrder',
        populate: [
          { path: 'manufacturingOrder', select: 'orderNumber product' },
          { path: 'assignedOperator', select: 'name' }
        ]
      })
      .sort({ name: 1 });

    const dashboardData = workCenters.map(wc => ({
      _id: wc._id,
      name: wc.name,
      code: wc.code,
      status: wc.currentWorkOrder ? wc.currentWorkOrder.status : 'idle',
      currentWorkOrder: wc.currentWorkOrder,
      isActive: wc.isActive
    }));

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;