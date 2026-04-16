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
import logo from "@/assets/logo.png";

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
          ? "bg-primary text-primary-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      )}
      style={isActive ? { boxShadow: '0 2px 8px hsl(152 55% 42% / 0.3)' } : undefined}
    >
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
          "fixed top-0 right-0 h-full z-50 bg-card flex flex-col transition-all duration-300 ease-out border-l border-border/40",
          "lg:sticky lg:top-0 lg:z-auto lg:h-screen",
          collapsed && !isMobile ? "w-[72px]" : "w-[260px]",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
        style={{ boxShadow: '-4px 0 20px rgba(0,0,0,0.05)' }}
      >
        <div className="h-[60px] flex items-center justify-between px-4 border-b border-border/40">
          {(!collapsed || isMobile) ? (
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src={logo} alt="شیما" className="w-9 h-9 object-contain transition-transform duration-200 group-hover:scale-105" />
              <span className="font-bold text-foreground text-[15px]">پنل مدیریت</span>
            </Link>
          ) : (
            <Link to="/" className="mx-auto">
              <img src={logo} alt="شیما" className="w-8 h-8 object-contain transition-transform duration-200 hover:scale-105" />
            </Link>
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

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {defaultMenuItems.map((item) => (
            <SidebarItem key={item.id} item={item} collapsed={collapsed && !isMobile} onNavigate={handleNavigate} />
          ))}
        </nav>

        <div className="p-3 border-t border-border/40">
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
