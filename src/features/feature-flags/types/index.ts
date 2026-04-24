/** All feature flags in the system — add new flags here as a union member. */
export type FlagKey =
  | 'new-dashboard-widgets'
  | 'export-pdf'
  | 'advanced-cheque-filters'
  | 'audit-log-viewer'
  | 'bulk-user-import'
  | 'dark-mode';

export interface FeatureFlag {
  key: FlagKey;
  enabled: boolean;
  /** Percentage of users who see this feature (0–100). Evaluated deterministically by userId hash. */
  rolloutPercentage: number;
  /** Optional ISO date after which the flag auto-expires and is treated as disabled. */
  expiresAt?: string;
  /** Human description (used in admin UI) */
  description?: string;
}

export type FlagMap = Record<FlagKey, FeatureFlag>;
