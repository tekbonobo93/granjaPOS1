
import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import SalesHistory from './pages/SalesHistory';
import Purchases from './pages/Purchases';
import { getCurrentUser } from './services/api';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('pos');

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      // Redirect based on role
      if (u.role === UserRole.REPARTIDOR) setCurrentPage('orders');
      else setCurrentPage('pos');
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS />;
      case 'inventory': return <Inventory />;
      case 'orders': return <Orders />;
      case 'customers': return <Customers />;
      case 'reports': return <Reports />;
      case 'sales-history': return <SalesHistory />;
      case 'purchases': return <Purchases />;
      default: return <POS />; // Fallback
    }
  };

  if (!user) {
    return <Login onLoginSuccess={() => setUser(getCurrentUser())} />;
  }

  return (
    <Layout 
      user={user} 
      onLogout={() => setUser(null)}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
