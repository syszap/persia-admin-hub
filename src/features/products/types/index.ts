export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'فعال',
  inactive: 'غیرفعال',
  discontinued: 'متوقف',
};

export interface Category {
  id: string;
  name: string;
  name_fa: string;
  slug: string;
  parent_id?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  name_fa: string;
  category_id: string;
  category_name?: string;
  description?: string;
  price: number;
  cost_price: number;
  unit: string;
  status: ProductStatus;
  stock_quantity: number;
  min_stock_level: number;
  created_at: string;
}
