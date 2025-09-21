require('dotenv').config();
const mongoose = require('mongoose');

const fixIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Drop the problematic index
    try {
      await db.collection('stockledgers').dropIndex('materialCode_1');
      console.log('Dropped materialCode_1 index');
    } catch (error) {
      console.log('Index may not exist:', error.message);
    }
    
    // Clear the collection to start fresh
    await db.collection('stockledgers').deleteMany({});
    console.log('Cleared stockledgers collection');
    
    await mongoose.disconnect();
    console.log('Fixed index issue');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixIndex();