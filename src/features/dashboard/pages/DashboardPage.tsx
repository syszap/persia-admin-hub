import { LayoutDashboard, BarChart3, Menu, Users } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import EmptyState from '@/shared/components/EmptyState';
import PageHeader from '@/shared/components/PageHeader';
import StatCard from '../components/StatCard';

const DashboardPage = () => (
  <AdminLayout>
    <PageHeader title="داشبورد" description="نمای کلی سیستم مدیریت" icon={LayoutDashboard} />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <StatCard title="مجموع کاربران" value="۰" icon={Users} delay="0ms" />
      <StatCard title="منوهای فعال" value="۰" icon={Menu} delay="60ms" />
      <StatCard title="گزارشات" value="۰" icon={BarChart3} delay="120ms" />
      <StatCard title="نقش‌ها" value="۰" icon={LayoutDashboard} delay="180ms" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card-surface p-7 animate-fade-in" style={{ animationDelay: '240ms' }}>
        <h2 className="section-title mb-4">آخرین گزارشات</h2>
        <EmptyState
          icon={BarChart3}
          title="هنوز گزارشی ایجاد نشده است"
          description="برای شروع، اولین گزارش خود را بسازید"
          actionLabel="+ ایجاد گزارش جدید"
          onAction={() => {}}
        />
      </div>
      <div className="card-surface p-7 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h2 className="section-title mb-4">منوهای اخیر</h2>
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

export default DashboardPage;
