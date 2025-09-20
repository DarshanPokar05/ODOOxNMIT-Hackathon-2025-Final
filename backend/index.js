require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./src/config/database');
const handleSocketConnection = require('./src/websockets/socketHandler');

console.log('Starting server...');
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI ? 'Loaded' : 'Missing'
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

console.log('Connecting to database...');
connectDB().catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));
app.use(express.json());

handleSocketConnection(io);
app.set('io', io);

// Add a basic test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date() });
});

console.log('Loading API routes...');
try {
  app.use('/api/auth', require('./src/api/auth'));
  console.log('Auth routes loaded');
  app.use('/api/manufacturing-orders', require('./src/api/manufacturingOrders'));
  console.log('Manufacturing orders routes loaded');
  app.use('/api/work-orders', require('./src/api/workOrders'));
  console.log('Work orders routes loaded');
  const bomRoutes = require('./src/api/billsOfMaterial');
  app.use('/api/bills-of-material', bomRoutes);
  console.log('Bills of material routes loaded successfully');
  
  // Direct BOM creation endpoint for testing
  app.post('/api/create-bom', async (req, res) => {
    try {
      console.log('Direct BOM creation:', req.body);
      const BillOfMaterial = require('./src/models/BillOfMaterial');
      
      const { product, version, status, components, operations } = req.body;
      
      const bomCount = await BillOfMaterial.countDocuments();
      const bomNumber = `BOM-${new Date().getFullYear()}-${String(bomCount + 1).padStart(3, '0')}`;
      const totalCost = components.reduce((sum, comp) => sum + (comp.quantity * 10), 0);

      const bom = new BillOfMaterial({
        bomNumber,
        product,
        version: version || '1.0',
        status: status || 'draft',
        components,
        operations,
        totalCost
      });

      await bom.save();
      console.log('BOM saved:', bom._id);
      res.status(201).json(bom);
    } catch (error) {
      console.error('Direct BOM creation error:', error);
      res.status(500).json({ message: error.message });
    }
  });
  app.use('/api/stock-ledger', require('./src/api/stockLedger'));
  console.log('Stock ledger routes loaded');
  app.use('/api/qr-codes', require('./src/api/qrCodes'));
  console.log('QR codes routes loaded');
  app.use('/api/products', require('./src/api/products'));
  console.log('Products routes loaded');
  app.use('/api/work-centers', require('./src/api/workCenters'));
  console.log('Work centers routes loaded');
  app.use('/api/dashboard', require('./src/api/dashboard'));
  console.log('Dashboard routes loaded');
} catch (error) {
  console.error('Error loading routes:', error);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the server at: http://localhost:${PORT}/test`);
  console.log(`Auth test at: http://localhost:${PORT}/api/auth/test`);
});