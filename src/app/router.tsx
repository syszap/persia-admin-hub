import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import AuthInitializer from '@/features/auth/components/AuthInitializer';
import OfflineFallback from '@/shared/components/OfflineFallback';

// Entry point — eagerly loaded
import LoginPage from '@/features/auth/pages/LoginPage';

// All protected pages are lazy-loaded
const DashboardPage                 = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const MenuBuilderPage               = lazy(() => import('@/features/menus/pages/MenuBuilderPage'));
const ReturnedChequesPage           = lazy(() => import('@/features/returned-cheques/pages/ReturnedChequesPage'));
const ReturnedChequesCustomersPage  = lazy(() => import('@/features/returned-cheques/pages/ReturnedChequesCustomersPage'));
const UserManagementPage            = lazy(() => import('@/features/users/pages/UserManagementPage'));
const RolesPermissionsPage          = lazy(() => import('@/features/roles/pages/RolesPermissionsPage'));
const SystemSettingsPage            = lazy(() => import('@/features/settings/pages/SystemSettingsPage'));
const NotFoundPage                  = lazy(() => import('@/pages/NotFound'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
    </div>
  </div>
);

const AppRouter = () => (
  <BrowserRouter>
    {/*
      AuthInitializer performs a silent refresh on page reload
      (access token is memory-only, so it's gone after reload).
      It blocks rendering until auth state is settled.
    */}
    <AuthInitializer>
      {/*
        OfflineFallback overlays an offline notice when connectivity is lost.
        Children stay mounted and serve React Query cached data.
      */}
      <OfflineFallback>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* ── General user routes (permission: cheque.view / menu.view) ── */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />

            <Route path="/menus" element={
              <ProtectedRoute requiredPermission="menu.view">
                <MenuBuilderPage />
              </ProtectedRoute>
            } />

            <Route path="/returned-cheques" element={
              <ProtectedRoute requiredPermission="cheque.view">
                <ReturnedChequesPage />
              </ProtectedRoute>
            } />

            <Route path="/returned-cheques/customers" element={
              <ProtectedRoute requiredPermission="cheque.view">
                <ReturnedChequesCustomersPage />
              </ProtectedRoute>
            } />

            {/* ── Admin routes (fine-grained PBAC) ─────────────────────────── */}
            <Route path="/users" element={
              <ProtectedRoute requiredPermission="user.view">
                <UserManagementPage />
              </ProtectedRoute>
            } />

            <Route path="/roles" element={
              <ProtectedRoute requiredPermission="role.view">
                <RolesPermissionsPage />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute requiredPermission="settings.view">
                <SystemSettingsPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </OfflineFallback>
    </AuthInitializer>
  </BrowserRouter>
);

export default AppRouter;
