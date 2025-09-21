require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const ManufacturingOrder = require('./src/models/ManufacturingOrder');

const testDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Test data retrieval
    const users = await User.find();
    console.log(`✅ Found ${users.length} users`);

    const products = await Product.find();
    console.log(`✅ Found ${products.length} products`);

    const orders = await ManufacturingOrder.find();
    console.log(`✅ Found ${orders.length} manufacturing orders`);

    // Test creating new data
    const testProduct = new Product({
      name: 'Test Product',
      code: 'TEST-001',
      type: 'finished',
      costPrice: 100,
      sellingPrice: 120,
      stockQuantity: 10,
      minStockLevel: 2,
      createdBy: users[0]._id
    });

    await testProduct.save();
    console.log('✅ Successfully created test product:', testProduct._id);

    // Verify it was saved
    const savedProduct = await Product.findById(testProduct._id);
    console.log('✅ Retrieved saved product:', savedProduct.name);

    // Clean up test data
    await Product.findByIdAndDelete(testProduct._id);
    console.log('✅ Test product cleaned up');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
};

testDB();