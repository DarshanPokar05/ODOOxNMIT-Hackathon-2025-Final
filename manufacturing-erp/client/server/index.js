require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./src/config/database');
const handleSocketConnection = require('./src/websockets/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO connection handling
handleSocketConnection(io);

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./src/api/auth'));
app.use('/api/manufacturing-orders', require('./src/api/manufacturingOrders'));
app.use('/api/work-orders', require('./src/api/workOrders'));
app.use('/api/work-centers', require('./src/api/workCenters'));
app.use('/api/dashboard', require('./src/api/dashboard'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});