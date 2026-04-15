import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Menu as MenuIcon,
  BarChart3,
  Users,
  Shield,
  Settings,
  ChevronDown,
  X,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: string;
  title: string;
  icon: React.ElementType;
  path?: string;
  children?: MenuItem[];
}

const defaultMenuItems: MenuItem[] = [
  { id: "dashboard", title: "داشبورد", icon: LayoutDashboard, path: "/" },
  { id: "menus", title: "مدیریت منوها", icon: MenuIcon, path: "/menus" },
  { id: "reports", title: "مدیریت گزارشات", icon: BarChart3, path: "/reports" },
  { id: "users", title: "مدیریت کاربران", icon: Users, path: "/users" },
  { id: "roles", title: "نقش‌ها و دسترسی‌ها", icon: Shield, path: "/roles" },
  { id: "settings", title: "تنظیمات سیستم", icon: Settings, path: "/settings" },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

const SidebarItem = ({ item, collapsed, onNavigate }: { item: MenuItem; collapsed: boolean; onNavigate?: () => void }) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const isActive = item.path === location.pathname;
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
            "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
        >
          <Icon className="w-5 h-5 shrink-0 transition-all duration-200" />
          {!collapsed && (
            <>
              <span className="flex-1 text-right">{item.title}</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", expanded && "rotate-180")} />
            </>
          )}
        </button>
        {expanded && !collapsed && (
          <div className="mr-8 mt-1 space-y-0.5 animate-fade-in">
            {item.children!.map((child) => (
              <SidebarItem key={child.id} item={child} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path || "/"}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 relative",
        isActive
          ? "bg-primary text-primary-foreground font-medium shadow-md"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-[-3px]"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary-foreground/50 -mr-3" />
      )}
      <Icon className={cn(
        "w-5 h-5 shrink-0 transition-all duration-200",
        !isActive && "group-hover:scale-110 group-hover:text-primary"
      )} />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );
};

const AppSidebar = ({ open, onClose }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleNavigate = useCallback(() => {
    if (isMobile) onClose();
  }, [isMobile, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 h-full z-50 bg-card flex flex-col transition-all duration-300 ease-out border-l border-border/50",
          "lg:sticky lg:top-0 lg:z-auto lg:h-screen",
          collapsed && !isMobile ? "w-[72px]" : "w-[260px]",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
        style={{ boxShadow: "var(--shadow-sidebar)" }}
      >
        {/* Header */}
        <div className="h-[60px] flex items-center justify-between px-4 border-b border-border/50">
          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-sm">م</span>
              </div>
              <span className="font-bold text-foreground text-[15px]">پنل مدیریت</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isMobile) onClose();
              else setCollapsed(!collapsed);
            }}
            className={cn("h-8 w-8 rounded-lg hover:bg-muted/80", collapsed && !isMobile && "mx-auto")}
          >
            {isMobile ? (
              <X className="w-5 h-5" />
            ) : collapsed ? (
              <PanelRightOpen className="w-4 h-4" />
            ) : (
              <PanelRightClose className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {defaultMenuItems.map((item) => (
            <SidebarItem key={item.id} item={item} collapsed={collapsed && !isMobile} onNavigate={handleNavigate} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border/50">
          {(!collapsed || isMobile) ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/8 flex items-center justify-center shrink-0 border border-primary/10">
                <span className="text-primary font-bold text-xs">ا</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">ادمین سیستم</p>
                <p className="text-[11px] text-muted-foreground truncate">admin@example.com</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/8 flex items-center justify-center border border-primary/10">
                <span className="text-primary font-bold text-xs">ا</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
