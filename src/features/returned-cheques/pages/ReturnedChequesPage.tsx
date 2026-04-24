import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import ChequeAlertBanner from '../components/ChequeAlertBanner';
import ChequeSummaryCards from '../components/ChequeSummaryCards';
import ChequeFilters from '../components/ChequeFilters';
import ChequeTable from '../components/ChequeTable';
import { useReturnedCheques } from '../hooks/useReturnedCheques';
import { useReturnedChequesSummary } from '../hooks/useReturnedChequesSummary';
import { returnedChequesService } from '../services/returned-cheques.service';
import type { ChequesFilters } from '../types';

const ReturnedChequesPage = () => {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ChequesFilters>({
    search: searchParams.get('search') ?? '',
    fromDate: '',
    toDate: '',
  });

  const { data: summary } = useReturnedChequesSummary();
  const { data, isLoading, isError } = useReturnedCheques(page, filters);

  const handleApplyFilters = (next: ChequesFilters) => {
    setPage(1);
    setFilters(next);
  };

  const handleExport = async () => {
    const blob = await returnedChequesService.exportExcel(filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'returned-cheques.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="چک برگشتی"
        description="مشاهده چک‌های برگشتی پرداخت نشده"
        icon={BarChart3}
      />

      {summary && <ChequeAlertBanner alerts={summary.alerts} />}
      {summary && <ChequeSummaryCards summary={summary} />}

      <ChequeFilters filters={filters} onApply={handleApplyFilters} onExport={handleExport} />

      <ChequeTable
        data={data}
        isLoading={isLoading}
        isError={isError}
        page={page}
        onPageChange={setPage}
      />
    </AdminLayout>
  );
};

export default ReturnedChequesPage;
