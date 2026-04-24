import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/10">
      <Icon className="w-7 h-7 text-primary/60" />
    </div>
    <div className="space-y-1.5">
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    {actionLabel && onAction && (
      <Button variant="outline" onClick={onAction} className="rounded-xl mt-1">
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;
