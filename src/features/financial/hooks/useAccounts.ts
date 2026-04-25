import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService } from '../services/financial.service';
import { toast } from 'sonner';

export function useAccounts(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['accounts', params],
    queryFn: () => financialService.getAccounts(params),
  });
}

export function useTrialBalance() {
  return useQuery({
    queryKey: ['trial-balance'],
    queryFn: () => financialService.getTrialBalance(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAccountLedger(id: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['ledger', id, params],
    queryFn: () => financialService.getAccountLedger(id, params),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financialService.createAccount,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); toast.success('حساب با موفقیت ایجاد شد'); },
    onError: () => toast.error('خطا در ایجاد حساب'),
  });
}
