import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber } from '@/shared/lib/formatters';
import { returnedChequesService } from '../services/returned-cheques.service';
import type { CustomerRow } from '../types';

const riskMeta: Record<CustomerRow['riskLevel'], { label: string; className: string }> = {
  high: { label: 'پرریسک', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  medium: { label: 'متوسط', className: 'bg-warning/10 text-warning border-warning/20' },
  low: { label: 'کم‌ریسک', className: 'bg-primary/10 text-primary border-primary/20' },
};

const ReturnedChequesCustomersPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['returned-cheques-by-customer'],
    queryFn: returnedChequesService.getByCustomer,
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
        {data?.length === 0 && (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            هیچ داده‌ای یافت نشد.
          </div>
        )}
        {data && data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {['نام مشتری', 'تعداد چک', 'مجموع مبلغ', 'سررسید گذشته', 'مبلغ سررسید گذشته', 'سطح ریسک', 'عملیات'].map(
                  (h) => (
                    <TableHead key={h} className="text-xs font-medium text-muted-foreground">
                      {h}
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => {
                const risk = riskMeta[row.riskLevel];
                return (
                  <TableRow key={row.customerName} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-sm font-medium">{row.customerName}</TableCell>
                    <TableCell className="text-sm" dir="ltr">{formatNumber(row.totalCheques)}</TableCell>
                    <TableCell className="text-sm" dir="ltr">{formatNumber(row.totalAmount)}</TableCell>
                    <TableCell className="text-sm" dir="ltr">{formatNumber(row.overdueCount)}</TableCell>
                    <TableCell className="text-sm" dir="ltr">{formatNumber(row.overdueAmount)}</TableCell>
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

export default ReturnedChequesCustomersPage;
