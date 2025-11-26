
import { Product, ProductCategory, UnitType, Customer, Order, OrderStatus, OrderType, PaymentMethod, OrderItem, Purchase } from '../types';

// Updated products to have correct BASE units for calculations
// Eggs are stored as Units (so we can sell 12, 15, 30)
// Meat/Cheese stored as Kg (so we can sell Lbs or Kgs)
export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Huevo Rosado Calidad A', category: ProductCategory.HUEVOS, unit: UnitType.UNIDAD, price: 0.18, cost: 0.12, stock: 1500, minStock: 300 }, // Price per egg
  { id: '2', name: 'Pechuga de Pollo', category: ProductCategory.POLLO, unit: UnitType.KG, price: 8.50, cost: 6.00, stock: 45.5, minStock: 10 },
  { id: '3', name: 'Queso Fresco', category: ProductCategory.QUESO, unit: UnitType.KG, price: 12.00, cost: 9.00, stock: 15.2, minStock: 3 },
  { id: '4', name: 'Queso Andino (Entero/Porción)', category: ProductCategory.QUESO, unit: UnitType.KG, price: 15.50, cost: 11.00, stock: 8.0, minStock: 2 },
  { id: '5', name: 'Carne Molida Especial', category: ProductCategory.CARNE, unit: UnitType.KG, price: 11.00, cost: 8.50, stock: 20, minStock: 5 },
  { id: '6', name: 'Milanesa de Pollo', category: ProductCategory.POLLO, unit: UnitType.KG, price: 9.50, cost: 7.00, stock: 12, minStock: 2 },
  { id: '7', name: 'Huevo Pardo (Económico)', category: ProductCategory.HUEVOS, unit: UnitType.UNIDAD, price: 0.15, cost: 0.10, stock: 800, minStock: 100 },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Juan Perez', phone: '999888777', address: 'Av. Principal 123', isFrequent: true, totalPurchases: 1500 },
  { id: '2', name: 'Maria Rodriguez', phone: '999111222', address: 'Jr. Los Andes 456', isFrequent: false, totalPurchases: 50 },
];

// Mock Purchases
export const INITIAL_PURCHASES: Purchase[] = [
    { id: 'p1', date: new Date(Date.now() - 86400000 * 2).toISOString(), productId: '1', productName: 'Huevo Rosado Calidad A', quantity: 3000, unitCost: 0.11, totalCost: 330, supplier: 'Granja San Luis' },
    { id: 'p2', date: new Date(Date.now() - 86400000 * 5).toISOString(), productId: '2', productName: 'Pechuga de Pollo', quantity: 50, unitCost: 5.80, totalCost: 290, supplier: 'Avicola Central' },
];

// Generate some past orders for charts
const generatePastOrders = (): Order[] => {
  const orders: Order[] = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate random items for each order so charts work
    const orderItems: OrderItem[] = [];
    const numItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
    let totalOrder = 0;

    for (let j = 0; j < numItems; j++) {
        const randomProduct = INITIAL_PRODUCTS[Math.floor(Math.random() * INITIAL_PRODUCTS.length)];
        // Logic for quantity based on unit to make data realistic
        let qty = 1;
        if (randomProduct.category === ProductCategory.HUEVOS) qty = [12, 15, 30][Math.floor(Math.random() * 3)];
        else qty = Number((Math.random() * 2 + 0.5).toFixed(2)); // 0.5 to 2.5 kg

        const subtotal = randomProduct.price * qty;
        
        orderItems.push({
            productId: randomProduct.id,
            productName: randomProduct.name,
            quantity: qty,
            priceAtSale: randomProduct.price,
            costAtSale: randomProduct.cost, // Include cost for profit reports
            subtotal: subtotal
        });
        totalOrder += subtotal;
    }

    orders.push({
      id: `ord-hist-${i}`,
      date: date.toISOString(),
      customerName: i % 3 === 0 ? 'Cliente Mostrador' : 'Juan Perez',
      items: orderItems,
      total: parseFloat(totalOrder.toFixed(2)),
      status: OrderStatus.ENTREGADO,
      type: i % 2 === 0 ? OrderType.POS : OrderType.DELIVERY,
      paymentMethod: PaymentMethod.EFECTIVO
    });
  }
  return orders;
};

export const INITIAL_ORDERS: Order[] = generatePastOrders();
