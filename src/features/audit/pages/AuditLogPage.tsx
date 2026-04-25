import { useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';

const ACTION_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CREATE: 'default',
  UPDATE: 'outline',
  DELETE: 'destructive',
  VIEW: 'secondary',
  LOGIN: 'default',
  LOGOUT: 'secondary',
  LOGIN_FAILED: 'destructive',
  APPROVE: 'default',
  EXPORT: 'outline',
};

interface AuditLog {
  id: string;
  username: string;
  action: string;
  resource: string;
  resource_id?: string;
  ip_address?: string;
  created_at: string;
}

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [resource, setResource] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', search, resource],
    queryFn: () => apiClient.get('/audit', { params: { search, resource: resource || undefined, limit: 50 } }).then((r) => r.data),
  });

  const logs: AuditLog[] = data?.data ?? [];

  return (
    <AdminLayout>
      <PageHeader title="لاگ رویدادها" description="تاریخچه تمام فعالیت‌های سیستم" icon={History} />

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <Input placeholder="جستجو کاربر..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            <Input placeholder="فیلتر ماژول..." value={resource} onChange={(e) => setResource(e.target.value)} className="max-w-xs" />
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">زمان</TableHead>
              <TableHead className="text-right">کاربر</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
              <TableHead className="text-right">ماژول</TableHead>
              <TableHead className="text-right">شناسه</TableHead>
              <TableHead className="text-right">IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">هیچ رویدادی یافت نشد</TableCell></TableRow>
            ) : logs.map((log: AuditLog) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString('fa-IR')}</TableCell>
                <TableCell className="font-medium">{log.username ?? '-'}</TableCell>
                <TableCell><Badge variant={ACTION_VARIANTS[log.action] ?? 'secondary'}>{log.action}</Badge></TableCell>
                <TableCell className="text-sm">{log.resource}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{log.resource_id?.slice(0, 8) ?? '-'}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{log.ip_address ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
