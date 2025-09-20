import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ManufacturingOrders from './components/ManufacturingOrders';
import WorkOrders from './components/WorkOrders';
import LiveShopFloor from './components/LiveShopFloor';
import WorkCenters from './components/WorkCenters';
import StockLedger from './components/StockLedger';
import BillsOfMaterial from './components/BillsOfMaterial';
import ProductMaster from './components/ProductMaster';
import MyProfile from './components/MyProfile';
import ProfileReports from './components/ProfileReports';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token: string) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'manufacturing-orders':
        return <ManufacturingOrders />;
      case 'work-orders':
        return <WorkOrders />;
      case 'live-shop-floor':
        return <LiveShopFloor />;
      case 'work-centers':
        return <WorkCenters />;
      case 'stock-ledger':
        return <StockLedger />;
      case 'bills-of-material':
        return <BillsOfMaterial />;
      case 'product-master':
        return <ProductMaster />;
      case 'my-profile':
        return <MyProfile />;
      case 'profile-reports':
        return <ProfileReports />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}

export default App;