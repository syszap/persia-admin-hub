import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccounts, useAccountLedger, useTrialBalance } from '../hooks/useAccounts';
import type { LedgerEntry, AccountBalance } from '../types';
import { ACCOUNT_TYPE_LABELS } from '../types';

export default function LedgerPage() {
  const [activeTab, setActiveTab] = useState<'ledger' | 'trial'>('trial');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data: accountsData } = useAccounts({ limit: 200 });
  const { data: ledgerData, isLoading: ledgerLoading } = useAccountLedger(
    selectedAccount,
    { fromDate, toDate },
  );
  const { data: tbData, isLoading: tbLoading } = useTrialBalance();

  const accounts = accountsData?.data ?? [];
  const ledger: LedgerEntry[] = ledgerData?.data ?? [];
  const trialBalance: AccountBalance[] = tbData?.data ?? [];

  const totalDebit = trialBalance.reduce((s, r) => s + Number(r.debitTotal), 0);
  const totalCredit = trialBalance.reduce((s, r) => s + Number(r.creditTotal), 0);

  return (
    <AdminLayout>
      <PageHeader title="دفتر کل" description="مشاهده گردش حساب‌ها و تراز آزمایشی" icon={BarChart3} />

      <div className="flex gap-2 mb-6">
        <Button variant={activeTab === 'trial' ? 'default' : 'outline'} onClick={() => setActiveTab('trial')}>تراز آزمایشی</Button>
        <Button variant={activeTab === 'ledger' ? 'default' : 'outline'} onClick={() => setActiveTab('ledger')}>گردش حساب</Button>
      </div>

      {activeTab === 'trial' && (
        <div className="card-surface p-6">
          <h3 className="text-lg font-semibold mb-4">تراز آزمایشی</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">کد</TableHead>
                <TableHead className="text-right">نام حساب</TableHead>
                <TableHead className="text-right">نوع</TableHead>
                <TableHead className="text-right">بدهکار</TableHead>
                <TableHead className="text-right">بستانکار</TableHead>
                <TableHead className="text-right">مانده</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tbLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center">در حال بارگذاری...</TableCell></TableRow>
              ) : trialBalance.map((row: AccountBalance) => (
                <TableRow key={row.accountId}>
                  <TableCell className="font-mono">{row.accountCode}</TableCell>
                  <TableCell>{row.accountName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ACCOUNT_TYPE_LABELS[row.accountType as keyof typeof ACCOUNT_TYPE_LABELS]}</TableCell>
                  <TableCell className="font-mono text-blue-600">{Number(row.debitTotal).toLocaleString('fa-IR')}</TableCell>
                  <TableCell className="font-mono text-green-600">{Number(row.creditTotal).toLocaleString('fa-IR')}</TableCell>
                  <TableCell className={`font-mono font-semibold ${Number(row.balance) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {Math.abs(Number(row.balance)).toLocaleString('fa-IR')} {Number(row.balance) >= 0 ? 'بد' : 'بس'}
                  </TableCell>
                </TableRow>
              ))}
              {!tbLoading && trialBalance.length > 0 && (
                <TableRow className="font-bold bg-muted/50">
                  <TableCell colSpan={3}>جمع کل</TableCell>
                  <TableCell className="font-mono text-blue-600">{totalDebit.toLocaleString('fa-IR')}</TableCell>
                  <TableCell className="font-mono text-green-600">{totalCredit.toLocaleString('fa-IR')}</TableCell>
                  <TableCell className={Math.abs(totalDebit - totalCredit) < 0.01 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(totalDebit - totalCredit) < 0.01 ? '✓ تراز' : '✗ عدم تراز'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="card-surface p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger><SelectValue placeholder="انتخاب حساب..." /></SelectTrigger>
              <SelectContent>
                {accounts.map((a: { id: string; code: string; name_fa: string }) => (
                  <SelectItem key={a.id} value={a.id}>{a.code} - {a.name_fa}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} placeholder="از تاریخ" />
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} placeholder="تا تاریخ" />
          </div>

          {!selectedAccount ? (
            <p className="text-center text-muted-foreground py-8">یک حساب انتخاب کنید</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">شماره سند</TableHead>
                  <TableHead className="text-right">شرح</TableHead>
                  <TableHead className="text-right">بدهکار</TableHead>
                  <TableHead className="text-right">بستانکار</TableHead>
                  <TableHead className="text-right">مانده</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center">در حال بارگذاری...</TableCell></TableRow>
                ) : ledger.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">هیچ گردشی یافت نشد</TableCell></TableRow>
                ) : (
                  ledger.map((entry: LedgerEntry, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{new Date(entry.date).toLocaleDateString('fa-IR')}</TableCell>
                      <TableCell className="font-mono">{entry.referenceNumber}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="font-mono text-blue-600">{entry.debit > 0 ? entry.debit.toLocaleString('fa-IR') : '-'}</TableCell>
                      <TableCell className="font-mono text-green-600">{entry.credit > 0 ? entry.credit.toLocaleString('fa-IR') : '-'}</TableCell>
                      <TableCell className={`font-mono font-semibold ${entry.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {Math.abs(entry.balance).toLocaleString('fa-IR')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
