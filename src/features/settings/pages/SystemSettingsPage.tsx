import { Settings, Users, Shield, BarChart3, Save } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const TOGGLES = [
  { label: 'فعال‌سازی اعلان‌ها', desc: 'دریافت اعلان‌های سیستمی در داشبورد', on: true },
  { label: 'حالت نگهداری', desc: 'فعال‌سازی حالت تعمیر و نگهداری برای کاربران', on: false },
  { label: 'ثبت لاگ فعالیت‌ها', desc: 'ذخیره تمام فعالیت‌های کاربران در سیستم', on: true },
];

const TABS = [
  { value: 'general', icon: Settings, label: 'تنظیمات عمومی' },
  { value: 'users', icon: Users, label: 'مدیریت کاربران' },
  { value: 'roles', icon: Shield, label: 'نقش‌ها و دسترسی‌ها' },
  { value: 'reports', icon: BarChart3, label: 'مدیریت گزارشات' },
];

const EmptyTabContent = ({ title, ctaLabel, ctaIcon: Icon, emptyText }: {
  title: string; ctaLabel: string; ctaIcon: typeof Users; emptyText: string;
}) => (
  <div className="animate-fade-in pb-12">
    <div className="card-surface card-surface-hover p-5 md:p-7">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="section-title">{title}</h2>
        <Button className="btn-hover rounded-xl px-6 h-10">
          <Icon className="w-4 h-4 ml-2" />{ctaLabel}
        </Button>
      </div>
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm border-2 border-dashed border-border/60 rounded-xl bg-muted/20">
        {emptyText}
      </div>
    </div>
  </div>
);

const SystemSettingsPage = () => (
  <AdminLayout>
    <div className="max-w-[1400px] mx-auto w-full">
      <PageHeader title="تنظیمات سیستم" description="مدیریت و پیکربندی مرکزی سیستم" icon={Settings} />

      <Tabs defaultValue="general" dir="rtl" className="w-full">
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-1.5 mb-8 border border-border/60" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <TabsList className="w-full flex bg-transparent h-auto gap-1 p-0 flex-wrap sm:flex-nowrap overflow-x-auto">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 min-w-[140px] rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground bg-transparent transition-all duration-200 hover:text-foreground hover:bg-muted/60 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              >
                <tab.icon className="w-4 h-4 ml-2 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="general">
          <div className="space-y-6 animate-fade-in pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
              <div className="card-surface card-surface-hover p-5 md:p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="section-title">اطلاعات سیستم</h2>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted/70 px-2.5 py-1 rounded-full">پایه</span>
                </div>
                <div className="space-y-2">
                  <Label className="label-subtle">نام سیستم</Label>
                  <Input defaultValue="پنل مدیریت" className="input-premium h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="label-subtle">آدرس API پایه</Label>
                  <Input defaultValue="https://api.example.com" dir="ltr" className="input-premium h-11 rounded-xl" />
                </div>
              </div>
              <div className="card-surface card-surface-hover p-5 md:p-7">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="section-title">تنظیمات عمومی</h2>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted/70 px-2.5 py-1 rounded-full">رفتار</span>
                </div>
                <div className="space-y-1">
                  {TOGGLES.map((item, idx) => (
                    <div key={item.label} className={`flex items-start justify-between gap-4 py-5 ${idx !== TOGGLES.length - 1 ? 'border-b border-border/50' : ''}`}>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <Label className="text-sm font-semibold text-foreground cursor-pointer block">{item.label}</Label>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={item.on} className="mt-0.5 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <EmptyTabContent title="لیست کاربران" ctaLabel="افزودن کاربر" ctaIcon={Users} emptyText="هنوز کاربری اضافه نشده است." />
        </TabsContent>
        <TabsContent value="roles">
          <EmptyTabContent title="ماتریس دسترسی‌ها" ctaLabel="افزودن نقش" ctaIcon={Shield} emptyText="هنوز نقشی تعریف نشده است." />
        </TabsContent>
        <TabsContent value="reports">
          <EmptyTabContent title="لیست گزارشات" ctaLabel="ساخت گزارش" ctaIcon={BarChart3} emptyText="هنوز گزارشی ساخته نشده است." />
        </TabsContent>
      </Tabs>
    </div>

    <div className="sticky bottom-0 inset-x-0 -mx-4 md:-mx-6 lg:-mx-8 -mb-4 md:-mb-6 lg:-mb-8 mt-8 bg-card/95 backdrop-blur-md border-t border-border/60 z-30" style={{ boxShadow: '0 -8px 30px rgba(0,0,0,0.06)' }}>
      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground hidden sm:block">تغییرات شما به‌صورت خودکار ذخیره نمی‌شود.</p>
        <div className="flex items-center gap-2 mr-auto">
          <Button variant="ghost" className="rounded-xl h-10 px-5 text-sm">انصراف</Button>
          <Button className="btn-hover rounded-xl h-10 px-6 text-sm font-semibold">
            <Save className="w-4 h-4 ml-2" />ذخیره تغییرات
          </Button>
        </div>
      </div>
    </div>
  </AdminLayout>
);

export default SystemSettingsPage;
