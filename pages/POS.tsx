
import React, { useState, useEffect } from 'react';
import { getProducts, getCustomers, createOrder, saveCustomer, generateUUID } from '../services/api';
import { Product, CartItem, Customer, OrderType, OrderStatus, PaymentMethod, ProductCategory, Order, UnitType } from '../types';
import { Search, Plus, Minus, Trash2, CreditCard, User, ShoppingBag, Truck, Check, X, Scale } from 'lucide-react';

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [orderType, setOrderType] = useState<OrderType>(OrderType.POS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.EFECTIVO);
  const [showCheckout, setShowCheckout] = useState(false);

  // Product Selection Modal State
  const [selectedProductForAdd, setSelectedProductForAdd] = useState<Product | null>(null);
  const [addQuantity, setAddQuantity] = useState<number | string>(1);
  const [addUnitMode, setAddUnitMode] = useState<UnitType | 'LB'>(UnitType.KG);
  
  // WhatsApp/Delivery specifics
  const [deliveryInfo, setDeliveryInfo] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    const init = async () => {
      const [p, c] = await Promise.all([getProducts(), getCustomers()]);
      setProducts(p);
      setFilteredProducts(p);
      setCustomers(c);
    };
    init();
  }, []);

  useEffect(() => {
    let result = products;
    if (categoryFilter !== 'ALL') {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredProducts(result);
  }, [searchTerm, categoryFilter, products]);

  // --- Logic for Adding Items ---

  const handleProductClick = (product: Product) => {
    setSelectedProductForAdd(product);
    
    // Set defaults based on Category
    if (product.category === ProductCategory.HUEVOS) {
        setAddQuantity(12); // Default to Dozen
        setAddUnitMode(UnitType.UNIDAD);
    } else if ([ProductCategory.POLLO, ProductCategory.CARNE, ProductCategory.QUESO].includes(product.category)) {
        setAddQuantity(1);
        // Default to Kg, but UI will allow switch to Lb
        setAddUnitMode(UnitType.KG);
    } else {
        setAddQuantity(1);
        setAddUnitMode(UnitType.UNIDAD);
    }
  };

  const confirmAddToCart = () => {
    if (!selectedProductForAdd) return;

    let finalQuantity = Number(addQuantity);
    let finalPrice = selectedProductForAdd.price;
    let unitLabel = selectedProductForAdd.unit as string;

    // Weight Conversion Logic (Lb to Kg)
    // The system stores stock in Kg. 
    // If selling in Lb, we display "X Lb" but deduct "X * 0.453" from stock.
    if (addUnitMode === 'LB') {
       // Conversion: 1 Lb = 0.453592 Kg
       // User enters 1 (Lb). 
       // We calculate price for 1 Lb. 
       // PricePerLb = PricePerKg / 2.20462
       const pricePerLb = selectedProductForAdd.price / 2.20462;
       
       // However, we want to store the "Quantity" in the cart as the base unit (Kg) for inventory deduction
       // OR we store the effective quantity.
       // Let's store Quantity in Base Unit (Kg) for the OrderItem logic to work with stock deduction simple.
       // Visuals in cart can show the "Sales Unit".
       
       const quantityInKg = finalQuantity * 0.453592;
       
       // Override for Cart
       // We'll add the item with the CALCULATED Subtotal and Metadata
       const itemToAdd: CartItem = {
           ...selectedProductForAdd,
           quantity: quantityInKg, // Store in Kg for inventory deduction
           salesUnit: `${finalQuantity} Lb`, // For display
           // We need to ensure the price * quantity equals the correct amount
           // Price (per Kg) * Qty (in Kg) = Total.
           // 8.50 * 0.453 = 3.85 (Price of 1 lb). Correct.
       };
       addToCartDirect(itemToAdd);

    } else {
        // Standard Units (Kg, Unidad, Bandeja)
        // For Eggs, if they select "30" (Cubeta), quantity is 30.
        // If Category is Eggs, help display.
        
        // CORRECCIÓN AQUI: Definimos displayUnit como string explícitamente para permitir textos personalizados
        let displayUnit: string = selectedProductForAdd.unit;
        
        if (selectedProductForAdd.category === ProductCategory.HUEVOS) {
            if (finalQuantity === 1) displayUnit = 'Unidad';
            else if (finalQuantity === 12) displayUnit = 'Docena';
            else if (finalQuantity === 15) displayUnit = 'Quincena';
            else if (finalQuantity === 30) displayUnit = 'Cubeta';
            else displayUnit = `${finalQuantity} Und`;
        } else if (selectedProductForAdd.category === ProductCategory.POLLO || selectedProductForAdd.category === ProductCategory.CARNE || selectedProductForAdd.category === ProductCategory.QUESO) {
            displayUnit = `${finalQuantity} Kg`;
        }

        const itemToAdd: CartItem = {
            ...selectedProductForAdd,
            quantity: finalQuantity,
            salesUnit: String(displayUnit)
        };
        addToCartDirect(itemToAdd);
    }

    setSelectedProductForAdd(null);
  };

  const addToCartDirect = (itemToAdd: CartItem) => {
    setCart(prev => {
      // If adding same product, we just push a new line item if it's weight based usually, 
      // but simpler to merge if exactly same ID. 
      // However, merging 1 Lb + 1 Kg is tricky. Let's keep them separate if the "salesUnit" differs, otherwise merge.
      const existingIndex = prev.findIndex(item => item.id === itemToAdd.id && item.salesUnit === itemToAdd.salesUnit);
      
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += itemToAdd.quantity;
        // Parse label to update? e.g. "1 Lb" -> "2 Lb". Too complex. 
        // Let's just append as new item for simplicity in this specific "Mixed Unit" POS.
        // Actually, appending is safer for "1 Kg of Chicken" AND "0.5 Kg of Chicken" separately.
        return [...prev, { ...itemToAdd, cartId: generateUUID() }]; 
      }
      return [...prev, { ...itemToAdd, cartId: generateUUID() }];
    });
  };

  const removeFromCart = (cartIndex: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== cartIndex));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    let customerId = selectedCustomer?.id;
    let customerName = selectedCustomer ? selectedCustomer.name : 'Cliente Mostrador';
    
    if (orderType === OrderType.DELIVERY) {
        customerName = deliveryInfo.name || 'Cliente WhatsApp';
        if (!selectedCustomer && deliveryInfo.name) {
            const newC: Customer = {
                id: generateUUID(),
                name: deliveryInfo.name,
                phone: deliveryInfo.phone,
                address: deliveryInfo.address,
                isFrequent: false,
                totalPurchases: 0
            };
            await saveCustomer(newC);
            customerId = newC.id;
        }
    }

    const order: Order = {
      id: generateUUID(),
      date: new Date().toISOString(),
      customerId,
      customerName,
      phone: selectedCustomer?.phone || deliveryInfo.phone,
      address: selectedCustomer?.address || deliveryInfo.address,
      items: cart.map(item => ({
        productId: item.id,
        productName: `${item.name} (${item.salesUnit || item.unit})`,
        quantity: item.quantity,
        priceAtSale: item.price,
        subtotal: item.price * item.quantity
      })),
      total: cartTotal,
      status: orderType === OrderType.DELIVERY ? OrderStatus.PENDIENTE : OrderStatus.ENTREGADO,
      type: orderType,
      paymentMethod
    };

    await createOrder(order);
    
    setCart([]);
    setSelectedCustomer(null);
    setDeliveryInfo({ name: '', phone: '', address: '' });
    setShowCheckout(false);
    alert('Venta registrada correctamente');
  };

  // Helper for Displaying Prices in Modal
  const getModalPriceDisplay = () => {
      if(!selectedProductForAdd) return 0;
      const qty = Number(addQuantity) || 0;
      
      if (addUnitMode === 'LB') {
          // Price per kg / 2.20462 * quantity in lbs
          return (selectedProductForAdd.price / 2.20462) * qty;
      }
      return selectedProductForAdd.price * qty;
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4">
      {/* Product Grid Section */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button onClick={() => setCategoryFilter('ALL')} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${categoryFilter === 'ALL' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Todos</button>
            {Object.values(ProductCategory).map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${categoryFilter === cat ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product)}
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md active:scale-95 flex flex-col justify-between
                   ${product.stock <= product.minStock ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'}`}
              >
                <div>
                   <div className="flex justify-between items-start">
                     <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">{product.category}</span>
                     {product.stock <= product.minStock && <span className="text-[10px] text-red-600 font-bold">Bajo Stock</span>}
                   </div>
                   <h3 className="font-medium text-gray-800 leading-tight mt-1">{product.name}</h3>
                   <p className="text-xs text-gray-500 mt-1">Stock: {product.stock.toFixed(2)} {product.unit}</p>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex flex-col">
                      <span className="font-bold text-brand-600 text-lg">$ {product.price.toFixed(2)}</span>
                      <span className="text-[10px] text-gray-400">por {product.unit}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" /> 
            Orden Actual
          </h2>
          <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-700">Limpiar</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <ShoppingBag className="w-12 h-12 mb-2 opacity-20" />
               <p>Carrito vacío</p>
             </div>
           ) : (
             cart.map((item, idx) => (
               <div key={idx} className="flex justify-between items-center animate-in slide-in-from-right-5 duration-200">
                 <div className="flex-1">
                   <p className="text-sm font-medium text-gray-800">{item.name}</p>
                   <div className="flex items-center gap-2">
                       <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.salesUnit || item.unit}</span>
                       <p className="text-xs text-brand-600 font-bold">$ {(item.price * item.quantity).toFixed(2)}</p>
                   </div>
                 </div>
                 <button onClick={() => removeFromCart(idx)} className="ml-2 text-gray-400 hover:text-red-500 p-2">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))
           )}
        </div>

        {/* Footer/Checkout */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-end mb-4">
             <span className="text-gray-500">Total</span>
             <span className="text-3xl font-bold text-gray-900">$ {cartTotal.toFixed(2)}</span>
          </div>
          
          <button 
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-200"
          >
            Confirmar Venta
          </button>
        </div>
      </div>

      {/* Product Selection Modal */}
      {selectedProductForAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedProductForAdd(null)}>
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                  
                  {/* Header */}
                  <div className="bg-brand-500 p-5 text-white flex justify-between items-start shrink-0">
                      <div className="pr-8">
                        <h3 className="font-bold text-xl leading-tight">{selectedProductForAdd.name}</h3>
                        <p className="opacity-90 text-sm mt-1">Stock actual: {selectedProductForAdd.stock} {selectedProductForAdd.unit}</p>
                      </div>
                      <button onClick={() => setSelectedProductForAdd(null)} className="text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1 hover:bg-white/20">
                        <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  {/* Body */}
                  <div className="p-6 overflow-y-auto">
                      {selectedProductForAdd.category === ProductCategory.HUEVOS ? (
                          // Eggs Specific Interface
                          <div className="space-y-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Selecciona Cantidad</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setAddQuantity(1)} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${Number(addQuantity) === 1 ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold shadow-md' : 'border-gray-100 hover:border-brand-200 hover:bg-gray-50 text-gray-600'}`}>
                                        <span className="text-xl">1</span>
                                        <span className="text-xs font-medium uppercase">Unidad</span>
                                    </button>
                                    <button onClick={() => setAddQuantity(12)} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${Number(addQuantity) === 12 ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold shadow-md' : 'border-gray-100 hover:border-brand-200 hover:bg-gray-50 text-gray-600'}`}>
                                        <span className="text-xl">12</span>
                                        <span className="text-xs font-medium uppercase">Docena</span>
                                    </button>
                                    <button onClick={() => setAddQuantity(15)} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${Number(addQuantity) === 15 ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold shadow-md' : 'border-gray-100 hover:border-brand-200 hover:bg-gray-50 text-gray-600'}`}>
                                        <span className="text-xl">15</span>
                                        <span className="text-xs font-medium uppercase">Quincena</span>
                                    </button>
                                    <button onClick={() => setAddQuantity(30)} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${Number(addQuantity) === 30 ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold shadow-md' : 'border-gray-100 hover:border-brand-200 hover:bg-gray-50 text-gray-600'}`}>
                                        <span className="text-xl">30</span>
                                        <span className="text-xs font-medium uppercase">Cubeta</span>
                                    </button>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                  <span className="text-gray-500 text-sm font-medium">Otra Cantidad:</span>
                                  <input 
                                    type="number" 
                                    value={addQuantity} 
                                    onChange={(e) => setAddQuantity(Number(e.target.value))}
                                    className="border border-gray-300 rounded-md p-2 w-24 text-center font-bold text-gray-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                  />
                              </div>
                          </div>
                      ) : (
                          // Meat/Cheese/Chicken Interface (Weight)
                          <div className="space-y-6">
                              <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider text-center">Peso / Cantidad</label>
                              
                              <div className="flex flex-col items-center gap-4">
                                  <div className="relative w-full">
                                    <input 
                                      type="number" 
                                      step="0.05"
                                      autoFocus
                                      value={addQuantity}
                                      onChange={(e) => setAddQuantity(e.target.value)}
                                      className="w-full text-5xl font-bold text-center border-2 border-gray-200 rounded-2xl py-6 text-gray-800 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all bg-white"
                                      placeholder="0.00"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                                      <Scale className="w-8 h-8" />
                                    </div>
                                  </div>

                                  <div className="flex bg-gray-100 p-1.5 rounded-xl w-full max-w-xs">
                                      <button 
                                        onClick={() => setAddUnitMode(UnitType.KG)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${addUnitMode === UnitType.KG ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                                      >
                                          KILOGRAMOS (Kg)
                                      </button>
                                      <button 
                                        onClick={() => setAddUnitMode('LB')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${addUnitMode === 'LB' ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                                      >
                                          LIBRAS (Lb)
                                      </button>
                                  </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                                  <span>Precio Unitario:</span>
                                  <span className="font-bold text-gray-800 text-lg">
                                      $ {addUnitMode === 'LB' 
                                          ? (selectedProductForAdd.price / 2.20462).toFixed(2) + ' / lb'
                                          : selectedProductForAdd.price.toFixed(2) + ' / kg'
                                      }
                                  </span>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4 shrink-0">
                      <div>
                          <p className="text-xs text-gray-500 font-medium uppercase">Subtotal</p>
                          <p className="text-2xl font-bold text-brand-600 leading-none mt-1">$ {getModalPriceDisplay().toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setSelectedProductForAdd(null)}
                          className="px-5 py-3 text-gray-600 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                        
                        <button 
                          onClick={confirmAddToCart}
                          className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 hover:shadow-xl transform active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            Agregar
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b flex justify-between items-center">
                 <h3 className="font-bold text-lg">Finalizar Venta</h3>
                 <button onClick={() => setShowCheckout(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              
              <div className="p-6 space-y-4">
                 {/* Order Type Toggle */}
                 <div className="flex p-1 bg-gray-100 rounded-lg">
                    <button 
                      onClick={() => setOrderType(OrderType.POS)}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${orderType === OrderType.POS ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}
                    >
                      Mostrador
                    </button>
                    <button 
                       onClick={() => setOrderType(OrderType.DELIVERY)}
                       className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${orderType === OrderType.DELIVERY ? 'bg-white shadow text-brand-600' : 'text-gray-500'}`}
                    >
                       Delivery / WhatsApp
                    </button>
                 </div>

                 {/* Customer Selection */}
                 {orderType === OrderType.POS ? (
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (Opcional)</label>
                      <select 
                        className="w-full border rounded-lg p-2 bg-white"
                        onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                      >
                         <option value="">Cliente Genérico</option>
                         {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                   </div>
                 ) : (
                    <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                       <input 
                         placeholder="Nombre Cliente" 
                         className="w-full p-2 border rounded text-sm"
                         value={deliveryInfo.name}
                         onChange={e => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                       />
                       <input 
                         placeholder="Teléfono (WhatsApp)" 
                         className="w-full p-2 border rounded text-sm"
                         value={deliveryInfo.phone}
                         onChange={e => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                       />
                       <input 
                         placeholder="Dirección de entrega" 
                         className="w-full p-2 border rounded text-sm"
                         value={deliveryInfo.address}
                         onChange={e => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                       />
                    </div>
                 )}

                 {/* Payment Method */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                    <div className="grid grid-cols-2 gap-2">
                       {[PaymentMethod.EFECTIVO, PaymentMethod.YAPE_PLIN, PaymentMethod.TRANSFERENCIA, PaymentMethod.TARJETA].map(m => (
                          <button
                            key={m}
                            onClick={() => setPaymentMethod(m)}
                            className={`p-2 text-sm border rounded-lg text-left ${paymentMethod === m ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:bg-gray-50'}`}
                          >
                             {m}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-gray-50 border-t flex gap-3">
                 <button onClick={() => setShowCheckout(false)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
                 <button onClick={handleCheckout} className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg transition-all">Cobrar $ {cartTotal.toFixed(2)}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default POS;
