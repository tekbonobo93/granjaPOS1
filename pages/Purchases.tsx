
import React, { useState, useEffect } from 'react';
import { getPurchases, getProducts, registerPurchase, generateUUID } from '../services/api';
import { Purchase, Product, ProductCategory } from '../types';
import { Plus, ClipboardList, Search, ArrowRight, PackagePlus } from 'lucide-react';

const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [supplier, setSupplier] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [purchData, prodData] = await Promise.all([getPurchases(), getProducts()]);
    // Sort Purchases by date descending
    purchData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setPurchases(purchData);
    setProducts(prodData);
  };

  const handleProductSelect = (id: string) => {
      setSelectedProductId(id);
      const prod = products.find(p => p.id === id);
      if (prod) {
          setUnitCost(prod.cost.toString());
      }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const qty = parseFloat(quantity);
    const cost = parseFloat(unitCost);

    const newPurchase: Purchase = {
        id: generateUUID(),
        date: new Date().toISOString(),
        productId: prod.id,
        productName: prod.name,
        quantity: qty,
        unitCost: cost,
        totalCost: qty * cost,
        supplier: supplier || 'Proveedor General'
    };

    await registerPurchase(newPurchase);
    await loadData();
    setIsModalOpen(false);
    
    // Reset Form
    setSelectedProductId('');
    setQuantity('');
    setUnitCost('');
    setSupplier('');
  };

  const filteredPurchases = purchases.filter(p => 
     p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (p.supplier && p.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Compras e Insumos</h2>
          <p className="text-gray-500">Registro de entrada de mercadería y gastos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
        >
          <PackagePlus className="w-5 h-5 mr-2" />
          Registrar Compra
        </button>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
         <div className="relative w-full max-w-sm">
             <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
             <input
                type="text"
                placeholder="Buscar por producto o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
             />
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Producto</th>
                    <th className="p-4">Proveedor</th>
                    <th className="p-4 text-center">Cantidad Entrante</th>
                    <th className="p-4 text-right">Costo Unit.</th>
                    <th className="p-4 text-right">Costo Total</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredPurchases.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-400">No hay compras registradas</td></tr>
                ) : filteredPurchases.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-600">
                            {new Date(p.date).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(p.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </td>
                        <td className="p-4 font-medium text-gray-800">{p.productName}</td>
                        <td className="p-4 text-gray-600 text-sm">{p.supplier}</td>
                        <td className="p-4 text-center font-bold text-green-600">+{p.quantity}</td>
                        <td className="p-4 text-right text-gray-500">$ {p.unitCost.toFixed(2)}</td>
                        <td className="p-4 text-right font-bold text-gray-800">$ {p.totalCost.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Modal for New Purchase */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6">
            <div className="flex items-center mb-6">
                <div className="bg-brand-100 p-2 rounded-full mr-3 text-brand-600">
                    <PackagePlus className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Registrar Entrada de Mercadería</h3>
                    <p className="text-xs text-gray-500">Esto aumentará el stock actual del producto</p>
                </div>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Producto</label>
                <select
                  required
                  className="w-full border rounded-lg p-2 bg-white"
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                >
                  <option value="">-- Seleccionar Producto --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Actual: {p.stock} {p.unit})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Cantidad a Agregar</label>
                   <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full border rounded-lg p-2 font-bold"
                    placeholder="0.00"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                   />
                   <p className="text-xs text-gray-400 mt-1">En la unidad base del producto</p>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Costo Unitario ($)</label>
                   <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full border rounded-lg p-2"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                   />
                   <p className="text-xs text-gray-400 mt-1">Se actualizará el costo del producto</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Proveedor / Origen</label>
                <input
                  className="w-full border rounded-lg p-2"
                  placeholder="Ej. Avícola Santa Rosa"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm border border-gray-100">
                  <span>Total Inversión:</span>
                  <span className="font-bold text-lg text-brand-600">
                      $ {((parseFloat(quantity) || 0) * (parseFloat(unitCost) || 0)).toFixed(2)}
                  </span>
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
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold"
                >
                  Guardar y Aumentar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
