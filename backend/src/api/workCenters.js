const express = require('express');
const WorkCenter = require('../models/WorkCenter');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const workCenters = await WorkCenter.find({ isActive: true });
    res.json(workCenters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const workCenter = new WorkCenter(req.body);
    await workCenter.save();
    
    req.app.get('io').emit('work_center_created', workCenter);
    
    res.status(201).json(workCenter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Shop floor specific endpoints
router.get('/shop-floor', authenticateToken, async (req, res) => {
  try {
    const workCenters = await WorkCenter.find({})
      .select('name code location status currentOperation qrCode utilization isRunning')
      .sort({ name: 1 });
    
    res.json(workCenters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, isRunning } = req.body;
    const workCenter = await WorkCenter.findByIdAndUpdate(
      req.params.id,
      { status, isRunning },
      { new: true }
    );

    if (!workCenter) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    req.app.get('io').emit('shop_floor_update', workCenter);

    res.json(workCenter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;