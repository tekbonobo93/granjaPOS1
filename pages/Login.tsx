import React, { useState } from 'react';
import { UserRole } from '../types';
import { login } from '../services/api';
import { Store, UserCircle, KeyRound, Truck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      await login(role);
      onLoginSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-brand-500 p-8 text-center">
          <div className="inline-flex p-3 rounded-full bg-white/20 mb-4">
            <Store className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">GranjaPOS</h1>
          <p className="text-brand-100">Sistema de Gestión Digital</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-center text-gray-600 mb-8 font-medium">Selecciona tu perfil para ingresar</h2>
          
          <div className="space-y-4">
            <button
              disabled={loading}
              onClick={() => handleLogin(UserRole.ADMIN)}
              className="w-full flex items-center p-4 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-brand-50 hover:border-brand-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">Dueño / Admin</p>
                <p className="text-sm text-gray-500">Acceso total al sistema</p>
              </div>
            </button>

            <button
              disabled={loading}
              onClick={() => handleLogin(UserRole.CAJERO)}
              className="w-full flex items-center p-4 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-brand-50 hover:border-brand-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <UserCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">Cajero / Vendedor</p>
                <p className="text-sm text-gray-500">Punto de venta y clientes</p>
              </div>
            </button>

             <button
              disabled={loading}
              onClick={() => handleLogin(UserRole.REPARTIDOR)}
              className="w-full flex items-center p-4 rounded-xl border-2 border-transparent bg-gray-50 hover:bg-brand-50 hover:border-brand-200 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">Repartidor</p>
                <p className="text-sm text-gray-500">Gestión de entregas</p>
              </div>
            </button>
          </div>
          
          {loading && (
            <div className="mt-6 text-center text-brand-600 animate-pulse text-sm">
              Iniciando sistema...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;