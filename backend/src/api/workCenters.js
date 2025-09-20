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

module.exports = router;