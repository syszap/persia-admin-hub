import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import type { UserRole, Permission } from '../types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Legacy: minimum role weight (kept for backward compat) */
  requiredRole?: UserRole;
  /** PBAC: require a single permission */
  requiredPermission?: Permission;
  /** PBAC: require any one of these permissions (OR logic) */
  requireAnyPermission?: Permission[];
  /** PBAC: require all of these permissions (AND logic) */
  requireAllPermissions?: Permission[];
}

/**
 * Guards a route with authentication + PBAC.
 *
 * Evaluation order:
 *  1. isAuthenticated  — redirect to /login if false
 *  2. requiredPermission (single)
 *  3. requireAnyPermission (OR)
 *  4. requireAllPermissions (AND)
 *  5. requiredRole (legacy fallback, only evaluated when no permission props given)
 */
const ProtectedRoute = ({
  children,
  requiredRole = 'user',
  requiredPermission,
  requireAnyPermission,
  requireAllPermissions,
}: ProtectedRouteProps) => {
  const {
    isAuthenticated,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = useAuthStore();

  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  if (requireAnyPermission?.length && !hasAnyPermission(requireAnyPermission)) {
    return <Navigate to="/" replace />;
  }

  if (requireAllPermissions?.length && !hasAllPermissions(requireAllPermissions)) {
    return <Navigate to="/" replace />;
  }

  // Legacy role check — only applied when no fine-grained permission props were specified
  if (!requiredPermission && !requireAnyPermission && !requireAllPermissions) {
    if (!hasRole(requiredRole)) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
