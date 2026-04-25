import { useState } from 'react';
import { BookOpen, Plus, RefreshCw } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAccounts, useCreateAccount, useTrialBalance } from '../hooks/useAccounts';
import type { Account, AccountType } from '../types';
import { ACCOUNT_TYPE_LABELS } from '../types';

const formSchema = z.object({
  code: z.string().min(1, 'کد حساب الزامی است'),
  name: z.string().min(1, 'نام انگلیسی الزامی است'),
  nameFa: z.string().min(1, 'نام فارسی الزامی است'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TYPE_COLORS: Record<AccountType, string> = {
  asset: 'bg-blue-100 text-blue-800',
  liability: 'bg-red-100 text-red-800',
  equity: 'bg-purple-100 text-purple-800',
  revenue: 'bg-green-100 text-green-800',
  expense: 'bg-orange-100 text-orange-800',
};

export default function AccountsPage() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const { data, isLoading, refetch } = useAccounts({ search });
  const { data: trialBalance } = useTrialBalance();
  const createAccount = useCreateAccount();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: '', name: '', nameFa: '', type: 'asset', description: '' },
  });

  const accounts: Account[] = data?.data ?? [];
  const tb: { debitTotal: number; creditTotal: number }[] = trialBalance?.data ?? [];
  const totalDebit = tb.reduce((s: number, r: { debitTotal: number }) => s + Number(r.debitTotal), 0);
  const totalCredit = tb.reduce((s: number, r: { creditTotal: number }) => s + Number(r.creditTotal), 0);

  function onSubmit(values: FormValues) {
    createAccount.mutate(values, {
      onSuccess: () => { setOpen(false); form.reset(); },
    });
  }

  return (
    <AdminLayout>
      <PageHeader title="حساب‌های کل" description="مدیریت نمودار حساب‌ها" icon={BookOpen} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">مجموع حساب‌ها</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{accounts.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">جمع بدهکار</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{totalDebit.toLocaleString('fa-IR')}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">جمع بستانکار</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{totalCredit.toLocaleString('fa-IR')}</div></CardContent>
        </Card>
      </div>

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <Input placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
            <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 ml-1" />حساب جدید</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">کد</TableHead>
              <TableHead className="text-right">نام فارسی</TableHead>
              <TableHead className="text-right">نوع</TableHead>
              <TableHead className="text-right">مانده</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : accounts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">هیچ حسابی یافت نشد</TableCell></TableRow>
            ) : (
              accounts.map((acc: Account) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-mono">{acc.code}</TableCell>
                  <TableCell>{acc.name_fa}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[acc.type]}`}>
                      {ACCOUNT_TYPE_LABELS[acc.type]}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono">{Number(acc.balance).toLocaleString('fa-IR')}</TableCell>
                  <TableCell>
                    <Badge variant={acc.is_active ? 'default' : 'secondary'}>{acc.is_active ? 'فعال' : 'غیرفعال'}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>حساب جدید</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>کد حساب</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="nameFa" render={({ field }) => (
                <FormItem><FormLabel>نام فارسی</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>نام انگلیسی</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>نوع حساب</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
                <Button type="submit" disabled={createAccount.isPending}>
                  {createAccount.isPending ? 'در حال ذخیره...' : 'ذخیره'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
