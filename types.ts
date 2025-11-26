
// Enums for business logic
export enum ProductCategory {
  HUEVOS = 'Huevos',
  POLLO = 'Pollo',
  QUESO = 'Queso',
  CARNE = 'Carne',
  OTROS = 'Otros',
}

export enum UnitType {
  UNIDAD = 'Unidad',
  KG = 'Kg',
  LIBRA = 'Lb', // Added Libra
  BANDEJA = 'Bandeja',
  LITRO = 'Litro',
}

export enum OrderStatus {
  PENDIENTE = 'Pendiente', // Order received (WhatsApp/POS)
  EN_PREPARACION = 'En Preparación',
  EN_CAMINO = 'En Camino', // Delivery
  ENTREGADO = 'Entregado',
  CANCELADO = 'Cancelado',
}

export enum OrderType {
  POS = 'Venta Local',
  DELIVERY = 'Delivery / WhatsApp',
}

export enum PaymentMethod {
  EFECTIVO = 'Efectivo',
  TRANSFERENCIA = 'Transferencia',
  YAPE_PLIN = 'Billetera Digital',
  TARJETA = 'Tarjeta',
}

export enum UserRole {
  ADMIN = 'Admin',
  CAJERO = 'Cajero',
  REPARTIDOR = 'Repartidor',
}

// Entities
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unit: UnitType;
  price: number; // Sale price
  cost: number; // Purchase cost
  stock: number;
  minStock: number;
}

export interface Purchase {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number; // Amount bought
  unitCost: number; // Cost at that moment
  totalCost: number;
  supplier?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  isFrequent: boolean;
  totalPurchases: number;
}

export interface CartItem extends Product {
  quantity: number;
  salesUnit?: string; // To display "1.5 Kg" or "12 Unidades" in cart
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtSale: number;
  costAtSale?: number; // Added to calculate profit history
  subtotal: number;
}

export interface Order {
  id: string;
  date: string; // ISO String
  customerName: string;
  customerId?: string; // Optional if walk-in
  phone?: string;
  address?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  type: OrderType;
  paymentMethod: PaymentMethod;
  assignedTo?: string; // Delivery person name
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}
