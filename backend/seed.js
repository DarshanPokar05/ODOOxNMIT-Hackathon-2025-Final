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
        type: 'finished',
        costPrice: 450.00,
        sellingPrice: 500.00,
        stockQuantity: 15,
        minStockLevel: 5,
        createdBy: users[0]._id
      },
      {
        name: 'Wooden Legs',
        code: 'WL-001',
        type: 'component',
        costPrice: 25.00,
        sellingPrice: 30.00,
        stockQuantity: 200,
        minStockLevel: 50,
        createdBy: users[0]._id
      },
      {
        name: 'Wooden Top',
        code: 'WTP-001',
        type: 'component',
        costPrice: 180.00,
        sellingPrice: 200.00,
        stockQuantity: 30,
        minStockLevel: 10,
        createdBy: users[0]._id
      },
      {
        name: 'Screws',
        code: 'SCR-001',
        type: 'raw_material',
        costPrice: 0.50,
        sellingPrice: 0.75,
        stockQuantity: 5000,
        minStockLevel: 1000,
        createdBy: users[0]._id
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
        description: 'Main assembly line for furniture',
        qrCode: 'QR-AL-001',
        createdBy: users[0]._id
      },
      {
        name: 'Paint Floor',
        code: 'PF-002',
        location: 'Floor 2, Section B',
        costPerHour: 35,
        capacity: 4,
        utilization: 75,
        description: 'Painting and finishing station',
        qrCode: 'QR-PF-002',
        createdBy: users[0]._id
      },
      {
        name: 'Packaging Line',
        code: 'PL-003',
        location: 'Floor 1, Section C',
        costPerHour: 25,
        capacity: 6,
        utilization: 38,
        description: 'Final packaging and quality check',
        qrCode: 'QR-PL-003',
        createdBy: users[0]._id
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