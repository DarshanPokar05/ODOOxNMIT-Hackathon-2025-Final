const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    let mongoUri = process.env.MONGODB_URI || 'mongodb+srv://arjun:Arjun4206@cluster0.jgjhqoa.mongodb.net/manufacturing_erp?retryWrites=true&w=majority&appName=Cluster0';
    
    // Ensure database name is included for Atlas
    if (mongoUri.includes('mongodb+srv') && !mongoUri.includes('/manufacturing_erp')) {
      mongoUri = mongoUri.replace('cluster0.jgjhqoa.mongodb.net/', 'cluster0.jgjhqoa.mongodb.net/manufacturing_erp');
    }
    
    console.log('Connecting to:', mongoUri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Test write operation
    await conn.connection.db.admin().ping();
    console.log('MongoDB ping successful');
    
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB Atlas. Check:');
      console.error('1. Network connectivity');
      console.error('2. Database credentials');
      console.error('3. IP whitelist in MongoDB Atlas');
    }
    process.exit(1);
  }
};

module.exports = connectDB;