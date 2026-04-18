import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CustomerRow {
  customerName: string;
  totalCheques: number;
  totalAmount: number;
  overdueCount: number;
  overdueAmount: number;
  riskLevel: 'high' | 'medium' | 'low';
}

const faNum = new Intl.NumberFormat('fa-IR');
const fmt   = (n: number) => faNum.format(n);

const riskMeta: Record<CustomerRow['riskLevel'], { label: string; className: string }> = {
  high:   { label: 'پرریسک',    className: 'bg-destructive/10 text-destructive border-destructive/20' },
  medium: { label: 'متوسط',     className: 'bg-warning/10 text-warning border-warning/20' },
  low:    { label: 'کم‌ریسک',   className: 'bg-primary/10 text-primary border-primary/20' },
};

const ReturnedChequesCustomers = () => {
  const { data, isLoading, isError } = useQuery<CustomerRow[]>({
    queryKey: ['returned-cheques-by-customer'],
    queryFn: () =>
      fetch('/api/returned-cheques/by-customer').then((r) => {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }),
    staleTime: 60_000,
  });

  return (
    <AdminLayout>
      <PageHeader
        title="مشتریان چک برگشتی"
        description="گروه‌بندی چک‌های برگشتی بر اساس مشتری"
        icon={Users}
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
        {data && data.length === 0 && (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            هیچ داده‌ای یافت نشد.
          </div>
        )}
        {data && data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground">نام مشتری</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">تعداد چک</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">مجموع مبلغ</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">سررسید گذشته</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">مبلغ سررسید گذشته</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">سطح ریسک</TableHead>
                <TableHead className="w-28 text-xs font-medium text-muted-foreground">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => {
                const risk = riskMeta[row.riskLevel];
                return (
                  <TableRow key={row.customerName} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-sm font-medium">{row.customerName}</TableCell>
                    <TableCell className="text-sm" dir="ltr">{fmt(row.totalCheques)}</TableCell>
                    <TableCell className="text-sm" dir="ltr">{fmt(row.totalAmount)}</TableCell>
                    <TableCell className="text-sm" dir="ltr">{fmt(row.overdueCount)}</TableCell>
                    <TableCell className="text-sm" dir="ltr">{fmt(row.overdueAmount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${risk.className} text-xs font-medium`}>
                        {risk.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs" asChild>
                        <Link to={`/returned-cheques?search=${encodeURIComponent(row.customerName)}`}>
                          مشاهده چک‌ها
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReturnedChequesCustomers;
