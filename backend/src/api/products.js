const express = require('express');
const Product = require('../models/Product');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    
    if (category && category !== 'All Categories') {
      filter.category = category;
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    req.app.get('io').emit('product_created', product);
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;