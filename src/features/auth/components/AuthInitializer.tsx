import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';
import { logger } from '@/shared/lib/logger';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * Runs a silent token refresh on page load when a refresh token exists in the
 * persisted store (localStorage) but the access token is gone (memory-only).
 *
 * Shows a minimal loading screen while the refresh is in flight so that
 * ProtectedRoute never sees an unauthenticated state mid-refresh.
 *
 * Place this INSIDE <Providers> but OUTSIDE <AppRouter> so the router never
 * renders before auth state is resolved.
 */
const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const { token, refreshToken, user, setAuth, logout } = useAuthStore();
  const [isReady, setIsReady] = useState<boolean>(() => {
    // If we already have an access token (impossible on fresh load but
    // theoretically reachable in tests/SSR), skip the refresh.
    return !!token || !refreshToken;
  });
  const attempted = useRef(false);

  useEffect(() => {
    if (isReady || attempted.current) return;
    if (!refreshToken) {
      setIsReady(true);
      return;
    }

    attempted.current = true;

    logger.debug('[AuthInitializer] Attempting silent token refresh');

    authService
      .refresh(refreshToken)
      .then(({ token: newToken, refreshToken: newRefresh, user: freshUser }) => {
        setAuth(newToken, newRefresh, freshUser ?? user!);
        logger.info('[AuthInitializer] Silent refresh succeeded');
      })
      .catch((err) => {
        logger.warn('[AuthInitializer] Silent refresh failed — clearing session', err);
        logout();
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — intentionally runs once

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background" dir="rtl">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
