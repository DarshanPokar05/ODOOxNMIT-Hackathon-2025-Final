#Video link
https://drive.google.com/file/d/16SaqxpBojs39nrOGerITd9MuJkPau2sx/view?usp=drivesdk

# Manufacturing ERP System

Complete manufacturing management system with React.js frontend and Node.js backend integrated with MongoDB and real-time updates.

## 🚀 Quick Start

1. **Install MongoDB** (if not installed):
   - Download from https://www.mongodb.com/try/download/community
   - Create data directory: `mkdir C:\data\db`

2. **Run the system**:
   ```bash
   # Double-click start-system.bat or run:
   start-system.bat
   ```

3. **Login**:
   - Email: `manager@manufacturing.com`
   - Password: `password123`

## 📁 Project Structure

```
├── backend/                 # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── api/            # REST API routes
│   │   ├── models/         # MongoDB models
│   │   ├── config/         # Database config
│   │   └── websockets/     # Real-time updates
│   └── seed.js             # Sample data
├── react-frontend/         # React.js + TypeScript + Tailwind
│   └── src/
│       ├── components/     # UI components
│       └── services/       # API integration
└── start-system.bat       # System startup script
```

## ✨ Features

### Dashboard
- Real-time KPI cards (Total Orders, Completed, In Progress, Delayed)
- Manufacturing orders overview with live updates
- Search and filter functionality

### Work Centers
- Machine and location management
- Capacity and utilization tracking
- Real-time status updates

### Stock Ledger
- Inventory tracking with MongoDB integration
- Product categories and search
- Stock levels and valuations

### Bills of Material
- Component and operation definitions
- Cost calculations
- BOM management interface

## 🔧 Technology Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS
- Socket.io-client
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT Authentication

## 🔄 Real-time Features

- Live dashboard updates
- Manufacturing order status changes
- Work center modifications
- Inventory movements

## 🗄️ Database Models

- **Users**: Authentication and roles
- **Manufacturing Orders**: Production tracking
- **Work Centers**: Machine management
- **Products**: Inventory items

## 🔐 Authentication

JWT-based authentication with role-based access:
- Manager: Full access
- Operator: Limited access

## 📊 Sample Data

The system includes pre-populated data:
- 2 users (manager, operator)
- 4 products (furniture components)
- 3 work centers
- 2 manufacturing orders

## 🚀 Manual Setup

If you prefer manual setup:

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run seed    # Populate database
   npm start       # Start server on port 5000
   ```

2. **Frontend**:
   ```bash
   cd react-frontend
   npm install
   npm start       # Start on port 3000
   ```

## 🌐 API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/dashboard/kpis` - Dashboard metrics
- `GET /api/manufacturing-orders` - Production orders
- `GET /api/work-centers` - Work centers
- `GET /api/products` - Inventory items

## 🔧 Configuration

Environment variables in `backend/.env`:
- `MONGODB_URI`: Database connection
- `JWT_SECRET`: Authentication secret
- `PORT`: Server port (default: 5000)