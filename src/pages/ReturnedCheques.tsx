import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Download,
  AlertTriangle,
  FileText,
  TrendingDown,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";

interface ReturnedCheque {
  VoucherRef: number;
  VoucherNumber: string;
  elamiye: string | null;
  BankName: string | null;
  ChequeNumber: string | null;
  DueDate: string | null;
  VoucherDate: string | null;
  DLLevel4: string | null;
  DLTitle_Level4: string | null;
  DLLevel5: string | null;
  DLTitle_Level5: string | null;
  Debit: number;
  TotalBalance: number;
  CustomerBalance: number | null;
  FollowUpNumber: string | null;
  Description: string | null;
}

interface ApiResponse {
  data: ReturnedCheque[];
  page: number;
  limit: number;
  hasMore: boolean;
}

interface SummaryAlert {
  type: 'high-risk';
  message: string;
}

interface Summary {
  totalCount: number;
  totalAmount: number;
  overdueCount: number;
  overdueAmount: number;
  alerts: SummaryAlert[];
}

const LIMIT = 100;

const faNum  = new Intl.NumberFormat('fa-IR');
const faDate = new Intl.DateTimeFormat('fa-IR');

const formatNumber = (n: number | null | undefined): string => {
  if (n == null) return '—';
  return faNum.format(n);
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  try { return faDate.format(new Date(dateStr)); } catch { return dateStr; }
};

const isOverdue = (dateStr: string | null): boolean =>
  !!dateStr && dateStr < new Date().toISOString().slice(0, 10);

const ReturnedCheques = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  const [page, setPage] = useState(1);
  const [search,   setSearch]   = useState(initialSearch);
  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');

  const [appliedSearch,   setAppliedSearch]   = useState(initialSearch);
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedToDate,   setAppliedToDate]   = useState('');

  const buildUrl = (p: number) => {
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
    if (appliedSearch)   params.set('search',   appliedSearch);
    if (appliedFromDate) params.set('fromDate', appliedFromDate);
    if (appliedToDate)   params.set('toDate',   appliedToDate);
    return `/api/returned-cheques?${params.toString()}`;
  };

  const { data: summary } = useQuery<Summary>({
    queryKey: ['returned-cheques-summary'],
    queryFn: () => apiFetch('/api/returned-cheques/summary').then((r) => r.json()),
    staleTime: 60_000,
  });

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ['returned-cheques', page, appliedSearch, appliedFromDate, appliedToDate],
    queryFn: () =>
      apiFetch(buildUrl(page)).then((r) => {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }),
  });

  const applyFilter = () => {
    setPage(1);
    setAppliedSearch(search);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (appliedSearch)   params.set('search',   appliedSearch);
    if (appliedFromDate) params.set('fromDate', appliedFromDate);
    if (appliedToDate)   params.set('toDate',   appliedToDate);
    const response = await apiFetch(`/api/returned-cheques/export?${params.toString()}`);
    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'returned-cheques.xlsx'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="چک برگشتی"
        description="مشاهده چک‌های برگشتی پرداخت نشده"
        icon={BarChart3}
      />

      {/* Alert banner */}
      {summary && summary.alerts.length > 0 && (
        <div className="mb-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            {summary.alerts.map((alert, i) => (
              <p key={i} className="text-sm text-destructive">{alert.message}</p>
            ))}
          </div>
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card-surface flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">مجموع چک‌های برگشتی</p>
              <p className="text-xl font-bold text-foreground">{formatNumber(summary.totalCount)}</p>
            </div>
          </div>

          <div className="card-surface flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">مجموع مبلغ چک‌ها</p>
              <p className="text-xl font-bold text-foreground">{formatNumber(summary.totalAmount)}</p>
            </div>
          </div>

          <div className="card-surface flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">چک‌های سررسید گذشته</p>
              <p className="text-xl font-bold text-destructive">{formatNumber(summary.overdueCount)}</p>
            </div>
          </div>

          <div className="card-surface flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">مبلغ سررسید گذشته</p>
              <p className="text-xl font-bold text-destructive">{formatNumber(summary.overdueAmount)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="card-surface mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label className="label-subtle">جستجو</Label>
            <Input
              placeholder="جستجو مشتری یا شماره چک"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
              className="input-premium h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="label-subtle">از تاریخ سررسید</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-premium h-10"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label className="label-subtle">تا تاریخ سررسید</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-premium h-10"
              dir="ltr"
            />
          </div>
          <Button onClick={applyFilter} className="btn-hover rounded-xl h-10">
            اعمال فیلتر
          </Button>
          <Button variant="outline" onClick={handleExport} className="rounded-xl h-10 gap-2">
            <Download className="w-4 h-4" />
            خروجی اکسل
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="card-surface overflow-x-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            در حال بارگذاری...
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-center py-16 text-destructive text-sm">
            خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.
          </div>
        )}
        {data && data.data.length === 0 && (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            هیچ چک برگشتی‌ای یافت نشد.
          </div>
        )}
        {data && data.data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground">شماره سند</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">اعلامیه</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">نام بانک</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">شماره چک</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">سررسید</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">تاریخ سند</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">سطح ۴</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">سطح ۵</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">مبلغ</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">مانده کل</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">مانده مشتری</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">شماره پیگیری</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">شرح</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((row, idx) => (
                <TableRow key={`${row.VoucherRef}-${idx}`} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-sm font-medium">{row.VoucherNumber}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.elamiye ?? '—'}</TableCell>
                  <TableCell className="text-sm">{row.BankName ?? '—'}</TableCell>
                  <TableCell className="text-sm" dir="ltr">{row.ChequeNumber ?? '—'}</TableCell>
                  <TableCell className="text-sm">
                    {row.DueDate ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span dir="ltr">{formatDate(row.DueDate)}</span>
                        {isOverdue(row.DueDate) && (
                          <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10 text-[10px] px-1.5 py-0 shrink-0">
                            سررسید گذشته
                          </Badge>
                        )}
                      </div>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-sm" dir="ltr">{formatDate(row.VoucherDate)}</TableCell>
                  <TableCell className="text-sm">{row.DLTitle_Level4 ?? '—'}</TableCell>
                  <TableCell className="text-sm">{row.DLTitle_Level5 ?? '—'}</TableCell>
                  <TableCell className="text-sm" dir="ltr">{formatNumber(row.Debit)}</TableCell>
                  <TableCell className="text-sm" dir="ltr">{formatNumber(row.TotalBalance)}</TableCell>
                  <TableCell className="text-sm" dir="ltr">{formatNumber(row.CustomerBalance)}</TableCell>
                  <TableCell className="text-sm">{row.FollowUpNumber ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{row.Description ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {data && (data.hasMore || page > 1) && (
        <div className="flex items-center justify-between mt-4 px-1">
          <Button
            variant="outline" size="sm" className="rounded-xl"
            onClick={() => setPage((p) => p - 1)} disabled={page === 1}
          >
            <ChevronRight className="w-4 h-4 ml-1" />قبلی
          </Button>
          <span className="text-sm text-muted-foreground">صفحه {page}</span>
          <Button
            variant="outline" size="sm" className="rounded-xl"
            onClick={() => setPage((p) => p + 1)} disabled={!data.hasMore}
          >
            بعدی<ChevronLeft className="w-4 h-4 mr-1" />
          </Button>
        </div>
      )}
    </AdminLayout>
  );
};

export default ReturnedCheques;
