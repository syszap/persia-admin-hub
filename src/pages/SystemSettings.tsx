import { Settings } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const SystemSettings = () => {
  return (
    <AdminLayout>
      <PageHeader title="تنظیمات سیستم" description="پیکربندی عمومی سیستم" icon={Settings} />

      <div className="max-w-2xl space-y-6">
        <div className="card-surface p-7 space-y-6 animate-fade-in">
          <h2 className="section-title">اطلاعات سیستم</h2>
          <div className="space-y-3">
            <Label className="label-subtle">نام سیستم</Label>
            <Input defaultValue="پنل مدیریت" className="input-premium h-11 rounded-xl" />
          </div>
          <div className="space-y-3">
            <Label className="label-subtle">آدرس API پایه</Label>
            <Input defaultValue="https://api.example.com" dir="ltr" className="input-premium h-11 rounded-xl" />
          </div>
        </div>

        <div className="card-surface p-7 space-y-5 animate-fade-in" style={{ animationDelay: "80ms" }}>
          <h2 className="section-title">تنظیمات عمومی</h2>
          <div className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-muted/30 transition-colors">
            <div>
              <Label className="text-sm font-medium">فعال‌سازی اعلان‌ها</Label>
              <p className="text-xs text-muted-foreground mt-0.5">دریافت اعلان‌های سیستمی</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-muted/30 transition-colors">
            <div>
              <Label className="text-sm font-medium">حالت نگهداری</Label>
              <p className="text-xs text-muted-foreground mt-0.5">فعال‌سازی حالت تعمیر و نگهداری</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-muted/30 transition-colors">
            <div>
              <Label className="text-sm font-medium">ثبت لاگ فعالیت‌ها</Label>
              <p className="text-xs text-muted-foreground mt-0.5">ذخیره تمام فعالیت‌های کاربران</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="flex justify-start pt-2">
          <Button className="btn-hover rounded-xl px-8 h-11 shadow-sm">ذخیره تغییرات</Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemSettings;
