
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  LogOut, 
  Menu,
  X,
  Store,
  PieChart,
  History,
  ClipboardList
} from 'lucide-react';
import { UserRole, User } from '../types';
import { logout } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentPage, onNavigate }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getMenuItems = () => {
    const items = [
      { id: 'pos', label: 'Punto de Venta', icon: ShoppingCart, roles: [UserRole.ADMIN, UserRole.CAJERO] },
      { id: 'orders', label: 'Delivery / Pedidos', icon: Truck, roles: [UserRole.ADMIN, UserRole.CAJERO, UserRole.REPARTIDOR] },
    ];

    if (user.role === UserRole.ADMIN) {
      items.unshift({ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN] });
      items.push({ id: 'sales-history', label: 'Historial Ventas', icon: History, roles: [UserRole.ADMIN] });
      items.push({ id: 'purchases', label: 'Compras / Insumos', icon: ClipboardList, roles: [UserRole.ADMIN] });
      items.push({ id: 'reports', label: 'Reportes Financieros', icon: PieChart, roles: [UserRole.ADMIN] });
      items.push({ id: 'inventory', label: 'Inventario', icon: Package, roles: [UserRole.ADMIN] });
      items.push({ id: 'customers', label: 'Clientes', icon: Users, roles: [UserRole.ADMIN, UserRole.CAJERO] });
    }

    return items;
  };

  const navItemClass = (id: string) => `
    flex items-center w-full px-4 py-3 mb-1 rounded-lg transition-colors
    ${currentPage === id 
      ? 'bg-brand-500 text-white shadow-md' 
      : 'text-gray-600 hover:bg-brand-50 hover:text-brand-600'}
  `;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 flex items-center border-b border-gray-100">
          <div className="bg-brand-500 p-2 rounded-lg mr-3">
             <Store className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">GranjaPOS</h1>
            <p className="text-xs text-gray-500">Sistema Digital</p>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {getMenuItems().map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={navItemClass(item.id)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              logout();
              onLogout();
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-20 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Store className="text-brand-500 w-6 h-6 mr-2" />
          <span className="font-bold text-gray-800">GranjaPOS</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-gray-600">
          {isMobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-10 md:hidden" onClick={() => setIsMobileOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white p-4 shadow-xl" onClick={e => e.stopPropagation()}>
             <div className="mt-14 space-y-2">
              {getMenuItems().map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={navItemClass(item.id)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              ))}
              <div className="border-t pt-4 mt-4">
                 <button 
                  onClick={() => {
                    logout();
                    onLogout();
                  }}
                  className="flex items-center w-full px-4 py-2 text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </button>
              </div>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
