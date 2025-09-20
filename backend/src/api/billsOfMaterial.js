const express = require('express');
const BillOfMaterial = require('../models/BillOfMaterial');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Bills of Material API is working' });
});

router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { product: { $regex: search, $options: 'i' } },
        { bomNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const boms = await BillOfMaterial.find(filter)
      // .populate('createdBy', 'name email') // Temporary disable
      .sort({ createdAt: -1 });

    res.json(boms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('BOM creation request received:', req.body);
    const { product, version, status, components, operations } = req.body;
    
    if (!product) {
      return res.status(400).json({ message: 'Product is required' });
    }
    
    if (!components || components.length === 0) {
      return res.status(400).json({ message: 'At least one component is required' });
    }
    
    if (!operations || operations.length === 0) {
      return res.status(400).json({ message: 'At least one operation is required' });
    }
    
    const bomCount = await BillOfMaterial.countDocuments();
    const bomNumber = `BOM-${new Date().getFullYear()}-${String(bomCount + 1).padStart(3, '0')}`;

    // Calculate total cost
    const totalCost = components.reduce((sum, comp) => sum + (comp.quantity * 10), 0);

    const bom = new BillOfMaterial({
      bomNumber,
      product,
      version: version || '1.0',
      status: status || 'draft',
      components,
      operations,
      totalCost,
      createdBy: null // Temporary for testing
    });

    console.log('Saving BOM:', bom);
    await bom.save();
    // await bom.populate('createdBy', 'name email'); // Temporary disable

    req.app.get('io').emit('bom_created', bom);
    console.log('BOM created successfully:', bom._id);

    res.status(201).json(bom);
  } catch (error) {
    console.error('BOM creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const bom = await BillOfMaterial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ); // .populate('createdBy', 'name email'); // Temporary disable

    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    req.app.get('io').emit('bom_updated', bom);

    res.json(bom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const bom = await BillOfMaterial.findByIdAndDelete(req.params.id);

    if (!bom) {
      return res.status(404).json({ message: 'BOM not found' });
    }

    req.app.get('io').emit('bom_deleted', { id: req.params.id });

    res.json({ message: 'BOM deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;