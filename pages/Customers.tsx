import React, { useState, useEffect } from 'react';
import { getCustomers, saveCustomer, generateUUID } from '../services/api';
import { Customer } from '../types';
import { Plus, Edit, Phone, MapPin, Search } from 'lucide-react';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData(customer);
    } else {
      setEditingCustomer(null);
      setFormData({
        isFrequent: false,
        totalPurchases: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const customerToSave: Customer = {
      id: editingCustomer ? editingCustomer.id : generateUUID(),
      name: formData.name!,
      phone: formData.phone || '',
      address: formData.address || '',
      notes: formData.notes || '',
      isFrequent: formData.isFrequent || false,
      totalPurchases: formData.totalPurchases || 0,
    };

    await saveCustomer(customerToSave);
    await loadCustomers();
    setIsModalOpen(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
          <p className="text-gray-500">Base de datos de clientes frecuentes</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
         <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
         <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative group hover:border-brand-200 transition-all">
                <button 
                  onClick={() => handleOpenModal(customer)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Edit className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${customer.isFrequent ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}>
                        {customer.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">{customer.name}</h3>
                        {customer.isFrequent && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">FRECUENTE</span>}
                    </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{customer.phone || 'Sin teléfono'}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <span className="flex-1">{customer.address || 'Sin dirección'}</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Compras totales</span>
                    <span className="font-bold text-gray-800">{customer.totalPurchases}</span>
                </div>
            </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-4">{editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                <input
                  required
                  className="w-full border rounded-lg p-2"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono / WhatsApp</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <textarea
                  className="w-full border rounded-lg p-2"
                  rows={2}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1">Notas</label>
                 <input
                  className="w-full border rounded-lg p-2"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                 />
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                 <input 
                    type="checkbox" 
                    id="isFrequent"
                    checked={formData.isFrequent}
                    onChange={(e) => setFormData({...formData, isFrequent: e.target.checked})}
                    className="w-4 h-4 text-brand-600 rounded"
                 />
                 <label htmlFor="isFrequent" className="text-sm font-medium">Marcar como Cliente Frecuente</label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;