
import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, getCurrentUser } from '../services/api';
import { Order, OrderStatus, OrderType, UserRole } from '../types';
import { Truck, Phone, MapPin, User, XCircle, CheckCircle, PlusCircle } from 'lucide-react';

interface OrdersProps {
  onNavigate: (page: string) => void;
}

const Orders: React.FC<OrdersProps> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUserRole(user.role);

    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Polling for new orders every 10s
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const data = await getOrders();
    // Sort: Pending first, then by date
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setOrders(data);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === OrderStatus.CANCELADO) {
        if (!window.confirm("¿Estás seguro de cancelar este pedido?")) return;
    }
    await updateOrderStatus(orderId, newStatus);
    await loadOrders();
  };

  const filteredOrders = orders.filter(o => 
    o.type === OrderType.DELIVERY && (filter === 'ALL' || o.status === filter)
  );

  const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const colors = {
      [OrderStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.EN_PREPARACION]: 'bg-blue-100 text-blue-800',
      [OrderStatus.EN_CAMINO]: 'bg-purple-100 text-purple-800',
      [OrderStatus.ENTREGADO]: 'bg-green-100 text-green-800',
      [OrderStatus.CANCELADO]: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const canCreateOrder = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.CAJERO;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Delivery & Pedidos</h2>
           <p className="text-gray-500">Gestión de entregas</p>
        </div>
        
        <div className="flex items-center gap-4">
           {/* New Order Button for Admin/Cashier */}
           {canCreateOrder && (
             <button 
                onClick={() => onNavigate('pos')}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all font-bold text-sm"
             >
                <PlusCircle className="w-5 h-5 mr-2" />
                Nuevo Pedido
             </button>
           )}

           <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => setFilter('ALL')} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${filter === 'ALL' ? 'bg-gray-800 text-white' : 'bg-white border hover:bg-gray-50'}`}>Todos</button>
              <button onClick={() => setFilter(OrderStatus.PENDIENTE)} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${filter === OrderStatus.PENDIENTE ? 'bg-yellow-500 text-white' : 'bg-white border hover:bg-yellow-50'}`}>Pendientes</button>
              <button onClick={() => setFilter(OrderStatus.EN_CAMINO)} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${filter === OrderStatus.EN_CAMINO ? 'bg-purple-500 text-white' : 'bg-white border hover:bg-purple-50'}`}>En Camino</button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <Truck className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No hay pedidos en esta categoría</p>
                {canCreateOrder && (
                    <button onClick={() => onNavigate('pos')} className="mt-4 text-brand-600 font-bold hover:underline">
                        Crear primer pedido en POS
                    </button>
                )}
            </div>
        ) : filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all hover:shadow-md">
            <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="font-bold text-gray-800">#{order.id.slice(0, 5)}</span>
                     <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-gray-400">{new Date(order.date).toLocaleString()}</p>
               </div>
               <div className="text-right">
                  <p className="font-bold text-lg text-brand-600">$ {order.total.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{order.paymentMethod}</p>
               </div>
            </div>
            
            <div className="p-4 space-y-3 flex-1">
               <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-sm text-gray-800">{order.customerName}</p>
                  </div>
               </div>
               {order.phone && (
                   <div className="flex items-start gap-3">
                     <Phone className="w-4 h-4 text-gray-400 mt-1" />
                     <a href={`tel:${order.phone}`} className="text-sm text-blue-600 hover:underline">{order.phone}</a>
                   </div>
               )}
               {order.address && (
                   <div className="flex items-start gap-3">
                     <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                     <p className="text-sm text-gray-600 italic">{order.address}</p>
                   </div>
               )}
               
               <div className="border-t border-dashed pt-3 mt-2">
                 <p className="text-xs font-bold text-gray-500 mb-2">PRODUCTOS</p>
                 <ul className="space-y-1">
                    {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.quantity} x {item.productName}</span>
                        </li>
                    ))}
                 </ul>
               </div>
            </div>

            {/* Actions for Delivery Person */}
            {order.status !== OrderStatus.ENTREGADO && order.status !== OrderStatus.CANCELADO && (
                <div className="p-3 bg-gray-50 border-t flex flex-wrap gap-2">
                   {order.status === OrderStatus.PENDIENTE && (
                     <button 
                       onClick={() => handleStatusChange(order.id, OrderStatus.EN_PREPARACION)}
                       className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded hover:bg-blue-700"
                     >
                       Preparar
                     </button>
                   )}
                   
                   {(order.status === OrderStatus.PENDIENTE || order.status === OrderStatus.EN_PREPARACION) && (
                     <button 
                       onClick={() => handleStatusChange(order.id, OrderStatus.EN_CAMINO)}
                       className="flex-1 bg-purple-600 text-white text-xs font-bold py-2 px-3 rounded hover:bg-purple-700"
                     >
                       Enviar
                     </button>
                   )}

                   {order.status === OrderStatus.EN_CAMINO && (
                     <button 
                       onClick={() => handleStatusChange(order.id, OrderStatus.ENTREGADO)}
                       className="flex-1 bg-green-600 text-white text-xs font-bold py-2 px-3 rounded hover:bg-green-700 flex items-center justify-center gap-1"
                     >
                       <CheckCircle className="w-3 h-3" />
                       Entregado
                     </button>
                   )}
                   
                   <button 
                      onClick={() => handleStatusChange(order.id, OrderStatus.CANCELADO)}
                      className="px-3 py-2 bg-white border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50 flex items-center gap-1"
                      title="Cancelar Pedido"
                   >
                       <XCircle className="w-4 h-4" />
                       {order.status === OrderStatus.EN_CAMINO ? 'No Entregado' : ''}
                   </button>
                </div>
            )}
            
            {order.status === OrderStatus.ENTREGADO && (
                 <div className="p-2 bg-green-50 border-t border-green-100 text-center text-green-700 text-xs font-bold flex items-center justify-center gap-2">
                     <CheckCircle className="w-3 h-3" />
                     Pedido completado
                 </div>
            )}
            {order.status === OrderStatus.CANCELADO && (
                 <div className="p-2 bg-red-50 border-t border-red-100 text-center text-red-700 text-xs font-bold flex items-center justify-center gap-2">
                     <XCircle className="w-3 h-3" />
                     Pedido cancelado
                 </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
