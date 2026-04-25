import { useState } from 'react';
import { UserCheck, Plus, RefreshCw } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCustomers, useCreateCustomer } from '../hooks/useOrders';
import type { Customer } from '../types';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', email: '', phone: '', address: '', city: '', taxId: '', creditLimit: 0 });

  const { data, isLoading, refetch } = useCustomers({ search });
  const createCustomer = useCreateCustomer();
  const customers: Customer[] = data?.data ?? [];

  function handleSubmit() {
    createCustomer.mutate(form, { onSuccess: () => { setOpen(false); setForm({ code: '', name: '', email: '', phone: '', address: '', city: '', taxId: '', creditLimit: 0 }); } });
  }

  return (
    <AdminLayout>
      <PageHeader title="مشتریان" description="مدیریت بانک اطلاعاتی مشتریان" icon={UserCheck} />

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <Input placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
            <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 ml-1" />مشتری جدید</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">کد</TableHead>
              <TableHead className="text-right">نام</TableHead>
              <TableHead className="text-right">تلفن</TableHead>
              <TableHead className="text-right">شهر</TableHead>
              <TableHead className="text-right">اعتبار</TableHead>
              <TableHead className="text-right">مانده</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : customers.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">هیچ مشتری یافت نشد</TableCell></TableRow>
            ) : customers.map((c: Customer) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono">{c.code}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.phone ?? '-'}</TableCell>
                <TableCell>{c.city ?? '-'}</TableCell>
                <TableCell className="font-mono">{Number(c.credit_limit).toLocaleString('fa-IR')}</TableCell>
                <TableCell className={`font-mono ${Number(c.balance) > Number(c.credit_limit) ? 'text-red-600' : ''}`}>
                  {Number(c.balance).toLocaleString('fa-IR')}
                </TableCell>
                <TableCell><Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'فعال' : 'غیرفعال'}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>مشتری جدید</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">کد مشتری</label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
            <div><label className="text-sm font-medium">نام</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="text-sm font-medium">ایمیل</label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="text-sm font-medium">تلفن</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="text-sm font-medium">شهر</label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div><label className="text-sm font-medium">سقف اعتبار</label><Input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: parseFloat(e.target.value) || 0 })} /></div>
            <div className="col-span-2"><label className="text-sm font-medium">آدرس</label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
            <Button onClick={handleSubmit} disabled={!form.code || !form.name || createCustomer.isPending}>
              {createCustomer.isPending ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
