import { useState } from "react";
import { BarChart3, Pencil, Trash2, RefreshCw, Table, PieChart, LayoutGrid } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Report {
  id: string;
  title: string;
  type: "table" | "chart" | "kpi" | "widget";
  dataSource: string;
}

const typeLabels: Record<string, { label: string; icon: React.ElementType }> = {
  table: { label: "جدول", icon: Table },
  chart: { label: "نمودار", icon: PieChart },
  kpi: { label: "KPI", icon: BarChart3 },
  widget: { label: "ویجت", icon: LayoutGrid },
};

const ReportBuilder = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [form, setForm] = useState({ title: "", type: "table" as Report["type"], dataSource: "" });

  const handleSave = () => {
    if (!form.title) return;
    const report: Report = {
      id: editingReport?.id || crypto.randomUUID(),
      ...form,
    };
    if (editingReport) {
      setReports((prev) => prev.map((r) => (r.id === report.id ? report : r)));
    } else {
      setReports((prev) => [...prev, report]);
    }
    setDialogOpen(false);
    setEditingReport(null);
    setForm({ title: "", type: "table", dataSource: "" });
  };

  const openCreate = () => {
    setEditingReport(null);
    setForm({ title: "", type: "table", dataSource: "" });
    setDialogOpen(true);
  };

  const openEdit = (r: Report) => {
    setEditingReport(r);
    setForm({ title: r.title, type: r.type, dataSource: r.dataSource });
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="مدیریت گزارشات"
        description="گزارشات پویا ایجاد و مدیریت کنید"
        icon={BarChart3}
        actionLabel="ایجاد گزارش جدید"
        onAction={openCreate}
      />

      {reports.length === 0 ? (
        <div className="card-surface">
          <EmptyState
            icon={BarChart3}
            title="هنوز گزارشی ایجاد نشده است"
            description="انواع گزارشات شامل جدول، نمودار و KPI را بسازید"
            actionLabel="+ ایجاد گزارش جدید"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => {
            const typeInfo = typeLabels[report.type];
            const TypeIcon = typeInfo.icon;
            return (
              <div key={report.id} className="card-surface card-surface-hover p-6 animate-fade-in">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/18 to-primary/5 flex items-center justify-center border border-primary/8">
                      <TypeIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{report.title}</h3>
                      <span className="text-xs text-muted-foreground">{typeInfo.label}</span>
                    </div>
                  </div>
                </div>

                {report.dataSource && (
                  <p className="text-xs text-muted-foreground mb-4 font-mono bg-muted/40 px-3 py-1.5 rounded-lg" dir="ltr">
                    {report.dataSource}
                  </p>
                )}

                <div className="h-24 rounded-xl bg-muted/30 border border-border/30 flex items-center justify-center mb-5">
                  <span className="text-xs text-muted-foreground">پیش‌نمایش گزارش</span>
                </div>

                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><RefreshCw className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(report)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => setReports((prev) => prev.filter((r) => r.id !== report.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">{editingReport ? "ویرایش گزارش" : "ایجاد گزارش جدید"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-3">
              <Label className="label-subtle">عنوان گزارش</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان" className="input-premium h-11 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Label className="label-subtle">نوع گزارش</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Report["type"] })}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">جدول</SelectItem>
                  <SelectItem value="chart">نمودار</SelectItem>
                  <SelectItem value="kpi">KPI</SelectItem>
                  <SelectItem value="widget">ویجت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="label-subtle">منبع داده (اختیاری)</Label>
              <Input value={form.dataSource} onChange={(e) => setForm({ ...form, dataSource: e.target.value })} placeholder="api/endpoint" dir="ltr" className="input-premium h-11 rounded-xl" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">انصراف</Button>
            <Button onClick={handleSave} className="btn-hover rounded-xl">ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ReportBuilder;
