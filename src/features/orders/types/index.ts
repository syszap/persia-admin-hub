export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'در انتظار',
  confirmed: 'تأیید شده',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
  returned: 'مرجوع شده',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'پرداخت نشده',
  partial: 'جزئی',
  paid: 'پرداخت شده',
  refunded: 'استرداد شده',
};

export interface Customer {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  tax_id?: string;
  credit_limit: number;
  balance: number;
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name?: string;
  product_code?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name?: string;
  date: string;
  due_date?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  paid_amount: number;
  notes?: string;
  items: OrderItem[];
  created_by: string;
  created_at: string;
}
