import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../services/orders.service';
import { toast } from 'sonner';

export function useCustomers(params?: Record<string, unknown>) {
  return useQuery({ queryKey: ['customers', params], queryFn: () => ordersService.getCustomers(params) });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersService.createCustomer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('مشتری ایجاد شد'); },
    onError: () => toast.error('خطا در ایجاد مشتری'),
  });
}

export function useOrders(params?: Record<string, unknown>) {
  return useQuery({ queryKey: ['orders', params], queryFn: () => ordersService.getOrders(params) });
}

export function useOrderStats() {
  return useQuery({ queryKey: ['order-stats'], queryFn: () => ordersService.getOrderStats(), staleTime: 5 * 60 * 1000 });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersService.createOrder,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('سفارش ثبت شد'); },
    onError: () => toast.error('خطا در ثبت سفارش'),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersService.updateOrderStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('وضعیت سفارش به‌روز شد'); },
    onError: () => toast.error('خطا در به‌روزرسانی'),
  });
}
