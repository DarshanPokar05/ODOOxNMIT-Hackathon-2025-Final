# Manufacturing ERP Backend

A real-time manufacturing management system with QR code-driven workflow for operators and live dashboard for managers.

## Features

- **Real-time WebSocket Communication**: Instant updates between operators and managers
- **QR Code Integration**: Operators scan QR codes to access work orders
- **Manufacturing Order Management**: Full CRUD operations for production orders
- **Work Order Tracking**: Real-time status updates (Planned, In Progress, Completed)
- **Work Center Management**: QR code generation and capacity management
- **Dashboard Analytics**: KPIs, performance metrics, and utilization rates
- **Role-based Authentication**: Admin, Manager, Operator, Inventory Manager roles

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas
- **Real-time**: Socket.IO for WebSocket communication
- **Authentication**: JWT tokens with bcrypt password hashing
- **QR Codes**: QRCode library for generation

## Quick Start

### 1. Environment Setup

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/manufacturing_erp
JWT_SECRET=your_jwt_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Seed Database

```bash
npm run seed
```

This creates demo users and work centers:
- **Admin**: admin@manufacturing.com / admin123
- **Manager**: manager@manufacturing.com / manager123
- **Operator 1**: john@manufacturing.com / operator123
- **Operator 2**: jane@manufacturing.com / operator123

### 4. Start Server

```bash
npm run dev
```

Server runs on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Manufacturing Orders
- `GET /api/manufacturing-orders` - Get all orders (with filters)
- `POST /api/manufacturing-orders` - Create new order
- `PATCH /api/manufacturing-orders/:id/status` - Update order status

### Work Orders
- `GET /api/work-orders` - Get all work orders
- `GET /api/work-orders/qr/:qrCode` - Get work order by QR code
- `PATCH /api/work-orders/:id/status` - Update work order status

### Work Centers
- `GET /api/work-centers` - Get all work centers
- `POST /api/work-centers` - Create work center
- `GET /api/work-centers/:id/qr-code` - Generate QR code image
- `GET /api/work-centers/dashboard` - Get dashboard data

### Dashboard
- `GET /api/dashboard/kpis` - Get KPI metrics
- `GET /api/dashboard/analytics` - Get analytics data

## WebSocket Events

### Client to Server
- `join_dashboard` - Join dashboard room for real-time updates
- `scan_qr_code` - Operator scans QR code
- `update_work_order` - Update work order status

### Server to Client
- `work_order_updated` - Work order status changed
- `manufacturing_order_created` - New manufacturing order created
- `manufacturing_order_updated` - Manufacturing order updated
- `qr_scan_success` - QR code scan successful
- `qr_scan_error` - QR code scan failed

## Database Models

### User
- Authentication and role management
- Roles: admin, manager, operator, inventory_manager

### WorkCenter
- Physical work stations with QR codes
- Capacity and cost tracking

### ManufacturingOrder
- Main production orders
- Status tracking and progress calculation

### WorkOrder
- Individual tasks within manufacturing orders
- Real-time status updates and time tracking

## Demo Workflow

1. **Setup**: Admin creates work centers and generates QR codes
2. **Order Creation**: Manager creates manufacturing order for "10 Wooden Tables"
3. **Work Assignment**: System auto-generates work orders for each step
4. **Operator Action**: Operator scans QR code at Assembly Station
5. **Real-time Update**: Manager's dashboard instantly shows "In Progress"
6. **Completion**: Operator taps "Complete" → Dashboard updates → Next task activates
7. **Final Production**: All tasks complete → 10 tables added to inventory

## Development

### Project Structure
```
server/
├── src/
│   ├── api/           # API routes and controllers
│   ├── models/        # Database schemas
│   ├── services/      # Business logic
│   ├── websockets/    # Socket.IO handlers
│   ├── config/        # Database connection
│   └── utils/         # Helper functions
├── index.js           # Main server entry point
└── seed.js           # Database seeding script
```

### Git Workflow for Two Developers

**Person 1 Commits:**
1. Project setup & configuration
2. Database models (User, WorkCenter, WorkOrder)
3. Work Orders API & QR integration
4. Manufacturing service & business logic
5. Seed data & setup scripts

**Person 2 Commits:**
1. Authentication API
2. Manufacturing Orders API
3. WebSocket handlers & real-time updates
4. Dashboard analytics & reports
5. Final documentation & deployment setup

This ensures clean commit history and parallel development without conflicts.