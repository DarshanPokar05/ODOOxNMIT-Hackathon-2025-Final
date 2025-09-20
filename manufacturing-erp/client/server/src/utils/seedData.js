const User = require('../models/User');
const WorkCenter = require('../models/WorkCenter');
const ManufacturingOrder = require('../models/ManufacturingOrder');
const WorkOrder = require('../models/WorkOrder');

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await WorkCenter.deleteMany({});
    await ManufacturingOrder.deleteMany({});
    await WorkOrder.deleteMany({});

    // Create users
    const admin = new User({
      name: 'Admin User',
      email: 'admin@manufacturing.com',
      password: 'admin123',
      role: 'admin'
    });

    const manager = new User({
      name: 'Production Manager',
      email: 'manager@manufacturing.com',
      password: 'manager123',
      role: 'manager'
    });

    const operator1 = new User({
      name: 'John Operator',
      email: 'john@manufacturing.com',
      password: 'operator123',
      role: 'operator'
    });

    const operator2 = new User({
      name: 'Jane Operator',
      email: 'jane@manufacturing.com',
      password: 'operator123',
      role: 'operator'
    });

    await Promise.all([admin.save(), manager.save(), operator1.save(), operator2.save()]);

    // Create work centers
    const workCenters = [
      {
        name: 'Assembly Station',
        code: 'ASM001',
        qrCode: 'WC_ASM001_' + Date.now(),
        costPerHour: 50,
        capacity: 1
      },
      {
        name: 'Painting Station',
        code: 'PNT001',
        qrCode: 'WC_PNT001_' + Date.now(),
        costPerHour: 40,
        capacity: 1
      },
      {
        name: 'Quality Check',
        code: 'QC001',
        qrCode: 'WC_QC001_' + Date.now(),
        costPerHour: 60,
        capacity: 1
      },
      {
        name: 'Packaging Station',
        code: 'PKG001',
        qrCode: 'WC_PKG001_' + Date.now(),
        costPerHour: 30,
        capacity: 2
      }
    ];

    const savedWorkCenters = await WorkCenter.insertMany(workCenters);

    // Create sample manufacturing order
    const manufacturingOrder = new ManufacturingOrder({
      orderNumber: 'MO0001',
      product: 'Wooden Table',
      quantity: 10,
      status: 'planned',
      priority: 'high',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdBy: manager._id
    });

    await manufacturingOrder.save();

    // Create work orders for the manufacturing order
    const workOrdersData = [
      {
        name: 'Wooden Table - Assembly',
        manufacturingOrder: manufacturingOrder._id,
        workCenter: savedWorkCenters[0]._id,
        sequence: 1,
        status: 'planned'
      },
      {
        name: 'Wooden Table - Painting',
        manufacturingOrder: manufacturingOrder._id,
        workCenter: savedWorkCenters[1]._id,
        sequence: 2,
        status: 'planned'
      },
      {
        name: 'Wooden Table - Quality Check',
        manufacturingOrder: manufacturingOrder._id,
        workCenter: savedWorkCenters[2]._id,
        sequence: 3,
        status: 'planned'
      },
      {
        name: 'Wooden Table - Packaging',
        manufacturingOrder: manufacturingOrder._id,
        workCenter: savedWorkCenters[3]._id,
        sequence: 4,
        status: 'planned'
      }
    ];

    const savedWorkOrders = await WorkOrder.insertMany(workOrdersData);

    // Update manufacturing order with work orders
    manufacturingOrder.workOrders = savedWorkOrders.map(wo => wo._id);
    await manufacturingOrder.save();

    console.log('Database seeded successfully!');
    console.log('Users created:');
    console.log('- Admin: admin@manufacturing.com / admin123');
    console.log('- Manager: manager@manufacturing.com / manager123');
    console.log('- Operator 1: john@manufacturing.com / operator123');
    console.log('- Operator 2: jane@manufacturing.com / operator123');
    console.log('\nWork Centers created with QR codes:');
    savedWorkCenters.forEach(wc => {
      console.log(`- ${wc.name} (${wc.code}): ${wc.qrCode}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;