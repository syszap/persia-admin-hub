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
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative mb-8">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-[28px] bg-primary/5 scale-[1.35] animate-pulse-soft" />
        <div className="relative w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary/18 via-primary/10 to-primary/4 flex items-center justify-center animate-float border border-primary/10 shadow-sm">
          <Icon className="w-9 h-9 text-primary" />
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-primary/20 animate-pulse-soft" />
        <div className="absolute -bottom-3 -left-3 w-2.5 h-2.5 rounded-full bg-primary/12 animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>
      
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-8 max-w-sm text-center leading-relaxed">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2 btn-hover rounded-xl px-7 h-11 font-medium shadow-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
