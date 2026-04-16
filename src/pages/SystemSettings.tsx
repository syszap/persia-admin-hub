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
      <div className="card-surface card-surface-hover p-6 md:p-7 space-y-5">
        <h2 className="section-title">اطلاعات سیستم</h2>
        <div className="space-y-2">
          <Label className="label-subtle">نام سیستم</Label>
          <Input defaultValue="پنل مدیریت" className="input-premium h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label className="label-subtle">آدرس API پایه</Label>
          <Input defaultValue="https://api.example.com" dir="ltr" className="input-premium h-11 rounded-xl" />
        </div>
        <div className="pt-2">
          <Button className="btn-hover rounded-xl px-8 h-11 w-full sm:w-auto">ذخیره تغییرات</Button>
        </div>
      </div>

      <div className="card-surface card-surface-hover p-6 md:p-7">
        <h2 className="section-title mb-5">تنظیمات عمومی</h2>
        <div className="divide-y divide-border/50">
          {[
            { label: "فعال‌سازی اعلان‌ها", desc: "دریافت اعلان‌های سیستمی", on: true },
            { label: "حالت نگهداری", desc: "فعال‌سازی حالت تعمیر و نگهداری", on: false },
            { label: "ثبت لاگ فعالیت‌ها", desc: "ذخیره تمام فعالیت‌های کاربران", on: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-4 group cursor-pointer">
              <div className="space-y-1 pl-4">
                <Label className="text-sm font-medium cursor-pointer">{item.label}</Label>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.on} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const UsersTab = () => (
  <div className="animate-fade-in">
    <div className="card-surface card-surface-hover p-6 md:p-7">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="section-title">لیست کاربران</h2>
        <Button className="btn-hover rounded-xl px-6 h-10">
          <Users className="w-4 h-4 ml-2" />
          افزودن کاربر
        </Button>
      </div>
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm border-2 border-dashed border-border/60 rounded-xl">
        هنوز کاربری اضافه نشده است.
      </div>
    </div>
  </div>
);

const RolesTab = () => (
  <div className="animate-fade-in">
    <div className="card-surface card-surface-hover p-6 md:p-7">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="section-title">ماتریس دسترسی‌ها</h2>
        <Button className="btn-hover rounded-xl px-6 h-10">
          <Shield className="w-4 h-4 ml-2" />
          افزودن نقش
        </Button>
      </div>
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm border-2 border-dashed border-border/60 rounded-xl">
        هنوز نقشی تعریف نشده است.
      </div>
    </div>
  </div>
);

const ReportsTab = () => (
  <div className="animate-fade-in">
    <div className="card-surface card-surface-hover p-6 md:p-7">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="section-title">لیست گزارشات</h2>
        <Button className="btn-hover rounded-xl px-6 h-10">
          <BarChart3 className="w-4 h-4 ml-2" />
          ساخت گزارش
        </Button>
      </div>
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm border-2 border-dashed border-border/60 rounded-xl">
        هنوز گزارشی ساخته نشده است.
      </div>
    </div>
  </div>
);

const tabs = [
  { value: "general", icon: Settings, label: "تنظیمات عمومی" },
  { value: "users", icon: Users, label: "مدیریت کاربران" },
  { value: "roles", icon: Shield, label: "نقش‌ها و دسترسی‌ها" },
  { value: "reports", icon: BarChart3, label: "مدیریت گزارشات" },
];

const SystemSettings = () => {
  return (
    <AdminLayout>
      <PageHeader title="تنظیمات سیستم" description="مدیریت و پیکربندی مرکزی سیستم" icon={Settings} />

      <Tabs defaultValue="general" dir="rtl" className="w-full">
        <div className="bg-muted/50 rounded-2xl p-1.5 mb-8 border border-border/40">
          <TabsList className="w-full flex bg-transparent h-auto gap-1 p-0 flex-wrap sm:flex-nowrap">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground bg-transparent transition-all duration-200 hover:text-foreground/80 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)]"
              >
                <tab.icon className="w-4 h-4 ml-2 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="general"><GeneralTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="roles"><RolesTab /></TabsContent>
        <TabsContent value="reports"><ReportsTab /></TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default SystemSettings;
