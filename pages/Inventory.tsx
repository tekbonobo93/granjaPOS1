
import React, { useState, useEffect } from 'react';
import { getProducts, saveProduct, deleteProduct, generateUUID } from '../services/api';
import { Product, ProductCategory, UnitType } from '../types';
import { Plus, Edit, Trash, Package, Search, ArrowRight } from 'lucide-react';
// We don't import Purchases here directly to keep pages decoupled, 
// but we could add a "Quick Restock" button that just redirects or opens a similar modal.
// For simplicity in this request, we will just keep the Edit/Create functionality here 
// and assume the user uses the "Purchases" module for adding stock.

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        category: ProductCategory.OTROS,
        unit: UnitType.UNIDAD,
        stock: 0,
        price: 0,
        cost: 0,
        minStock: 5
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : generateUUID(),
      name: formData.name!,
      category: formData.category as ProductCategory,
      unit: formData.unit as UnitType,
      price: Number(formData.price),
      cost: Number(formData.cost),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock),
    };

    await saveProduct(productToSave);
    await loadProducts();
    setIsModalOpen(false);
  };
  
  const handleDelete = async (id: string) => {
      if(window.confirm("¿Seguro que deseas eliminar este producto?")) {
          await deleteProduct(id);
          await loadProducts();
      }
  }

  const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
          <p className="text-gray-500">Gestión de productos y precios base</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Producto
        </button>
      </div>

       <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
         <div className="relative w-full max-w-sm">
             <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
             <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
             />
         </div>
         <div className="text-sm text-gray-500">
             Para agregar stock, usa el módulo de <b>Compras</b>.
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Producto</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium text-right">Costo Base</th>
                <th className="p-4 font-medium text-right">Precio Venta</th>
                <th className="p-4 font-medium text-center">Unidad</th>
                <th className="p-4 font-medium text-right">Stock</th>
                <th className="p-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 group">
                  <td className="p-4 font-medium text-gray-800">{p.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4 text-right text-gray-500">$ {p.cost.toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-brand-600">$ {p.price.toFixed(2)}</td>
                  <td className="p-4 text-center text-sm text-gray-500">{p.unit}</td>
                  <td className={`p-4 text-right font-bold ${p.stock <= p.minStock ? 'text-red-500' : 'text-green-600'}`}>
                    {p.stock}
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => handleOpenModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  required
                  className="w-full border rounded-lg p-2"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                  >
                    {Object.values(ProductCategory).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unidad</label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitType })}
                  >
                    {Object.values(UnitType).map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Costo Compra</label>
                   <input
                    type="number"
                    step="0.01"
                    className="w-full border rounded-lg p-2"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Precio Venta</label>
                   <input
                    type="number"
                    step="0.01"
                    className="w-full border rounded-lg p-2"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                   />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Stock Inicial / Ajuste</label>
                   <input
                    type="number"
                    step="0.01"
                    className="w-full border rounded-lg p-2"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) })}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                   <input
                    type="number"
                    className="w-full border rounded-lg p-2"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) })}
                   />
                </div>
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

export default Inventory;
