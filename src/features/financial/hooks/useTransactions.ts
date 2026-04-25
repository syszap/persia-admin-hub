import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService } from '../services/financial.service';
import { toast } from 'sonner';

export function useTransactions(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => financialService.getTransactions(params),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => financialService.getTransaction(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financialService.createTransaction,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); toast.success('سند حسابداری ایجاد شد'); },
    onError: () => toast.error('خطا در ایجاد سند'),
  });
}

export function usePostTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financialService.postTransaction(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); qc.invalidateQueries({ queryKey: ['trial-balance'] }); toast.success('سند ثبت شد'); },
    onError: () => toast.error('خطا در ثبت سند'),
  });
}

export function useVoidTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financialService.voidTransaction(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); toast.success('سند باطل شد'); },
    onError: () => toast.error('خطا در ابطال سند'),
  });
}
