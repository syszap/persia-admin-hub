import { apiClient } from '@/services/api/client';

export const productsService = {
  getCategories: (params?: Record<string, unknown>) =>
    apiClient.get('/products/categories', { params }).then((r) => r.data),

  createCategory: (data: unknown) =>
    apiClient.post('/products/categories', data).then((r) => r.data),

  getProducts: (params?: Record<string, unknown>) =>
    apiClient.get('/products', { params }).then((r) => r.data),

  getProduct: (id: string) =>
    apiClient.get(`/products/${id}`).then((r) => r.data),

  createProduct: (data: unknown) =>
    apiClient.post('/products', data).then((r) => r.data),

  updateProduct: (id: string, data: unknown) =>
    apiClient.patch(`/products/${id}`, data).then((r) => r.data),

  deleteProduct: (id: string) =>
    apiClient.delete(`/products/${id}`).then((r) => r.data),

  getLowStock: () =>
    apiClient.get('/products/low-stock').then((r) => r.data),

  addInventoryMovement: (data: unknown) =>
    apiClient.post('/products/inventory/movement', data).then((r) => r.data),
};
