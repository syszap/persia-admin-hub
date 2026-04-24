import { memo } from 'react';
import { FileText, BarChart3, Clock, TrendingDown } from 'lucide-react';
import { formatNumber } from '@/shared/lib/formatters';
import type { ChequesSummary } from '../types';

interface ChequeSummaryCardsProps {
  summary: ChequesSummary;
}

const ChequeSummaryCards = memo(({ summary }: ChequeSummaryCardsProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div className="card-surface flex items-center gap-4 p-5">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">مجموع چک‌های برگشتی</p>
        <p className="text-xl font-bold text-foreground">{formatNumber(summary.totalCount)}</p>
      </div>
    </div>

    <div className="card-surface flex items-center gap-4 p-5">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <BarChart3 className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">مجموع مبلغ چک‌ها</p>
        <p className="text-xl font-bold text-foreground">{formatNumber(summary.totalAmount)}</p>
      </div>
    </div>

    <div className="card-surface flex items-center gap-4 p-5">
      <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
        <Clock className="w-5 h-5 text-destructive" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">چک‌های سررسید گذشته</p>
        <p className="text-xl font-bold text-destructive">{formatNumber(summary.overdueCount)}</p>
      </div>
    </div>

    <div className="card-surface flex items-center gap-4 p-5">
      <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
        <TrendingDown className="w-5 h-5 text-destructive" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">مبلغ سررسید گذشته</p>
        <p className="text-xl font-bold text-destructive">{formatNumber(summary.overdueAmount)}</p>
      </div>
    </div>
  </div>
));
ChequeSummaryCards.displayName = 'ChequeSummaryCards';

export default ChequeSummaryCards;
