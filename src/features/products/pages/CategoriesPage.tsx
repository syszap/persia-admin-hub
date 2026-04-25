import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCategories, useCreateCategory } from '../hooks/useProducts';
import type { Category } from '../types';

export default function CategoriesPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', nameFa: '', slug: '', description: '' });

  const { data, isLoading } = useCategories();
  const createCategory = useCreateCategory();

  const categories: Category[] = data?.data ?? [];

  function handleSubmit() {
    createCategory.mutate(form, { onSuccess: () => { setOpen(false); setForm({ name: '', nameFa: '', slug: '', description: '' }); } });
  }

  return (
    <AdminLayout>
      <PageHeader title="دسته‌بندی محصولات" description="مدیریت دسته‌بندی‌های محصولات" icon={Package} />

      <div className="card-surface p-6">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 ml-1" />دسته‌بندی جدید</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نام فارسی</TableHead>
              <TableHead className="text-right">نام انگلیسی</TableHead>
              <TableHead className="text-right">اسلاگ</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">هیچ دسته‌بندی یافت نشد</TableCell></TableRow>
            ) : categories.map((c: Category) => (
              <TableRow key={c.id}>
                <TableCell>{c.name_fa}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{c.slug}</TableCell>
                <TableCell>{c.is_active ? 'فعال' : 'غیرفعال'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>دسته‌بندی جدید</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">نام فارسی</label><Input value={form.nameFa} onChange={(e) => setForm({ ...form, nameFa: e.target.value })} /></div>
            <div><label className="text-sm font-medium">نام انگلیسی</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="text-sm font-medium">اسلاگ (فقط حروف انگلیسی و خط تیره)</label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="example-slug" /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
            <Button onClick={handleSubmit} disabled={!form.nameFa || !form.name || !form.slug || createCategory.isPending}>
              {createCategory.isPending ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
