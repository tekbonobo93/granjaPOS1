
import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/api';
import { Order, OrderStatus } from '../types';
import { CalendarRange, ArrowRight, Search, ChevronDown, ChevronUp, FileText } from 'lucide-react';

type DateFilter = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL' | 'CUSTOM';

const SalesHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<DateFilter>('TODAY');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    const today = new Date().toISOString().split('T')[0];
    setCustomStart(today);
    setCustomEnd(today);
  }, []);

  const loadOrders = async () => {
    const data = await getOrders();
    setOrders(data);
  };

  useEffect(() => {
    applyFilters();
  }, [orders, filter, customStart, customEnd, searchTerm]);

  const applyFilters = () => {
    let result = orders.filter(o => o.status !== OrderStatus.CANCELADO); // Show valid sales mainly

    // Date Filter
    const today = new Date();
    today.setHours(0,0,0,0);

    result = result.filter(o => {
        const orderDate = new Date(o.date);
        const orderDateMidnight = new Date(o.date);
        orderDateMidnight.setHours(0,0,0,0);

        if (filter === 'TODAY') return orderDateMidnight.getTime() === today.getTime();
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

    // Search Filter
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        result = result.filter(o => 
            o.customerName.toLowerCase().includes(lower) || 
            o.id.toLowerCase().includes(lower)
        );
    }

    setFilteredOrders(result);
  };

  const toggleExpand = (id: string) => {
      setExpandedOrder(expandedOrder === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Historial de Ventas</h2>
          <p className="text-gray-500">Consulta detallada de transacciones pasadas</p>
        </div>
        
        {/* Date Filter Bar */}
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

            {filter === 'CUSTOM' && (
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm outline-none" />
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm outline-none" />
                </div>
            )}
        </div>
      </div>

      {/* Search & Total */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
         <div className="relative w-full max-w-sm">
             <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
             <input
                type="text"
                placeholder="Buscar por cliente o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
             />
         </div>
         <div className="text-right">
             <p className="text-xs text-gray-500 uppercase">Total en periodo</p>
             <p className="text-2xl font-bold text-brand-600">$ {filteredOrders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}</p>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <table className="w-full text-left">
             <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                 <tr>
                     <th className="p-4">Fecha / Hora</th>
                     <th className="p-4">Cliente</th>
                     <th className="p-4">Tipo</th>
                     <th className="p-4">Método</th>
                     <th className="p-4 text-right">Total</th>
                     <th className="p-4 text-center">Detalles</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
                 {filteredOrders.length === 0 ? (
                     <tr><td colSpan={6} className="p-8 text-center text-gray-400">No se encontraron ventas</td></tr>
                 ) : filteredOrders.map(order => (
                     <React.Fragment key={order.id}>
                         <tr className="hover:bg-gray-50 transition-colors">
                             <td className="p-4 text-sm text-gray-600">
                                 <div className="font-medium text-gray-900">{new Date(order.date).toLocaleDateString()}</div>
                                 <div className="text-xs">{new Date(order.date).toLocaleTimeString()}</div>
                             </td>
                             <td className="p-4 font-medium text-gray-800">{order.customerName}</td>
                             <td className="p-4 text-sm text-gray-600">
                                 <span className={`px-2 py-1 rounded text-xs ${order.type.includes('Delivery') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                     {order.type}
                                 </span>
                             </td>
                             <td className="p-4 text-sm text-gray-600">{order.paymentMethod}</td>
                             <td className="p-4 text-right font-bold text-gray-800">$ {order.total.toFixed(2)}</td>
                             <td className="p-4 text-center">
                                 <button onClick={() => toggleExpand(order.id)} className="text-gray-400 hover:text-brand-600">
                                     {expandedOrder === order.id ? <ChevronUp /> : <ChevronDown />}
                                 </button>
                             </td>
                         </tr>
                         {expandedOrder === order.id && (
                             <tr className="bg-gray-50">
                                 <td colSpan={6} className="p-4">
                                     <div className="bg-white rounded border border-gray-200 p-4 max-w-2xl mx-auto shadow-sm">
                                         <h4 className="font-bold text-gray-700 mb-2 flex items-center">
                                             <FileText className="w-4 h-4 mr-2" />
                                             Detalle de Venta #{order.id.slice(0,6)}
                                         </h4>
                                         <table className="w-full text-sm">
                                             <thead>
                                                 <tr className="text-gray-500 border-b">
                                                     <th className="text-left pb-2">Producto</th>
                                                     <th className="text-center pb-2">Cant.</th>
                                                     <th className="text-right pb-2">Precio U.</th>
                                                     <th className="text-right pb-2">Subtotal</th>
                                                 </tr>
                                             </thead>
                                             <tbody>
                                                 {order.items.map((item, idx) => (
                                                     <tr key={idx} className="border-b border-gray-100 last:border-0">
                                                         <td className="py-2 text-gray-800">{item.productName}</td>
                                                         <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                                                         <td className="py-2 text-right text-gray-600">$ {item.priceAtSale.toFixed(2)}</td>
                                                         <td className="py-2 text-right font-bold text-gray-800">$ {item.subtotal.toFixed(2)}</td>
                                                     </tr>
                                                 ))}
                                             </tbody>
                                         </table>
                                         {order.address && (
                                             <div className="mt-3 text-sm text-gray-500 pt-2 border-t">
                                                 <span className="font-bold">Dirección de entrega:</span> {order.address}
                                             </div>
                                         )}
                                     </div>
                                 </td>
                             </tr>
                         )}
                     </React.Fragment>
                 ))}
             </tbody>
         </table>
      </div>
    </div>
  );
};

export default SalesHistory;
