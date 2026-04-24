import { apiClient } from '@/services/api/client';
import type { ChequesResponse, ChequesSummary, CustomerRow, ChequesFilters } from '../types';

const BASE = '/returned-cheques';

export const returnedChequesService = {
  getList: async (page: number, limit: number, filters: ChequesFilters): Promise<ChequesResponse> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.search) params.set('search', filters.search);
    if (filters.fromDate) params.set('fromDate', filters.fromDate);
    if (filters.toDate) params.set('toDate', filters.toDate);
    const { data } = await apiClient.get<ChequesResponse>(`${BASE}?${params.toString()}`);
    return data;
  },

  getSummary: async (): Promise<ChequesSummary> => {
    const { data } = await apiClient.get<ChequesSummary>(`${BASE}/summary`);
    return data;
  },

  getByCustomer: async (): Promise<CustomerRow[]> => {
    const { data } = await apiClient.get<CustomerRow[]>(`${BASE}/by-customer`);
    return data;
  },

  exportExcel: async (filters: Partial<ChequesFilters>): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.fromDate) params.set('fromDate', filters.fromDate);
    if (filters.toDate) params.set('toDate', filters.toDate);
    const { data } = await apiClient.get<Blob>(`${BASE}/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return data;
  },
};
