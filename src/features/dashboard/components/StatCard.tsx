import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  delay?: string;
}

const StatCard = memo(({ title, value, icon: Icon, delay }: StatCardProps) => (
  <div
    className="card-surface card-surface-hover p-6 flex items-center gap-4 animate-fade-in"
    style={{ animationDelay: delay }}
  >
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/18 via-primary/10 to-primary/4 flex items-center justify-center shrink-0 border border-primary/8">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

export default StatCard;
