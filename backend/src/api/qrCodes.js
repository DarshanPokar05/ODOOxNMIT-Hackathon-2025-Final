const express = require('express');
const QRCode = require('../models/QRCode');
const WorkCenter = require('../models/WorkCenter');
const WorkOrder = require('../models/WorkOrder');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

// Generate QR code for work center
router.post('/work-center/:id', authenticateToken, async (req, res) => {
  try {
    const workCenter = await WorkCenter.findById(req.params.id);
    if (!workCenter) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    const qrCode = new QRCode({
      code: `WC-${workCenter.code}-${Date.now()}`,
      type: 'work_center',
      referenceId: workCenter._id,
      data: {
        name: workCenter.name,
        location: workCenter.location,
        code: workCenter.code
      },
      createdBy: req.user._id
    });

    await qrCode.save();

    // Update work center with QR code
    await WorkCenter.findByIdAndUpdate(req.params.id, { qrCode: qrCode.code });

    res.status(201).json(qrCode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate QR code for work order
router.post('/work-order/:id', authenticateToken, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate('workCenter', 'name location');
    
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    const qrCode = new QRCode({
      code: `WO-${workOrder.workOrderNumber}-${Date.now()}`,
      type: 'work_order',
      referenceId: workOrder._id,
      data: {
        workOrderNumber: workOrder.workOrderNumber,
        operation: workOrder.operation,
        workCenter: workOrder.workCenter
      },
      createdBy: req.user._id
    });

    await qrCode.save();

    // Update work order with QR code
    await WorkOrder.findByIdAndUpdate(req.params.id, { qrCode: qrCode.code });

    res.status(201).json(qrCode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Scan QR code
router.get('/scan/:code', authenticateToken, async (req, res) => {
  try {
    const qrCode = await QRCode.findOne({ code: req.params.code, isActive: true });
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found or inactive' });
    }

    let details = {};
    
    if (qrCode.type === 'work_center') {
      details = await WorkCenter.findById(qrCode.referenceId)
        .populate('currentWorkOrder')
        .populate('assignedOperator', 'name email');
    } else if (qrCode.type === 'work_order') {
      details = await WorkOrder.findById(qrCode.referenceId)
        .populate('workCenter')
        .populate('assignedTo', 'name email')
        .populate('manufacturingOrder');
    }

    res.json({
      qrCode,
      details
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all QR codes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, isActive = true } = req.query;
    const filter = { isActive };
    
    if (type) filter.type = type;

    const qrCodes = await QRCode.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(qrCodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deactivate QR code
router.patch('/:id/deactivate', authenticateToken, async (req, res) => {
  try {
    const qrCode = await QRCode.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    res.json(qrCode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;