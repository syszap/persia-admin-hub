import { LayoutDashboard, Users, ShoppingCart, DollarSign, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import StatCard from '../components/StatCard';
import { apiClient } from '@/services/api/client';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [usersRes, orderStatsRes, lowStockRes] = await Promise.allSettled([
        apiClient.get('/users?limit=1'),
        apiClient.get('/orders/stats'),
        apiClient.get('/products/low-stock'),
      ]);

      return {
        userCount: usersRes.status === 'fulfilled' ? usersRes.value.data?.meta?.total ?? 0 : 0,
        orderStats: orderStatsRes.status === 'fulfilled' ? orderStatsRes.value.data?.data : null,
        lowStockCount: lowStockRes.status === 'fulfilled' ? (lowStockRes.value.data?.data?.length ?? 0) : 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

const DashboardPage = () => {
  const { user, hasPermission } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats();

  const totalOrders = stats?.orderStats?.total_orders ?? 0;
  const totalRevenue = stats?.orderStats?.total_revenue ?? 0;
  const pendingOrders = stats?.orderStats?.pending_count ?? 0;
  const outstandingAmount = stats?.orderStats?.outstanding_amount ?? 0;

  // Mock chart data – would come from real API in production
  const chartData = [
    { month: 'فروردین', orders: 12, revenue: 4500000 },
    { month: 'اردیبهشت', orders: 18, revenue: 6800000 },
    { month: 'خرداد', orders: 15, revenue: 5200000 },
    { month: 'تیر', orders: 22, revenue: 8900000 },
    { month: 'مرداد', orders: 28, revenue: 11000000 },
    { month: 'شهریور', orders: 35, revenue: 14500000 },
  ];

  return (
    <AdminLayout>
      <PageHeader title="داشبورد" description={`خوش آمدید، ${user?.fullName ?? user?.username}`} icon={LayoutDashboard} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {hasPermission('user.view') && (
          <StatCard title="کاربران" value={isLoading ? '...' : String(stats?.userCount ?? 0)} icon={Users} delay="0ms" />
        )}
        {hasPermission('order.view') && (
          <StatCard title="کل سفارشات" value={isLoading ? '...' : String(totalOrders)} icon={ShoppingCart} delay="60ms" />
        )}
        {hasPermission('financial.view') && (
          <StatCard title="درآمد کل" value={isLoading ? '...' : Number(totalRevenue).toLocaleString('fa-IR')} icon={DollarSign} delay="120ms" />
        )}
        {hasPermission('product.view') && (
          <StatCard
            title="کمبود موجودی"
            value={isLoading ? '...' : String(stats?.lowStockCount ?? 0)}
            icon={stats?.lowStockCount ? AlertTriangle : Package}
            delay="180ms"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {hasPermission('order.view') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                روند سفارشات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip formatter={(v) => [Number(v).toLocaleString('fa-IR'), 'سفارش']} />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {hasPermission('order.view') && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">سفارشات در انتظار</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          )}
          {hasPermission('financial.view') && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">مطالبات معوقه</p>
                    <p className="text-2xl font-bold text-red-600">{Number(outstandingAmount).toLocaleString('fa-IR')}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
