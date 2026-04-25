import { useState } from 'react';
import { ClipboardList, Plus, RefreshCw, Check, X } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTransactions, useCreateTransaction, usePostTransaction, useVoidTransaction } from '../hooks/useTransactions';
import { useAccounts } from '../hooks/useAccounts';
import type { Transaction, TransactionStatus } from '../types';
import { TRANSACTION_STATUS_LABELS } from '../types';
import { useAuthStore } from '@/features/auth/store/auth.store';

const STATUS_VARIANTS: Record<TransactionStatus, 'default' | 'secondary' | 'destructive'> = {
  draft: 'secondary',
  posted: 'default',
  void: 'destructive',
};

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState([{ accountId: '', entryType: 'debit' as const, amount: 0, description: '' }]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');

  const { data, isLoading, refetch } = useTransactions({ search });
  const { data: accountsData } = useAccounts({ limit: 200 });
  const createTx = useCreateTransaction();
  const postTx = usePostTransaction();
  const voidTx = useVoidTransaction();
  const { hasPermission } = useAuthStore();

  const transactions: Transaction[] = data?.data ?? [];
  const accounts = accountsData?.data ?? [];

  function addEntry() {
    setEntries([...entries, { accountId: '', entryType: 'debit', amount: 0, description: '' }]);
  }

  function removeEntry(i: number) {
    setEntries(entries.filter((_, idx) => idx !== i));
  }

  function updateEntry(i: number, key: string, val: string | number) {
    setEntries(entries.map((e, idx) => idx === i ? { ...e, [key]: val } : e));
  }

  const debitTotal = entries.filter(e => e.entryType === 'debit').reduce((s, e) => s + Number(e.amount), 0);
  const creditTotal = entries.filter(e => e.entryType === 'credit').reduce((s, e) => s + Number(e.amount), 0);
  const balanced = Math.abs(debitTotal - creditTotal) < 0.01;

  function handleSubmit() {
    if (!description || !balanced) return;
    createTx.mutate({ date, description, entries } as unknown as Parameters<typeof createTx.mutate>[0], {
      onSuccess: () => { setOpen(false); setEntries([{ accountId: '', entryType: 'debit', amount: 0, description: '' }]); setDescription(''); },
    });
  }

  return (
    <AdminLayout>
      <PageHeader title="اسناد حسابداری" description="دفتر روزنامه - ثبت و مدیریت اسناد مالی" icon={ClipboardList} />

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <Input placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
            {hasPermission('financial.create') && (
              <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 ml-1" />سند جدید</Button>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">شماره سند</TableHead>
              <TableHead className="text-right">تاریخ</TableHead>
              <TableHead className="text-right">شرح</TableHead>
              <TableHead className="text-right">مبلغ</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : transactions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">هیچ سندی یافت نشد</TableCell></TableRow>
            ) : (
              transactions.map((tx: Transaction) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono">{tx.reference_number}</TableCell>
                  <TableCell>{new Date(tx.date).toLocaleDateString('fa-IR')}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className="font-mono">{Number(tx.total_amount).toLocaleString('fa-IR')}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[tx.status]}>{TRANSACTION_STATUS_LABELS[tx.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {tx.status === 'draft' && hasPermission('financial.approve') && (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => postTx.mutate(tx.id)}>
                          <Check className="w-3 h-3 ml-1" />ثبت
                        </Button>
                      )}
                      {tx.status === 'posted' && hasPermission('financial.approve') && (
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => voidTx.mutate(tx.id)}>
                          <X className="w-3 h-3 ml-1" />ابطال
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader><DialogTitle>سند حسابداری جدید</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">تاریخ</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">شرح کلی</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="شرح سند..." />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">ردیف‌های سند</h4>
                <Button type="button" size="sm" variant="outline" onClick={addEntry}><Plus className="w-3 h-3 ml-1" />افزودن ردیف</Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {entries.map((entry, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 items-center">
                    <select
                      className="col-span-2 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={entry.accountId}
                      onChange={(e) => updateEntry(i, 'accountId', e.target.value)}
                    >
                      <option value="">انتخاب حساب...</option>
                      {accounts.map((a: { id: string; code: string; name_fa: string }) => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name_fa}</option>
                      ))}
                    </select>
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={entry.entryType}
                      onChange={(e) => updateEntry(i, 'entryType', e.target.value)}
                    >
                      <option value="debit">بدهکار</option>
                      <option value="credit">بستانکار</option>
                    </select>
                    <Input
                      type="number"
                      value={entry.amount || ''}
                      onChange={(e) => updateEntry(i, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="مبلغ"
                    />
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeEntry(i)} disabled={entries.length === 1}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-muted-foreground">بدهکار: <strong className="text-foreground">{debitTotal.toLocaleString('fa-IR')}</strong></span>
                <span className="text-muted-foreground">بستانکار: <strong className="text-foreground">{creditTotal.toLocaleString('fa-IR')}</strong></span>
                <span className={balanced ? 'text-green-600' : 'text-red-600'}>{balanced ? '✓ تراز' : '✗ عدم تراز'}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
            <Button onClick={handleSubmit} disabled={!balanced || !description || createTx.isPending}>
              {createTx.isPending ? 'در حال ذخیره...' : 'ذخیره سند'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
