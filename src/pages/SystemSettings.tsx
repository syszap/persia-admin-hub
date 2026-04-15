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
        <div className="card-surface p-6 space-y-4">
          <h2 className="font-semibold">اطلاعات سیستم</h2>
          <div className="space-y-2">
            <Label>نام سیستم</Label>
            <Input defaultValue="پنل مدیریت" />
          </div>
          <div className="space-y-2">
            <Label>آدرس API پایه</Label>
            <Input defaultValue="https://api.example.com" dir="ltr" />
          </div>
        </div>

        <div className="card-surface p-6 space-y-4">
          <h2 className="font-semibold">تنظیمات عمومی</h2>
          <div className="flex items-center justify-between">
            <Label>فعال‌سازی اعلان‌ها</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>حالت نگهداری</Label>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <Label>ثبت لاگ فعالیت‌ها</Label>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="flex justify-end">
          <Button>ذخیره تغییرات</Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemSettings;
