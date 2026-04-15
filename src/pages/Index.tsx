import { LayoutDashboard, BarChart3, Menu, Users } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) => (
  <div className="card-surface p-5 flex items-center gap-4 animate-fade-in">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const Index = () => {
  return (
    <AdminLayout>
      <PageHeader title="داشبورد" description="نمای کلی سیستم" icon={LayoutDashboard} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="مجموع کاربران" value="۰" icon={Users} />
        <StatCard title="منوهای فعال" value="۰" icon={Menu} />
        <StatCard title="گزارشات" value="۰" icon={BarChart3} />
        <StatCard title="نقش‌ها" value="۰" icon={LayoutDashboard} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface p-6">
          <h2 className="font-semibold mb-4">آخرین گزارشات</h2>
          <EmptyState
            icon={BarChart3}
            title="هنوز گزارشی ایجاد نشده است"
            description="برای شروع، اولین گزارش خود را بسازید"
            actionLabel="+ ایجاد گزارش جدید"
            onAction={() => {}}
          />
        </div>
        <div className="card-surface p-6">
          <h2 className="font-semibold mb-4">منوهای اخیر</h2>
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
