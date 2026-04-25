import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import AuthInitializer from '@/features/auth/components/AuthInitializer';
import OfflineFallback from '@/shared/components/OfflineFallback';
import LoginPage from '@/features/auth/pages/LoginPage';

// Core pages
const DashboardPage                 = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const MenuBuilderPage               = lazy(() => import('@/features/menus/pages/MenuBuilderPage'));
const ReturnedChequesPage           = lazy(() => import('@/features/returned-cheques/pages/ReturnedChequesPage'));
const ReturnedChequesCustomersPage  = lazy(() => import('@/features/returned-cheques/pages/ReturnedChequesCustomersPage'));
const UserManagementPage            = lazy(() => import('@/features/users/pages/UserManagementPage'));
const RolesPermissionsPage          = lazy(() => import('@/features/roles/pages/RolesPermissionsPage'));
const SystemSettingsPage            = lazy(() => import('@/features/settings/pages/SystemSettingsPage'));

// Financial module
const AccountsPage       = lazy(() => import('@/features/financial/pages/AccountsPage'));
const TransactionsPage   = lazy(() => import('@/features/financial/pages/TransactionsPage'));
const LedgerPage         = lazy(() => import('@/features/financial/pages/LedgerPage'));

// Products module
const ProductsPage    = lazy(() => import('@/features/products/pages/ProductsPage'));
const CategoriesPage  = lazy(() => import('@/features/products/pages/CategoriesPage'));
const InventoryPage   = lazy(() => import('@/features/products/pages/InventoryPage'));

// Orders module
const OrdersPage    = lazy(() => import('@/features/orders/pages/OrdersPage'));
const CustomersPage = lazy(() => import('@/features/orders/pages/CustomersPage'));

// Audit log
const AuditLogPage = lazy(() => import('@/features/audit/pages/AuditLogPage'));

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
    <AuthInitializer>
      <OfflineFallback>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

            {/* ── Menus & Reports ────────────────────────────────────────── */}
            <Route path="/menus" element={<ProtectedRoute requiredPermission="menu.view"><MenuBuilderPage /></ProtectedRoute>} />

            {/* ── Returned Cheques ───────────────────────────────────────── */}
            <Route path="/returned-cheques" element={<ProtectedRoute requiredPermission="cheque.view"><ReturnedChequesPage /></ProtectedRoute>} />
            <Route path="/returned-cheques/customers" element={<ProtectedRoute requiredPermission="cheque.view"><ReturnedChequesCustomersPage /></ProtectedRoute>} />

            {/* ── Financial module ───────────────────────────────────────── */}
            <Route path="/financial/accounts" element={<ProtectedRoute requiredPermission="account.view"><AccountsPage /></ProtectedRoute>} />
            <Route path="/financial/transactions" element={<ProtectedRoute requiredPermission="financial.view"><TransactionsPage /></ProtectedRoute>} />
            <Route path="/financial/ledger" element={<ProtectedRoute requiredPermission="financial.view"><LedgerPage /></ProtectedRoute>} />

            {/* ── Products module ────────────────────────────────────────── */}
            <Route path="/products" element={<ProtectedRoute requiredPermission="product.view"><ProductsPage /></ProtectedRoute>} />
            <Route path="/products/categories" element={<ProtectedRoute requiredPermission="product.view"><CategoriesPage /></ProtectedRoute>} />
            <Route path="/products/inventory" element={<ProtectedRoute requiredPermission="product.view"><InventoryPage /></ProtectedRoute>} />

            {/* ── Orders module ──────────────────────────────────────────── */}
            <Route path="/orders" element={<ProtectedRoute requiredPermission="order.view"><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/customers" element={<ProtectedRoute requiredPermission="customer.view"><CustomersPage /></ProtectedRoute>} />

            {/* ── Admin routes ───────────────────────────────────────────── */}
            <Route path="/users" element={<ProtectedRoute requiredPermission="user.view"><UserManagementPage /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute requiredPermission="role.view"><RolesPermissionsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute requiredPermission="settings.view"><SystemSettingsPage /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute requiredPermission="audit.view"><AuditLogPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </OfflineFallback>
    </AuthInitializer>
  </BrowserRouter>
);

export default AppRouter;
