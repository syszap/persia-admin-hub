import { useState } from "react";
import { BarChart3, ChevronRight, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const LIMIT = 100;

const ReturnedCheques = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["returned-cheques", page],
    queryFn: () =>
      fetch(`/api/returned-cheques?page=${page}&limit=${LIMIT}`).then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      }),
  });

  return (
    <AdminLayout>
      <PageHeader
        title="چک برگشتی"
        description="مشاهده چک‌های برگشتی پرداخت نشده"
        icon={BarChart3}
      />

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
                  <TableCell className="text-sm text-muted-foreground">{row.elamiye ?? "—"}</TableCell>
                  <TableCell className="text-sm">{row.BankName ?? "—"}</TableCell>
                  <TableCell className="text-sm" dir="ltr">{row.ChequeNumber ?? "—"}</TableCell>
                  <TableCell className="text-sm" dir="ltr">{row.DueDate ?? "—"}</TableCell>
                  <TableCell className="text-sm" dir="ltr">{row.VoucherDate ?? "—"}</TableCell>
                  <TableCell className="text-sm">{row.DLTitle_Level4 ?? "—"}</TableCell>
                  <TableCell className="text-sm">{row.DLTitle_Level5 ?? "—"}</TableCell>
                  <TableCell className="text-sm" dir="ltr">{row.Debit.toLocaleString()}</TableCell>
                  <TableCell className="text-sm" dir="ltr">{row.TotalBalance.toLocaleString()}</TableCell>
                  <TableCell className="text-sm" dir="ltr">{row.CustomerBalance?.toLocaleString() ?? "—"}</TableCell>
                  <TableCell className="text-sm">{row.FollowUpNumber ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{row.Description ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {data && (data.hasMore || page > 1) && (
        <div className="flex items-center justify-between mt-4 px-1">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            <ChevronRight className="w-4 h-4 ml-1" />
            قبلی
          </Button>
          <span className="text-sm text-muted-foreground">صفحه {page}</span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.hasMore}
          >
            بعدی
            <ChevronLeft className="w-4 h-4 mr-1" />
          </Button>
        </div>
      )}
    </AdminLayout>
  );
};

export default ReturnedCheques;
