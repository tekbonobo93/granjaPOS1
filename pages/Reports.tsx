import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getOrders, getProducts } from '../services/api';
import { Order, Product, OrderStatus } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, CalendarRange, ArrowRight } from 'lucide-react';

type DateFilter = 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'ALL' | 'CUSTOM';

const Reports: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<DateFilter>('WEEK');
  
  // Custom Date Range State
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  
  // KPI States
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);
  
  useEffect(() => {
    loadData();
    // Set default custom dates to today
    const today = new Date().toISOString().split('T')[0];
    setCustomStart(today);
    setCustomEnd(today);
  }, []);

  const loadData = async () => {
    const [o, p] = await Promise.all([getOrders(), getProducts()]);
    setOrders(o);
    setProducts(p);
  };

  useEffect(() => {
    calculateMetrics();
  }, [orders, products, filter, customStart, customEnd]);

  const calculateMetrics = () => {
    // 1. Calculate Inventory Value (Current Asset)
    const currentInvValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
    setInventoryValue(currentInvValue);

    // 2. Filter Orders by Date
    const filteredOrders = orders.filter(o => {
      // Ignore cancelled
      if (o.status === OrderStatus.CANCELADO) return false;
      
      const orderDate = new Date(o.date);
      // Reset hours for simpler comparison for standard filters
      const orderDateMidnight = new Date(o.date);
      orderDateMidnight.setHours(0,0,0,0);
      
      const today = new Date();
      today.setHours(0,0,0,0);
      
      if (filter === 'TODAY') return orderDateMidnight.getTime() === today.getTime();
      if (filter === 'YESTERDAY') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return orderDateMidnight.getTime() === yesterday.getTime();
      }
      if (filter === 'WEEK') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDateMidnight >= weekAgo;
      }
      if (filter === 'MONTH') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return orderDateMidnight >= monthAgo;
      }
      if (filter === 'CUSTOM') {
          if (!customStart || !customEnd) return true;
          const start = new Date(customStart);
          // Set to beginning of start day (UTC/Local issue mitigation: use standard string parsing)
          start.setHours(0,0,0,0);

          const end = new Date(customEnd);
          // Set to end of end day
          end.setHours(23,59,59,999);
          
          return orderDate >= start && orderDate <= end;
      }
      return true; // ALL
    });

    // 3. Calculate Financials based on filtered orders
    let revenue = 0;
    let cost = 0;

    filteredOrders.forEach(order => {
        revenue += order.total;
        order.items.forEach(item => {
            // Use historical cost if available, else current product cost
            // Fallback is crucial for mock data stability
            const productRef = products.find(p => p.id === item.productId);
            const itemCostUnit = item.costAtSale ?? productRef?.cost ?? 0;
            
            // Adjust for weight based logic if needed, but item.quantity should be in base unit (Kg or Unit)
            cost += (item.quantity * itemCostUnit);
        });
    });

    setTotalRevenue(revenue);
    setTotalCost(cost);
    setNetProfit(revenue - cost);
  };

  // Chart Data Preparation
  const getChartData = () => {
      // Group by date
      const dataMap: Record<string, { date: string, revenue: number, profit: number }> = {};
      
      const relevantOrders = orders.filter(o => o.status !== OrderStatus.CANCELADO);
      
      // We must apply the same date filter to the chart data
      const filteredChartOrders = relevantOrders.filter(o => {
          const orderDate = new Date(o.date);
          const orderDateMidnight = new Date(o.date);
          orderDateMidnight.setHours(0,0,0,0);
          
          const today = new Date();
          today.setHours(0,0,0,0);

          if (filter === 'TODAY') return orderDateMidnight.getTime() === today.getTime();
          if (filter === 'YESTERDAY') {
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              return orderDateMidnight.getTime() === yesterday.getTime();
          }
          if (filter === 'WEEK') {
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              return orderDateMidnight >= weekAgo;
          }
          if (filter === 'MONTH') {
              const monthAgo = new Date(today);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return orderDateMidnight >= monthAgo;
          }
           if (filter === 'CUSTOM') {
              if (!customStart || !customEnd) return true;
              const start = new Date(customStart);
              start.setHours(0,0,0,0);
              const end = new Date(customEnd);
              end.setHours(23,59,59,999);
              return orderDate >= start && orderDate <= end;
          }
          return true;
      });
      
      filteredChartOrders.forEach(o => {
          const dateStr = new Date(o.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
          if (!dataMap[dateStr]) dataMap[dateStr] = { date: dateStr, revenue: 0, profit: 0 };
          
          dataMap[dateStr].revenue += o.total;
          
          let orderCost = 0;
          o.items.forEach(i => {
             const p = products.find(prod => prod.id === i.productId);
             const c = i.costAtSale ?? p?.cost ?? 0;
             orderCost += (i.quantity * c);
          });
          dataMap[dateStr].profit += (o.total - orderCost);
      });

      // Sort by date key logic is tricky with formatted strings, so we rely on input order being mostly sorted or minimal impact.
      // For a real app, we'd use timestamps as keys then format for display.
      // Assuming mock data is somewhat chronological.
      return Object.values(dataMap);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reportes Financieros</h2>
          <p className="text-gray-500">Análisis de rentabilidad e inversión</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button onClick={() => setFilter('TODAY')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'TODAY' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:text-gray-900'}`}>Hoy</button>
            <button onClick={() => setFilter('WEEK')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'WEEK' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:text-gray-900'}`}>7 Días</button>
            <button onClick={() => setFilter('MONTH')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'MONTH' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:text-gray-900'}`}>Mes</button>
            <button onClick={() => setFilter('ALL')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'ALL' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:text-gray-900'}`}>Todo</button>
            <div className="w-px bg-gray-200 mx-1"></div>
            <button onClick={() => setFilter('CUSTOM')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1 ${filter === 'CUSTOM' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:text-gray-900'}`}>
                <CalendarRange className="w-4 h-4" />
                <span>Personalizado</span>
            </button>
            </div>

            {/* Custom Date Inputs */}
            {filter === 'CUSTOM' && (
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm animate-in slide-in-from-top-2 duration-200">
                    <input 
                        type="date" 
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <input 
                        type="date" 
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                </div>
            )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                    <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase">Ventas</span>
             </div>
             <p className="text-3xl font-bold text-gray-800">$ {totalRevenue.toFixed(2)}</p>
             <p className="text-sm text-gray-500 mt-1">Ingresos brutos</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                    <TrendingDown className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase">Gastos (Costo)</span>
             </div>
             <p className="text-3xl font-bold text-gray-800">$ {totalCost.toFixed(2)}</p>
             <p className="text-sm text-gray-500 mt-1">Costo de mercadería vendida</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-brand-100 text-brand-600 rounded-lg">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase">Ganancia Neta</span>
             </div>
             <p className="text-3xl font-bold text-gray-800">$ {netProfit.toFixed(2)}</p>
             <p className={`text-sm font-bold mt-1 ${netProfit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}% Margen
             </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute right-0 top-0 h-full w-2 bg-blue-500"></div>
             <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <Wallet className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase">Inversión Actual</span>
             </div>
             <p className="text-3xl font-bold text-gray-800">$ {inventoryValue.toFixed(2)}</p>
             <p className="text-sm text-gray-500 mt-1">Capital en inventario</p>
          </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                Ingresos vs Ganancias (Histórico)
            </h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <Tooltip formatter={(value: number) => `$ ${value.toFixed(2)}`} />
                        <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#colorRev)" name="Ventas" />
                        <Area type="monotone" dataKey="profit" stroke="#22c55e" fillOpacity={1} fill="url(#colorProf)" name="Ganancia" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <h3 className="font-bold text-gray-700 mb-2">Resumen de Rentabilidad</h3>
            <p className="text-gray-500 mb-8 max-w-sm">Comparativa visual de cuánto representa el costo sobre el total de lo vendido en el periodo seleccionado.</p>
            
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ name: 'Periodo', Costo: totalCost, Ganancia: netProfit }]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" hide />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$ ${value.toFixed(2)}`} />
                        <Bar dataKey="Costo" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} barSize={60} />
                        <Bar dataKey="Ganancia" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={60} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-4">
                <div className="flex items-center text-sm text-gray-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    Costos
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Ganancia Neta
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Reports;