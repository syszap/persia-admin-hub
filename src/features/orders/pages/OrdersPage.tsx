import { useState } from 'react';
import { ShoppingCart, Plus, RefreshCw } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders, useOrderStats, useUpdateOrderStatus } from '../hooks/useOrders';
import type { Order, OrderStatus, PaymentStatus } from '../types';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../types';

const ORDER_STATUS_VARIANTS: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  confirmed: 'outline',
  processing: 'outline',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
  returned: 'destructive',
};

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, refetch } = useOrders({ search, status: statusFilter || undefined });
  const { data: statsData } = useOrderStats();
  const updateStatus = useUpdateOrderStatus();

  const orders: Order[] = data?.data ?? [];
  const stats = statsData?.data;

  return (
    <AdminLayout>
      <PageHeader title="سفارشات" description="مدیریت و پیگیری سفارشات" icon={ShoppingCart} />

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">کل سفارشات</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{Number(stats.total_orders).toLocaleString('fa-IR')}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">کل درآمد</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{Number(stats.total_revenue || 0).toLocaleString('fa-IR')}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">در انتظار</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-600">{Number(stats.pending_count).toLocaleString('fa-IR')}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">مطالبات</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{Number(stats.outstanding_amount || 0).toLocaleString('fa-IR')}</div></CardContent></Card>
        </div>
      )}

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <Input placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="همه وضعیت‌ها" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">همه</SelectItem>
                {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">شماره سفارش</TableHead>
              <TableHead className="text-right">مشتری</TableHead>
              <TableHead className="text-right">تاریخ</TableHead>
              <TableHead className="text-right">مبلغ کل</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">پرداخت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">هیچ سفارشی یافت نشد</TableCell></TableRow>
            ) : orders.map((o: Order) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono">{o.order_number}</TableCell>
                <TableCell>{o.customer_name}</TableCell>
                <TableCell>{new Date(o.date).toLocaleDateString('fa-IR')}</TableCell>
                <TableCell className="font-mono">{Number(o.total).toLocaleString('fa-IR')}</TableCell>
                <TableCell><Badge variant={ORDER_STATUS_VARIANTS[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge></TableCell>
                <TableCell>
                  <span className={`text-xs ${o.payment_status === 'paid' ? 'text-green-600' : o.payment_status === 'unpaid' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {PAYMENT_STATUS_LABELS[o.payment_status]}
                  </span>
                </TableCell>
                <TableCell>
                  {o.status === 'pending' && (
                    <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateStatus.mutate({ id: o.id, status: 'confirmed' })}>
                      تأیید
                    </Button>
                  )}
                  {o.status === 'confirmed' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: o.id, status: 'processing' })}>
                      پردازش
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
