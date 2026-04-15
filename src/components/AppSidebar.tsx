import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Menu as MenuIcon,
  BarChart3,
  Users,
  Shield,
  Settings,
  ChevronDown,
  ChevronLeft,
  X,
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

const SidebarItem = ({ item, collapsed }: { item: MenuItem; collapsed: boolean }) => {
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
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
            "text-sidebar-foreground hover:bg-sidebar-accent"
          )}
        >
          <Icon className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-right">{item.title}</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
            </>
          )}
        </button>
        {expanded && !collapsed && (
          <div className="mr-8 mt-1 space-y-1">
            {item.children!.map((child) => (
              <SidebarItem key={child.id} item={child} collapsed={collapsed} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path || "/"}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );
};

const AppSidebar = ({ open, onClose }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed top-0 right-0 h-full z-50 bg-card border-l flex flex-col transition-all duration-300",
          "lg:sticky lg:top-0 lg:z-auto",
          collapsed ? "w-[68px]" : "w-64",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="h-14 flex items-center justify-between px-3 border-b">
          {!collapsed && <span className="font-bold text-primary">منوی اصلی</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
              else setCollapsed(!collapsed);
            }}
            className="mr-auto"
          >
            {window.innerWidth < 1024 ? <X className="w-5 h-5" /> : <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />}
          </Button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {defaultMenuItems.map((item) => (
            <SidebarItem key={item.id} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AppSidebar;
