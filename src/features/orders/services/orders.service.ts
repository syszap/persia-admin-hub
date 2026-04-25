import { apiClient } from '@/services/api/client';

export const ordersService = {
  getCustomers: (params?: Record<string, unknown>) =>
    apiClient.get('/orders/customers', { params }).then((r) => r.data),

  createCustomer: (data: unknown) =>
    apiClient.post('/orders/customers', data).then((r) => r.data),

  updateCustomer: (id: string, data: unknown) =>
    apiClient.patch(`/orders/customers/${id}`, data).then((r) => r.data),

  getOrders: (params?: Record<string, unknown>) =>
    apiClient.get('/orders', { params }).then((r) => r.data),

  getOrder: (id: string) =>
    apiClient.get(`/orders/${id}`).then((r) => r.data),

  createOrder: (data: unknown) =>
    apiClient.post('/orders', data).then((r) => r.data),

  updateOrderStatus: (id: string, status: string) =>
    apiClient.patch(`/orders/${id}/status`, { status }).then((r) => r.data),

  getOrderStats: () =>
    apiClient.get('/orders/stats').then((r) => r.data),
};
