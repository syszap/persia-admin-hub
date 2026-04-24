import { memo } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber, formatDate, isOverdue } from '@/shared/lib/formatters';
import type { ChequesResponse } from '../types';

interface ChequeTableProps {
  data: ChequesResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

const ChequeTable = memo(({ data, isLoading, isError, page, onPageChange }: ChequeTableProps) => (
  <>
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
              {[
                'شماره سند', 'اعلامیه', 'نام بانک', 'شماره چک', 'سررسید',
                'تاریخ سند', 'سطح ۴', 'سطح ۵', 'مبلغ', 'مانده کل',
                'مانده مشتری', 'شماره پیگیری', 'شرح',
              ].map((h) => (
                <TableHead key={h} className="text-xs font-medium text-muted-foreground">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((row, idx) => (
              <TableRow
                key={`${row.VoucherRef}-${idx}`}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="text-sm font-medium">{row.VoucherNumber}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.elamiye ?? '—'}</TableCell>
                <TableCell className="text-sm">{row.BankName ?? '—'}</TableCell>
                <TableCell className="text-sm" dir="ltr">{row.ChequeNumber ?? '—'}</TableCell>
                <TableCell className="text-sm">
                  {row.DueDate ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span dir="ltr">{formatDate(row.DueDate)}</span>
                      {isOverdue(row.DueDate) && (
                        <Badge
                          variant="outline"
                          className="text-destructive border-destructive/20 bg-destructive/10 text-[10px] px-1.5 py-0 shrink-0"
                        >
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
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {row.Description ?? '—'}
                </TableCell>
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
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronRight className="w-4 h-4 ml-1" />قبلی
        </Button>
        <span className="text-sm text-muted-foreground">صفحه {page}</span>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => onPageChange(page + 1)}
          disabled={!data.hasMore}
        >
          بعدی<ChevronLeft className="w-4 h-4 mr-1" />
        </Button>
      </div>
    )}
  </>
));
ChequeTable.displayName = 'ChequeTable';

export default ChequeTable;
