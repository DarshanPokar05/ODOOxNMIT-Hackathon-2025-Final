require('dotenv').config();
const mongoose = require('mongoose');

const testAtlas = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Testing Atlas connection...');
    console.log('URI:', mongoUri.replace(/:(\/\/[^:]+:)[^@]+@/, ':$1***@'));
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to Atlas:', conn.connection.host);
    console.log('✅ Database:', conn.connection.name);
    
    // Test write operation
    const testCollection = conn.connection.db.collection('test');
    const result = await testCollection.insertOne({ test: 'data', timestamp: new Date() });
    console.log('✅ Write test successful:', result.insertedId);
    
    // Clean up test data
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Cleanup successful');
    
    await mongoose.disconnect();
    console.log('✅ Atlas connection test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Atlas connection failed:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.error('Check: Network, credentials, IP whitelist');
    }
    process.exit(1);
  }
};

testAtlas();