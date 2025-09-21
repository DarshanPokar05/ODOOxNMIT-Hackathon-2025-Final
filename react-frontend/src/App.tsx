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
import QRScanner from './components/QRScanner';
import MyProfile from './components/MyProfile';
import ProfileReports from './components/ProfileReports';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'dashboard';
  });
  const [liveShopFloorRefresh, setLiveShopFloorRefresh] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Only set authenticated if token exists and is valid
    if (token && token !== 'null' && token !== 'undefined') {
      setIsAuthenticated(true);
    } else {
      // Clear invalid tokens
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
  }, []);

  const handlePageChange = (page: string, fromQRScanner?: boolean) => {
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
    
    // Trigger refresh if navigating to live-shop-floor from QR scanner
    if (page === 'live-shop-floor' && fromQRScanner) {
      setLiveShopFloorRefresh(prev => prev + 1);
    }
  };

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
        return <LiveShopFloor refreshTrigger={liveShopFloorRefresh} />;
      case 'work-centers':
        return <WorkCenters />;
      case 'stock-ledger':
        return <StockLedger />;
      case 'bills-of-material':
        return <BillsOfMaterial />;
      case 'product-master':
        return <ProductMaster />;
      case 'qr-scanner':
        return <QRScanner onNavigate={(page) => handlePageChange(page, true)} />;
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
    <Layout currentPage={currentPage} onNavigate={handlePageChange} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}

export default App;