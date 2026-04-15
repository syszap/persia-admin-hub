import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  onToggleSidebar: () => void;
}

const TopBar = ({ onToggleSidebar }: TopBarProps) => {
  return (
    <header
      className="h-[60px] bg-card/80 backdrop-blur-xl border-b border-border/50 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
    >
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden h-9 w-9 rounded-xl">
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="جستجو در سیستم..."
            className="pr-10 h-10 bg-background/50 border-border/40 rounded-xl input-premium text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-muted/80 transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse-soft ring-2 ring-card" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 text-sm h-9 rounded-xl px-2 hover:bg-muted/80 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center border border-primary/15 shadow-sm">
                <span className="text-primary font-bold text-xs">ا</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-52 rounded-xl p-1.5" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <DropdownMenuItem className="rounded-lg h-10 text-sm cursor-pointer justify-end px-3 hover:bg-muted/60 transition-colors">
              پروفایل
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg h-10 text-sm cursor-pointer justify-end px-3 hover:bg-muted/60 transition-colors">
              تنظیمات
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem className="text-destructive rounded-lg h-10 text-sm cursor-pointer justify-end px-3 hover:bg-destructive/8 transition-colors">
              خروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
