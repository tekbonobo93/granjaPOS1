
import { Product, Order, Customer, User, UserRole, OrderStatus, Purchase } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_PURCHASES } from './mockData';

// Simulated DB Keys
const KEYS = {
  PRODUCTS: 'app_products',
  ORDERS: 'app_orders',
  CUSTOMERS: 'app_customers',
  USER: 'app_user',
  PURCHASES: 'app_purchases',
};

// Helper for UUID generation that works in all contexts
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback if secure context check fails
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Service ---
export const login = async (role: UserRole): Promise<User> => {
  await delay(500);
  const user: User = { id: 'u1', name: 'Usuario ' + role, role };
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
  return user;
};

export const getCurrentUser = (): User | null => {
  const u = localStorage.getItem(KEYS.USER);
  return u ? JSON.parse(u) : null;
};

export const logout = () => {
  localStorage.removeItem(KEYS.USER);
};

// --- Product Service ---
export const getProducts = async (): Promise<Product[]> => {
  const stored = localStorage.getItem(KEYS.PRODUCTS);
  if (!stored) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(stored);
};

export const saveProduct = async (product: Product): Promise<void> => {
  const products = await getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

export const deleteProduct = async (id: string): Promise<void> => {
    const products = await getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(filtered));
}

// --- Order Service ---
export const getOrders = async (): Promise<Order[]> => {
  const stored = localStorage.getItem(KEYS.ORDERS);
  if (!stored) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  return JSON.parse(stored);
};

export const createOrder = async (order: Order): Promise<void> => {
  const orders = await getOrders();
  orders.unshift(order); // Add to top
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

  // Update Inventory
  const products = await getProducts();
  order.items.forEach(item => {
    const pIndex = products.findIndex(p => p.id === item.productId);
    if (pIndex >= 0) {
      products[pIndex].stock -= item.quantity;
    }
  });
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus, assignedTo?: string): Promise<void> => {
  const orders = await getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    if (assignedTo) order.assignedTo = assignedTo;
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  }
};

// --- Customer Service ---
export const getCustomers = async (): Promise<Customer[]> => {
  const stored = localStorage.getItem(KEYS.CUSTOMERS);
  if (!stored) {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  }
  return JSON.parse(stored);
};

export const saveCustomer = async (customer: Customer): Promise<void> => {
    const customers = await getCustomers();
    const index = customers.findIndex(c => c.id === customer.id);
    if (index >= 0) {
        customers[index] = customer;
    } else {
        customers.push(customer);
    }
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
}

// --- Purchase / Restock Service ---
export const getPurchases = async (): Promise<Purchase[]> => {
  const stored = localStorage.getItem(KEYS.PURCHASES);
  if (!stored) {
    localStorage.setItem(KEYS.PURCHASES, JSON.stringify(INITIAL_PURCHASES));
    return INITIAL_PURCHASES;
  }
  return JSON.parse(stored);
};

export const registerPurchase = async (purchase: Purchase): Promise<void> => {
    // 1. Save Purchase Record
    const purchases = await getPurchases();
    purchases.unshift(purchase);
    localStorage.setItem(KEYS.PURCHASES, JSON.stringify(purchases));

    // 2. Update Product Stock & Cost
    const products = await getProducts();
    const pIndex = products.findIndex(p => p.id === purchase.productId);
    if (pIndex >= 0) {
        products[pIndex].stock += purchase.quantity;
        // Optional: Update cost to new cost if provided
        if (purchase.unitCost > 0) {
            products[pIndex].cost = purchase.unitCost;
        }
    }
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};
