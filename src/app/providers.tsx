import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { handleApiError, isNonRetryableError, parseApiError } from '@/shared/lib/errorHandler';

// ─── Tiered stale times ───────────────────────────────────────────────────────
// Import these in individual hooks to override the default when needed.
export const STALE = {
  /** Real-time data — always re-fetch on mount */
  none: 0,
  /** Default: short-lived cache */
  short: 30_000,
  /** Reference data that rarely changes (roles, menus, settings) */
  medium: 5 * 60_000,
  /** Near-static data (feature flags, permission definitions) */
  long: 30 * 60_000,
} as const;

// ─── Query client singleton ───────────────────────────────────────────────────
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const appError = handleApiError(error, String(query.queryKey[0]));

      // Suppress toast for background refetches that have stale data available
      if (query.state.data !== undefined) return;

      // Low-severity errors are silent — let components render their own empty states
      if (appError.severity === 'low') return;

      toast.error(appError.userMessage);
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      const appError = handleApiError(error, 'mutation');
      toast.error(appError.userMessage);
    },
  }),

  defaultOptions: {
    queries: {
      staleTime: STALE.short,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Recover data after going back online

      retry: (failureCount, error) => {
        if (isNonRetryableError(error)) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) =>
        Math.min(1_000 * 2 ** attemptIndex, 30_000), // exponential back-off, cap 30 s
    },

    mutations: {
      retry: (failureCount, error) => {
        // Only retry transient server errors, never client errors
        const { code } = parseApiError(error);
        if (['SERVER_ERROR', 'UNAVAILABLE', 'TIMEOUT', 'NETWORK_ERROR'].includes(code)) {
          return failureCount < 1; // one retry for mutations (idempotency concern)
        }
        return false;
      },
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner richColors closeButton position="top-right" />
      {children}
    </TooltipProvider>
  </QueryClientProvider>
);

export { queryClient };
export default Providers;
