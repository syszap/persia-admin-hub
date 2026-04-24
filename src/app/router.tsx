import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

// Eagerly load login — it's the entry point, not worth lazy-loading
import LoginPage from '@/features/auth/pages/LoginPage';

// All protected pages are lazy-loaded for code-splitting
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const MenuBuilderPage = lazy(() => import('@/features/menus/pages/MenuBuilderPage'));
const ReturnedChequesPage = lazy(() => import('@/features/returned-cheques/pages/ReturnedChequesPage'));
const ReturnedChequesCustomersPage = lazy(() => import('@/features/returned-cheques/pages/ReturnedChequesCustomersPage'));
const UserManagementPage = lazy(() => import('@/features/users/pages/UserManagementPage'));
const RolesPermissionsPage = lazy(() => import('@/features/roles/pages/RolesPermissionsPage'));
const SystemSettingsPage = lazy(() => import('@/features/settings/pages/SystemSettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/menus" element={<ProtectedRoute><MenuBuilderPage /></ProtectedRoute>} />
        <Route path="/returned-cheques" element={<ProtectedRoute><ReturnedChequesPage /></ProtectedRoute>} />
        <Route path="/returned-cheques/customers" element={<ProtectedRoute><ReturnedChequesCustomersPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute requiredRole="admin"><UserManagementPage /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute requiredRole="admin"><RolesPermissionsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute requiredRole="admin"><SystemSettingsPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
