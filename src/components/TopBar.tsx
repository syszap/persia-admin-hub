import { Search, Bell, ChevronDown, Menu, Moon, Sun } from "lucide-react";
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
    <header className="h-[60px] bg-card/80 backdrop-blur-md border-b flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
      {/* Right: sidebar toggle (mobile) + breadcrumb area */}
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden h-9 w-9 rounded-lg">
        <Menu className="w-5 h-5" />
      </Button>

      {/* Center: Search */}
      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="جستجو در سیستم..."
            className="pr-10 h-10 bg-background/60 border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Left: Actions */}
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse-soft" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 text-sm h-9 rounded-lg px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                <span className="text-primary font-bold text-xs">ا</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 rounded-xl">
            <DropdownMenuItem className="rounded-lg">پروفایل</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">تنظیمات</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive rounded-lg">خروج</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
