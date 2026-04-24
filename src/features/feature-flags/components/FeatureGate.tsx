import type { ReactNode } from 'react';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import type { FlagKey } from '../types';

interface FeatureGateProps {
  flag: FlagKey;
  /** Rendered when the flag is ON */
  children: ReactNode;
  /** Rendered when the flag is OFF (optional) */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on a feature flag.
 *
 * Usage:
 *   <FeatureGate flag="export-pdf" fallback={<DisabledBadge />}>
 *     <ExportPdfButton />
 *   </FeatureGate>
 */
const FeatureGate = ({ flag, children, fallback = null }: FeatureGateProps) => {
  const enabled = useFeatureFlag(flag);
  return <>{enabled ? children : fallback}</>;
};

export default FeatureGate;
