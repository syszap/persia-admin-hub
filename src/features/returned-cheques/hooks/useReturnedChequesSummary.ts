import { useQuery } from '@tanstack/react-query';
import { returnedChequesService } from '../services/returned-cheques.service';

export const useReturnedChequesSummary = () =>
  useQuery({
    queryKey: ['returned-cheques-summary'],
    queryFn: returnedChequesService.getSummary,
    staleTime: 60_000,
  });
