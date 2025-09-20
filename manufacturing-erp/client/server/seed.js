require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const seedDatabase = require('./src/utils/seedData');

const runSeed = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();