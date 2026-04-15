import { LayoutDashboard, BarChart3, Menu, Users, TrendingUp, Activity } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

const StatCard = ({ title, value, icon: Icon, delay }: { title: string; value: string; icon: React.ElementType; delay?: string }) => (
  <div
    className="card-surface card-surface-hover p-6 flex items-center gap-4 animate-fade-in"
    style={{ animationDelay: delay }}
  >
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground mb-0.5">{title}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const Index = () => {
  return (
    <AdminLayout>
      <PageHeader title="داشبورد" description="نمای کلی سیستم مدیریت" icon={LayoutDashboard} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="مجموع کاربران" value="۰" icon={Users} delay="0ms" />
        <StatCard title="منوهای فعال" value="۰" icon={Menu} delay="50ms" />
        <StatCard title="گزارشات" value="۰" icon={BarChart3} delay="100ms" />
        <StatCard title="نقش‌ها" value="۰" icon={LayoutDashboard} delay="150ms" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="font-semibold text-base mb-2">آخرین گزارشات</h2>
          <EmptyState
            icon={BarChart3}
            title="هنوز گزارشی ایجاد نشده است"
            description="برای شروع، اولین گزارش خود را بسازید"
            actionLabel="+ ایجاد گزارش جدید"
            onAction={() => {}}
          />
        </div>
        <div className="card-surface p-6 animate-fade-in" style={{ animationDelay: "250ms" }}>
          <h2 className="font-semibold text-base mb-2">منوهای اخیر</h2>
          <EmptyState
            icon={Menu}
            title="هیچ منویی تعریف نشده است"
            description="منوهای سیستم را از بخش مدیریت اضافه کنید"
            actionLabel="+ افزودن منو"
            onAction={() => {}}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Index;
