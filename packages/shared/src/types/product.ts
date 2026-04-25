export type ProductStatus = 'active' | 'inactive' | 'discontinued';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export interface Category {
  id: string;
  name: string;
  nameFa: string;
  slug: string;
  parentId?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  nameFa: string;
  categoryId: string;
  categoryName?: string;
  description?: string;
  price: number;
  costPrice: number;
  unit: string;
  status: ProductStatus;
  stockQuantity: number;
  minStockLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName?: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unitCost?: number;
  referenceType?: 'order' | 'purchase' | 'adjustment';
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  taxId?: string;
  creditLimit: number;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productCode?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  date: string;
  dueDate?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  paidAmount: number;
  notes?: string;
  items: OrderItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
