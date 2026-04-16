import { Settings, Users, Shield, BarChart3 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const GeneralTab = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card-surface p-6 md:p-7 space-y-5">
        <h2 className="section-title">اطلاعات سیستم</h2>
        <div className="space-y-2">
          <Label className="label-subtle">نام سیستم</Label>
          <Input defaultValue="پنل مدیریت" className="input-premium h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label className="label-subtle">آدرس API پایه</Label>
          <Input defaultValue="https://api.example.com" dir="ltr" className="input-premium h-11 rounded-xl" />
        </div>
      </div>

      <div className="card-surface p-6 md:p-7 space-y-2">
        <h2 className="section-title mb-4">تنظیمات عمومی</h2>
        {[
          { label: "فعال‌سازی اعلان‌ها", desc: "دریافت اعلان‌های سیستمی", on: true },
          { label: "حالت نگهداری", desc: "فعال‌سازی حالت تعمیر و نگهداری", on: false },
          { label: "ثبت لاگ فعالیت‌ها", desc: "ذخیره تمام فعالیت‌های کاربران", on: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-muted/30 transition-colors">
            <div>
              <Label className="text-sm font-medium cursor-pointer">{item.label}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <Switch defaultChecked={item.on} />
          </div>
        ))}
      </div>
    </div>

    <div className="flex justify-start">
      <Button className="btn-hover rounded-xl px-8 h-11 shadow-sm">ذخیره تغییرات</Button>
    </div>
  </div>
);

const UsersTab = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="card-surface p-6 md:p-7">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="section-title">لیست کاربران</h2>
        <Button className="btn-hover rounded-xl px-6 h-10 shadow-sm">
          <Users className="w-4 h-4 ml-2" />
          افزودن کاربر
        </Button>
      </div>
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        هنوز کاربری اضافه نشده است. از دکمه بالا برای افزودن کاربر استفاده کنید.
      </div>
    </div>
  </div>
);

const RolesTab = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="card-surface p-6 md:p-7">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="section-title">ماتریس دسترسی‌ها</h2>
        <Button className="btn-hover rounded-xl px-6 h-10 shadow-sm">
          <Shield className="w-4 h-4 ml-2" />
          افزودن نقش
        </Button>
      </div>
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        هنوز نقشی تعریف نشده است. از دکمه بالا برای تعریف نقش جدید استفاده کنید.
      </div>
    </div>
  </div>
);

const ReportsTab = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="card-surface p-6 md:p-7">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="section-title">لیست گزارشات</h2>
        <Button className="btn-hover rounded-xl px-6 h-10 shadow-sm">
          <BarChart3 className="w-4 h-4 ml-2" />
          ساخت گزارش
        </Button>
      </div>
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        هنوز گزارشی ساخته نشده است. از دکمه بالا برای ایجاد گزارش استفاده کنید.
      </div>
    </div>
  </div>
);

const SystemSettings = () => {
  return (
    <AdminLayout>
      <PageHeader title="تنظیمات سیستم" description="مدیریت و پیکربندی مرکزی سیستم" icon={Settings} />

      <Tabs defaultValue="general" dir="rtl" className="w-full">
        <TabsList className="w-full sm:w-auto flex overflow-x-auto bg-muted/50 rounded-xl p-1 mb-6 h-auto flex-wrap sm:flex-nowrap gap-1">
          <TabsTrigger
            value="general"
            className="flex-1 sm:flex-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <Settings className="w-4 h-4 ml-2" />
            تنظیمات عمومی
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex-1 sm:flex-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <Users className="w-4 h-4 ml-2" />
            مدیریت کاربران
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="flex-1 sm:flex-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <Shield className="w-4 h-4 ml-2" />
            نقش‌ها و دسترسی‌ها
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="flex-1 sm:flex-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <BarChart3 className="w-4 h-4 ml-2" />
            مدیریت گزارشات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general"><GeneralTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="roles"><RolesTab /></TabsContent>
        <TabsContent value="reports"><ReportsTab /></TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default SystemSettings;
