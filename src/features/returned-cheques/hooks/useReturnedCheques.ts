import { useQuery } from '@tanstack/react-query';
import { returnedChequesService } from '../services/returned-cheques.service';
import type { ChequesFilters } from '../types';

export const CHEQUES_LIMIT = 100;

export const useReturnedCheques = (page: number, filters: ChequesFilters) =>
  useQuery({
    queryKey: ['returned-cheques', page, filters.search, filters.fromDate, filters.toDate],
    queryFn: () => returnedChequesService.getList(page, CHEQUES_LIMIT, filters),
    placeholderData: (prev) => prev,
  });
