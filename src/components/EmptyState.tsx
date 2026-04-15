import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      {/* Floating animated icon container */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center animate-float">
          <Icon className="w-9 h-9 text-primary" />
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary/20 animate-pulse-soft" />
        <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-primary/15 animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-8 max-w-xs text-center leading-relaxed">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2 btn-hover rounded-xl px-6 h-11">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
