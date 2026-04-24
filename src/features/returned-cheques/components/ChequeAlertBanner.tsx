import { AlertTriangle } from 'lucide-react';
import type { SummaryAlert } from '../types';

interface ChequeAlertBannerProps {
  alerts: SummaryAlert[];
}

const ChequeAlertBanner = ({ alerts }: ChequeAlertBannerProps) => {
  if (!alerts.length) return null;
  return (
    <div className="mb-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
      <div className="space-y-1">
        {alerts.map((alert, i) => (
          <p key={i} className="text-sm text-destructive">
            {alert.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ChequeAlertBanner;
