import { create } from 'zustand';
import type { FlagKey, FlagMap, FeatureFlag } from '../types';

// ─── Default flags (used before remote config loads) ─────────────────────────
const DEFAULTS: FlagMap = {
  'new-dashboard-widgets': { key: 'new-dashboard-widgets', enabled: false, rolloutPercentage: 0 },
  'export-pdf':            { key: 'export-pdf',            enabled: false, rolloutPercentage: 0 },
  'advanced-cheque-filters':{ key: 'advanced-cheque-filters', enabled: true, rolloutPercentage: 100 },
  'audit-log-viewer':      { key: 'audit-log-viewer',      enabled: true,  rolloutPercentage: 100 },
  'bulk-user-import':      { key: 'bulk-user-import',      enabled: false, rolloutPercentage: 0 },
  'dark-mode':             { key: 'dark-mode',             enabled: false, rolloutPercentage: 0 },
};

interface FlagsState {
  flags: FlagMap;
  isLoaded: boolean;
  setFlags: (flags: Partial<FlagMap>) => void;
  overrideFlag: (key: FlagKey, flag: Partial<FeatureFlag>) => void;
}

export const useFlagsStore = create<FlagsState>()((set) => ({
  flags: DEFAULTS,
  isLoaded: false,

  setFlags: (incoming) => {
    set((state) => ({
      flags: { ...state.flags, ...incoming },
      isLoaded: true,
    }));
  },

  overrideFlag: (key, flag) => {
    set((state) => ({
      flags: {
        ...state.flags,
        [key]: { ...state.flags[key], ...flag },
      },
    }));
  },
}));

// ─── Deterministic rollout: same userId always gets the same result ────────────
export function isUserInRollout(userId: string, percentage: number): boolean {
  if (percentage >= 100) return true;
  if (percentage <= 0) return false;

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = Math.imul(31, hash) + userId.charCodeAt(i);
    hash |= 0; // force 32-bit int
  }

  return Math.abs(hash) % 100 < percentage;
}
