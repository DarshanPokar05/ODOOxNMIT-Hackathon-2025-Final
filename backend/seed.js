require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const ManufacturingOrder = require('./src/models/ManufacturingOrder');
const WorkCenter = require('./src/models/WorkCenter');
const Product = require('./src/models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await ManufacturingOrder.deleteMany({});
    await WorkCenter.deleteMany({});
    await Product.deleteMany({});

    // Create users
    const users = await User.create([
      {
        name: 'John Manager',
        email: 'manager@manufacturing.com',
        password: 'password123',
        role: 'manager'
      },
      {
        name: 'Jane Operator',
        email: 'operator@manufacturing.com',
        password: 'password123',
        role: 'operator'
      }
    ]);

    // Create products
    const products = await Product.create([
      {
        name: 'Wooden Table',
        code: 'WT-001',
        category: 'Furniture',
        stockLevel: 15,
        minStock: 5,
        unitCost: 450.00
      },
      {
        name: 'Wooden Legs',
        code: 'WL-001',
        category: 'Components',
        stockLevel: 200,
        minStock: 50,
        unitCost: 25.00
      },
      {
        name: 'Wooden Top',
        code: 'WTP-001',
        category: 'Components',
        stockLevel: 30,
        minStock: 10,
        unitCost: 180.00
      },
      {
        name: 'Screws',
        code: 'SCR-001',
        category: 'Hardware',
        stockLevel: 5000,
        minStock: 1000,
        unitCost: 0.50
      }
    ]);

    // Create work centers
    const workCenters = await WorkCenter.create([
      {
        name: 'Assembly Line',
        code: 'AL-001',
        location: 'Floor 1, Section A',
        costPerHour: 50,
        capacity: 8,
        utilization: 14,
        description: 'Main assembly line for furniture'
      },
      {
        name: 'Paint Floor',
        code: 'PF-002',
        location: 'Floor 2, Section B',
        costPerHour: 35,
        capacity: 4,
        utilization: 75,
        description: 'Painting and finishing station'
      },
      {
        name: 'Packaging Line',
        code: 'PL-003',
        location: 'Floor 1, Section C',
        costPerHour: 25,
        capacity: 6,
        utilization: 38,
        description: 'Final packaging and quality check'
      }
    ]);

    // Create manufacturing orders
    await ManufacturingOrder.create([
      {
        orderNumber: 'MO-175836447863',
        product: 'Screws',
        quantity: 70,
        status: 'planned',
        priority: 'medium',
        deadline: new Date('2025-09-27'),
        createdBy: users[0]._id,
        progress: 0
      },
      {
        orderNumber: 'MO-175836954309',
        product: 'Wooden Legs',
        quantity: 1,
        status: 'in_progress',
        priority: 'medium',
        deadline: new Date('2025-09-27'),
        createdBy: users[0]._id,
        progress: 50
      }
    ]);

    console.log('Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();