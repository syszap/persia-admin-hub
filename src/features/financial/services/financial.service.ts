import { apiClient } from '@/services/api/client';
import type { Account, Transaction, LedgerEntry, AccountBalance } from '../types';

export const financialService = {
  // Accounts
  getAccounts: (params?: Record<string, unknown>) =>
    apiClient.get('/financial/accounts', { params }).then((r) => r.data),

  getAccount: (id: string) =>
    apiClient.get(`/financial/accounts/${id}`).then((r) => r.data),

  createAccount: (data: Partial<Account>) =>
    apiClient.post('/financial/accounts', data).then((r) => r.data),

  updateAccount: (id: string, data: Partial<Account>) =>
    apiClient.patch(`/financial/accounts/${id}`, data).then((r) => r.data),

  getTrialBalance: () =>
    apiClient.get('/financial/accounts/trial-balance').then((r) => r.data),

  getAccountLedger: (id: string, params?: { fromDate?: string; toDate?: string }) =>
    apiClient.get(`/financial/accounts/${id}/ledger`, { params }).then((r) => r.data),

  // Transactions
  getTransactions: (params?: Record<string, unknown>) =>
    apiClient.get('/financial/transactions', { params }).then((r) => r.data),

  getTransaction: (id: string) =>
    apiClient.get(`/financial/transactions/${id}`).then((r) => r.data),

  createTransaction: (data: Partial<Transaction>) =>
    apiClient.post('/financial/transactions', data).then((r) => r.data),

  postTransaction: (id: string) =>
    apiClient.post(`/financial/transactions/${id}/post`).then((r) => r.data),

  voidTransaction: (id: string) =>
    apiClient.post(`/financial/transactions/${id}/void`).then((r) => r.data),
};
