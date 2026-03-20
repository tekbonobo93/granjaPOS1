import React, { useState } from 'react';
import { login } from '../services/api';
import { Store, User, Lock, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor ingrese usuario y contraseña');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-brand-600 p-10 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-6 shadow-inner">
              <Store className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">GranjaPOS</h1>
            <p className="text-brand-100 font-medium opacity-90">Gestión Inteligente de Granja</p>
          </div>
        </div>
        
        <div className="p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Bienvenido</h2>
            <p className="text-slate-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  placeholder="ej. admin"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg shadow-lg shadow-brand-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Ingresar al Sistema'
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-center text-slate-400 text-xs uppercase tracking-widest font-bold mb-4">Credenciales de Prueba</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Admin</p>
                <p className="text-xs font-mono text-slate-600">admin / 123</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Cajero</p>
                <p className="text-xs font-mono text-slate-600">cajero / 123</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Repartidor</p>
                <p className="text-xs font-mono text-slate-600">repartidor / 123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;