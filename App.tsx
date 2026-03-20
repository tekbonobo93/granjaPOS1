
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

  // Centralized routing logic based on role
  const routeUser = (u: User) => {
    if (u.role === UserRole.REPARTIDOR) {
      setCurrentPage('orders');
    } else {
      // Admin and Cajero default to POS for quick access
      setCurrentPage('pos');
    }
  };

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      routeUser(u);
    }
  }, []);

  const handleLogin = () => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      routeUser(u);
    }
  };

  // Page permissions mapping
  const PAGE_PERMISSIONS: Record<string, UserRole[]> = {
    'dashboard': [UserRole.ADMIN],
    'pos': [UserRole.ADMIN, UserRole.CAJERO],
    'inventory': [UserRole.ADMIN],
    'orders': [UserRole.ADMIN, UserRole.CAJERO, UserRole.REPARTIDOR],
    'customers': [UserRole.ADMIN, UserRole.CAJERO],
    'reports': [UserRole.ADMIN],
    'sales-history': [UserRole.ADMIN],
    'purchases': [UserRole.ADMIN],
  };

  const renderPage = () => {
    // Check if user has permission for the current page
    const allowedRoles = PAGE_PERMISSIONS[currentPage] || [];
    if (user && !allowedRoles.includes(user.role)) {
      // If not allowed, redirect to the first allowed page or POS
      const firstAllowed = Object.keys(PAGE_PERMISSIONS).find(p => PAGE_PERMISSIONS[p].includes(user.role)) || 'pos';
      setCurrentPage(firstAllowed);
      return null;
    }

    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS />;
      case 'inventory': return <Inventory />;
      case 'orders': return <Orders onNavigate={setCurrentPage} />;
      case 'customers': return <Customers />;
      case 'reports': return <Reports />;
      case 'sales-history': return <SalesHistory />;
      case 'purchases': return <Purchases />;
      default: return <POS />; // Fallback
    }
  };

  if (!user) {
    return <Login onLoginSuccess={handleLogin} />;
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
