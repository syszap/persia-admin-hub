import { useState } from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLowStockProducts, useProducts } from '../hooks/useProducts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../services/products.service';
import { toast } from 'sonner';
import type { Product } from '../types';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'low'>('all');
  const [movementOpen, setMovementOpen] = useState(false);
  const [movement, setMovement] = useState({ productId: '', type: 'in' as const, quantity: 1, notes: '' });

  const { data } = useProducts({ limit: 200 });
  const { data: lowData } = useLowStockProducts();
  const qc = useQueryClient();
  const addMovement = useMutation({
    mutationFn: productsService.addInventoryMovement,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('حرکت انبار ثبت شد'); setMovementOpen(false); },
    onError: () => toast.error('خطا در ثبت حرکت انبار'),
  });

  const all: Product[] = data?.data ?? [];
  const low: Product[] = lowData?.data ?? [];
  const shown = activeTab === 'all' ? all : low;

  return (
    <AdminLayout>
      <PageHeader title="مدیریت انبار" description="کنترل موجودی و حرکات انبار" icon={Package} />

      <div className="flex gap-2 mb-6">
        <Button variant={activeTab === 'all' ? 'default' : 'outline'} onClick={() => setActiveTab('all')}>همه محصولات</Button>
        <Button variant={activeTab === 'low' ? 'destructive' : 'outline'} onClick={() => setActiveTab('low')}>
          <AlertTriangle className="w-4 h-4 ml-1" />کمبود موجودی ({low.length})
        </Button>
        <div className="flex-1" />
        <Button onClick={() => setMovementOpen(true)}>ثبت حرکت انبار</Button>
      </div>

      <div className="card-surface p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">کد</TableHead>
              <TableHead className="text-right">نام محصول</TableHead>
              <TableHead className="text-right">موجودی فعلی</TableHead>
              <TableHead className="text-right">حداقل موجودی</TableHead>
              <TableHead className="text-right">واحد</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">هیچ موردی یافت نشد</TableCell></TableRow>
            ) : shown.map((p: Product) => (
              <TableRow key={p.id} className={p.stock_quantity <= p.min_stock_level ? 'bg-red-50' : ''}>
                <TableCell className="font-mono">{p.code}</TableCell>
                <TableCell>{p.name_fa}</TableCell>
                <TableCell className={`font-semibold ${p.stock_quantity <= p.min_stock_level ? 'text-red-600' : 'text-green-600'}`}>
                  {p.stock_quantity}
                </TableCell>
                <TableCell className="text-muted-foreground">{p.min_stock_level}</TableCell>
                <TableCell>{p.unit}</TableCell>
                <TableCell>
                  {p.stock_quantity <= p.min_stock_level
                    ? <span className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />کمبود</span>
                    : <span className="text-xs text-green-600">کافی</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={movementOpen} onOpenChange={setMovementOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>ثبت حرکت انبار</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">محصول</label>
              <Select value={movement.productId} onValueChange={(v) => setMovement({ ...movement, productId: v })}>
                <SelectTrigger><SelectValue placeholder="انتخاب محصول..." /></SelectTrigger>
                <SelectContent>
                  {all.map((p: Product) => <SelectItem key={p.id} value={p.id}>{p.code} - {p.name_fa}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">نوع حرکت</label>
              <Select value={movement.type} onValueChange={(v) => setMovement({ ...movement, type: v as 'in' | 'out' | 'adjustment' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">ورود به انبار</SelectItem>
                  <SelectItem value="out">خروج از انبار</SelectItem>
                  <SelectItem value="adjustment">تعدیل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">مقدار</label><Input type="number" min={1} value={movement.quantity} onChange={(e) => setMovement({ ...movement, quantity: parseInt(e.target.value) || 1 })} /></div>
            <div><label className="text-sm font-medium">توضیحات</label><Input value={movement.notes} onChange={(e) => setMovement({ ...movement, notes: e.target.value })} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMovementOpen(false)}>انصراف</Button>
            <Button onClick={() => addMovement.mutate(movement)} disabled={!movement.productId || addMovement.isPending}>
              {addMovement.isPending ? 'در حال ثبت...' : 'ثبت'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
