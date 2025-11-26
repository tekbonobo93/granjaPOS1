import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getOrders, getProducts } from '../services/api';
import { Order, Product, ProductCategory } from '../types';
import { TrendingUp, Package, DollarSign, AlertTriangle } from 'lucide-react';

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#ef4444', '#a855f7'];

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [o, p] = await Promise.all([getOrders(), getProducts()]);
      setOrders(o);
      setProducts(p);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center">Cargando métricas...</div>;

  // Calculate Metrics
  const totalSales = orders.reduce((acc, curr) => acc + curr.total, 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  
  // Data for Charts
  // Sales by Category
  const categoryDataRaw: Record<string, number> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
        // Try to find category from product list (best effort)
        const product = products.find(p => p.id === item.productId);
        // Fallback if product deleted, or use a default if not found
        const cat = product ? product.category : ProductCategory.OTROS;
        categoryDataRaw[cat] = (categoryDataRaw[cat] || 0) + item.subtotal;
    });
  });
  
  const categoryData = Object.keys(categoryDataRaw).map(key => ({ name: key, value: categoryDataRaw[key] }));

  // Sales by Day (Last 7 days)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const salesByDayRaw: Record<string, number> = {};
  orders.forEach(o => {
      if(new Date(o.date) > last7Days) {
          const dateStr = new Date(o.date).toLocaleDateString('es-ES', { weekday: 'short' });
          salesByDayRaw[dateStr] = (salesByDayRaw[dateStr] || 0) + o.total;
      }
  });
  const salesByDay = Object.keys(salesByDayRaw).map(key => ({ name: key, sales: salesByDayRaw[key] }));

  const Card = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
      <div className={`p-4 rounded-full mr-4 ${color} text-white`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Panel General</h2>
        <p className="text-gray-500">Resumen de ventas e inventario</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Ventas Totales" 
          value={`$ ${totalSales.toFixed(2)}`} 
          icon={DollarSign} 
          color="bg-green-500" 
        />
        <Card 
          title="Total Pedidos" 
          value={orders.length} 
          icon={Package} 
          color="bg-blue-500" 
        />
        <Card 
          title="Ticket Promedio" 
          value={`$ ${(totalSales / (orders.length || 1)).toFixed(2)}`} 
          icon={TrendingUp} 
          color="bg-purple-500" 
        />
         <Card 
          title="Alertas Stock" 
          value={lowStockProducts.length} 
          icon={AlertTriangle} 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">Ventas por Categoría</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$ ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mt-2">
            {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.name}
                </div>
            ))}
          </div>
        </div>

        {/* Weekly Sales Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">Ventas Últimos 7 Días</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(value: number) => `$ ${value.toFixed(2)}`} />
                <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
       {/* Low Stock Table */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-red-50 flex items-center text-red-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <h3 className="font-bold">Productos con Stock Bajo</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-gray-50 text-gray-500">
                        <th className="p-3 font-medium">Producto</th>
                        <th className="p-3 font-medium">Categoría</th>
                        <th className="p-3 font-medium">Stock Actual</th>
                        <th className="p-3 font-medium">Mínimo</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {lowStockProducts.length === 0 ? (
                        <tr><td colSpan={4} className="p-4 text-center text-gray-400">Todo en orden</td></tr>
                    ) : lowStockProducts.map(p => (
                        <tr key={p.id}>
                            <td className="p-3 font-medium text-gray-800">{p.name}</td>
                            <td className="p-3 text-gray-500">{p.category}</td>
                            <td className="p-3 text-red-600 font-bold">{p.stock} {p.unit}</td>
                            <td className="p-3 text-gray-500">{p.minStock} {p.unit}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
       </div>

    </div>
  );
};

export default Dashboard;