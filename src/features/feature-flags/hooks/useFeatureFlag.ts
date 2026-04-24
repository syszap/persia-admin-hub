import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { apiClient } from '@/services/api/client';
import { queryKeys } from '@/lib/queryKeys';
import { STALE } from '@/app/providers';
import { useFlagsStore, isUserInRollout } from '../store/flags.store';
import type { FlagKey, FlagMap } from '../types';

// ─── Remote flag sync (fires once after login) ────────────────────────────────
export const useFeatureFlagSync = () => {
  const setFlags = useFlagsStore((s) => s.setFlags);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useQuery({
    queryKey: queryKeys.featureFlags.all(),
    queryFn: async () => {
      const { data } = await apiClient.get<FlagMap>('/feature-flags');
      setFlags(data);
      return data;
    },
    staleTime: STALE.long,         // 30 min — flags rarely change
    enabled: isAuthenticated,
    retry: false,                  // Fail silently; defaults are still used
  });
};

// ─── Per-flag hook ────────────────────────────────────────────────────────────
export const useFeatureFlag = (key: FlagKey): boolean => {
  const flag = useFlagsStore((s) => s.flags[key]);
  const userId = useAuthStore((s) => s.user?.id ?? '');

  if (!flag || !flag.enabled) return false;

  // Honour expiry
  if (flag.expiresAt && new Date(flag.expiresAt) < new Date()) return false;

  return isUserInRollout(userId, flag.rolloutPercentage);
};

// ─── Multi-flag hook ──────────────────────────────────────────────────────────
export const useFeatureFlags = (keys: FlagKey[]): Record<FlagKey, boolean> => {
  const flags = useFlagsStore((s) => s.flags);
  const userId = useAuthStore((s) => s.user?.id ?? '');

  return Object.fromEntries(
    keys.map((key) => {
      const flag = flags[key];
      const active =
        !!flag?.enabled &&
        !(flag.expiresAt && new Date(flag.expiresAt) < new Date()) &&
        isUserInRollout(userId, flag.rolloutPercentage);
      return [key, active];
    }),
  ) as Record<FlagKey, boolean>;
};
