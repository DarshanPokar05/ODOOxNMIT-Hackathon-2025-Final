const express = require('express');
const StockLedger = require('../models/StockLedger');
const Product = require('../models/Product');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();

// Get stock ledger entries
router.get('/', async (req, res) => {
  try {
    const { product, transactionType, startDate, endDate } = req.query;
    const filter = {};
    
    if (product) filter.product = product;
    if (transactionType) filter.transactionType = transactionType;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const entries = await StockLedger.find(filter)
      .populate('product', 'name code unit')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current stock levels
router.get('/current-stock', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('name code unit stockQuantity minStockLevel');
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create stock entry (adjustment)
router.post('/', async (req, res) => {
  try {
    const { productId, type, quantity, reason, reference, referenceType, notes } = req.body;
    const transactionType = type;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate new balance
    let newBalance = product.stockQuantity;
    if (transactionType === 'in') {
      newBalance += quantity;
    } else if (transactionType === 'out') {
      newBalance -= quantity;
      if (newBalance < 0) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
    } else if (transactionType === 'adjustment') {
      newBalance = quantity;
    }

    // Create ledger entry
    const ledgerEntry = new StockLedger({
      product: productId,
      transactionType,
      quantity: transactionType === 'adjustment' ? quantity - product.stockQuantity : quantity,
      balanceQuantity: newBalance,
      reference,
      referenceType,
      notes,
      createdBy: (await require('../models/User').findOne({ email: 'manager@manufacturing.com' }) || await require('../models/User').findOne())._id
    });

    await ledgerEntry.save();
    await ledgerEntry.populate('product', 'name code unit');
    await ledgerEntry.populate('createdBy', 'name email');

    // Update product stock
    await Product.findByIdAndUpdate(productId, { stockQuantity: newBalance });

    req.app.get('io').emit('stock_updated', {
      product: productId,
      newBalance,
      entry: ledgerEntry
    });

    res.status(201).json(ledgerEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stock movement for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const entries = await StockLedger.find({ product: req.params.productId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;