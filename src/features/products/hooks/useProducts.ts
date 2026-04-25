import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../services/products.service';
import { toast } from 'sonner';

export function useCategories(search = '') {
  return useQuery({ queryKey: ['categories', search], queryFn: () => productsService.getCategories({ search }) });
}

export function useProducts(params?: Record<string, unknown>) {
  return useQuery({ queryKey: ['products', params], queryFn: () => productsService.getProducts(params) });
}

export function useLowStockProducts() {
  return useQuery({ queryKey: ['products', 'low-stock'], queryFn: () => productsService.getLowStock() });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsService.createProduct,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('محصول ایجاد شد'); },
    onError: () => toast.error('خطا در ایجاد محصول'),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => productsService.updateProduct(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('محصول به‌روز شد'); },
    onError: () => toast.error('خطا در به‌روزرسانی'),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsService.deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('محصول حذف شد'); },
    onError: () => toast.error('خطا در حذف محصول'),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsService.createCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('دسته‌بندی ایجاد شد'); },
    onError: () => toast.error('خطا در ایجاد دسته‌بندی'),
  });
}
