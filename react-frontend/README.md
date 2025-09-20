# ManufacturingOS Frontend

A React.js frontend for the Manufacturing ERP system that provides a comprehensive dashboard for managing manufacturing operations.

## Features

- **Dashboard**: Overview of manufacturing orders with KPI cards
- **Login System**: Secure authentication with gradient design
- **Work Centers**: Manage machines, locations, and production capacity
- **Stock Ledger**: Track inventory levels and material movements
- **Bills of Material**: Define material requirements and operations
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Heroicons for icons
- Axios for API communication
- Socket.io-client for real-time updates

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Make sure the backend server is running on http://localhost:5000

## API Integration

The frontend connects to the backend API endpoints:
- Authentication: `/api/auth/login`
- Dashboard KPIs: `/api/dashboard/kpis`
- Manufacturing Orders: `/api/manufacturing-orders`
- Work Centers: `/api/work-centers`

## Default Login Credentials

Use the credentials from your backend seed data to log in.

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx          # Main layout with sidebar
│   ├── Login.tsx           # Login page
│   ├── Dashboard.tsx       # Main dashboard
│   ├── WorkCenters.tsx     # Work centers management
│   ├── StockLedger.tsx     # Inventory tracking
│   └── BillsOfMaterial.tsx # BOM management
├── services/
│   └── api.ts              # API service layer
├── App.tsx                 # Main app component
└── index.tsx               # Entry point
```