import { useState } from 'react';
import { ShoppingBag, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useProducts, useCategories, useCreateProduct, useDeleteProduct } from '../hooks/useProducts';
import type { Product, ProductStatus } from '../types';
import { PRODUCT_STATUS_LABELS } from '../types';
import { useAuthStore } from '@/features/auth/store/auth.store';

const STATUS_VARIANTS: Record<ProductStatus, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  inactive: 'secondary',
  discontinued: 'destructive',
};

const formSchema = z.object({
  code: z.string().min(1, 'کد الزامی است'),
  name: z.string().min(1),
  nameFa: z.string().min(1, 'نام فارسی الزامی است'),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  price: z.coerce.number().nonnegative(),
  costPrice: z.coerce.number().nonnegative(),
  unit: z.string().min(1),
  minStockLevel: z.coerce.number().int().nonnegative(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const { data, isLoading, refetch } = useProducts({ search, categoryId: categoryFilter || undefined });
  const { data: catData } = useCategories();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const { hasPermission } = useAuthStore();

  const products: Product[] = data?.data ?? [];
  const categories = catData?.data ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: '', name: '', nameFa: '', categoryId: '', price: 0, costPrice: 0, unit: 'عدد', minStockLevel: 0 },
  });

  function onSubmit(values: FormValues) {
    createProduct.mutate(values, { onSuccess: () => { setOpen(false); form.reset(); } });
  }

  return (
    <AdminLayout>
      <PageHeader title="محصولات" description="مدیریت کاتالوگ محصولات" icon={ShoppingBag} />

      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex gap-2 flex-1 flex-wrap">
            <Input placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="همه دسته‌بندی‌ها" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">همه</SelectItem>
                {categories.map((c: { id: string; name_fa: string }) => (
                  <SelectItem key={c.id} value={c.id}>{c.name_fa}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
            {hasPermission('product.create') && (
              <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 ml-1" />محصول جدید</Button>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">کد</TableHead>
              <TableHead className="text-right">نام</TableHead>
              <TableHead className="text-right">دسته‌بندی</TableHead>
              <TableHead className="text-right">قیمت فروش</TableHead>
              <TableHead className="text-right">موجودی</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              {(hasPermission('product.update') || hasPermission('product.delete')) && <TableHead className="text-right">عملیات</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center">در حال بارگذاری...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">هیچ محصولی یافت نشد</TableCell></TableRow>
            ) : (
              products.map((p: Product) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono">{p.code}</TableCell>
                  <TableCell>{p.name_fa}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.category_name ?? '-'}</TableCell>
                  <TableCell className="font-mono">{Number(p.price).toLocaleString('fa-IR')}</TableCell>
                  <TableCell>
                    <span className={p.stock_quantity <= p.min_stock_level ? 'text-red-600 font-semibold' : ''}>
                      {p.stock_quantity} {p.unit}
                    </span>
                  </TableCell>
                  <TableCell><Badge variant={STATUS_VARIANTS[p.status]}>{PRODUCT_STATUS_LABELS[p.status]}</Badge></TableCell>
                  {(hasPermission('product.update') || hasPermission('product.delete')) && (
                    <TableCell>
                      <div className="flex gap-1">
                        {hasPermission('product.delete') && (
                          <Button size="icon" variant="ghost" className="text-red-500" onClick={() => setDeleteId(p.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>محصول جدید</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem><FormLabel>کد</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem><FormLabel>واحد</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="nameFa" render={({ field }) => (
                <FormItem><FormLabel>نام فارسی</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>نام انگلیسی</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem><FormLabel>دسته‌بندی</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="انتخاب..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categories.map((c: { id: string; name_fa: string }) => (
                        <SelectItem key={c.id} value={c.id}>{c.name_fa}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-3 gap-3">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>قیمت فروش</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="costPrice" render={({ field }) => (
                  <FormItem><FormLabel>قیمت تمام‌شده</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="minStockLevel" render={({ field }) => (
                  <FormItem><FormLabel>حداقل موجودی</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
                <Button type="submit" disabled={createProduct.isPending}>{createProduct.isPending ? 'در حال ذخیره...' : 'ذخیره'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId('')}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>حذف محصول</DialogTitle></DialogHeader>
          <p>آیا از حذف این محصول اطمینان دارید؟</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId('')}>انصراف</Button>
            <Button variant="destructive" onClick={() => { deleteProduct.mutate(deleteId, { onSuccess: () => setDeleteId('') }); }}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
