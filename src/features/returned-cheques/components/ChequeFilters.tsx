import { memo, useState } from 'react';
import { Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { ChequesFilters } from '../types';

interface ChequeFiltersProps {
  filters: ChequesFilters;
  onApply: (filters: ChequesFilters) => void;
  onExport: () => void;
}

const ChequeFilters = memo(({ filters, onApply, onExport }: ChequeFiltersProps) => {
  const [local, setLocal] = useState(filters);

  const apply = () => onApply(local);

  return (
    <div className="card-surface mb-6 p-5">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] space-y-2">
          <Label className="label-subtle">جستجو</Label>
          <Input
            placeholder="جستجو مشتری یا شماره چک"
            value={local.search}
            onChange={(e) => setLocal((f) => ({ ...f, search: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            className="input-premium h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="label-subtle">از تاریخ سررسید</Label>
          <Input
            type="date"
            value={local.fromDate}
            onChange={(e) => setLocal((f) => ({ ...f, fromDate: e.target.value }))}
            className="input-premium h-10"
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label className="label-subtle">تا تاریخ سررسید</Label>
          <Input
            type="date"
            value={local.toDate}
            onChange={(e) => setLocal((f) => ({ ...f, toDate: e.target.value }))}
            className="input-premium h-10"
            dir="ltr"
          />
        </div>
        <Button onClick={apply} className="btn-hover rounded-xl h-10">
          اعمال فیلتر
        </Button>
        <Button variant="outline" onClick={onExport} className="rounded-xl h-10 gap-2">
          <Download className="w-4 h-4" />
          خروجی اکسل
        </Button>
      </div>
    </div>
  );
});
ChequeFilters.displayName = 'ChequeFilters';

export default ChequeFilters;
