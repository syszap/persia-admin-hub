import { Button } from "@/components/ui/button";
import { LucideIcon, Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

const PageHeader = ({ title, description, icon: Icon, actionLabel, onAction }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8 animate-fade-in">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center shadow-sm border border-primary/10">
            <Icon className="w-[22px] h-[22px] text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2 btn-hover rounded-xl px-5 h-11 text-sm font-medium shadow-sm">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;
