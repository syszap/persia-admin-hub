import { useState } from 'react';
import { Menu, GripVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { MenuItemData } from '../types';

const menuSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است'),
  route: z.string().optional(),
  parentId: z.string().optional(),
});
type MenuFormValues = z.infer<typeof menuSchema>;

// Pure tree manipulation helpers — no side-effects, easy to test
const updateInTree = (items: MenuItemData[], updated: MenuItemData): MenuItemData[] =>
  items.map((item) =>
    item.id === updated.id
      ? { ...updated, children: item.children }
      : { ...item, children: updateInTree(item.children, updated) },
  );

const addToParent = (items: MenuItemData[], parentId: string, child: MenuItemData): MenuItemData[] =>
  items.map((item) =>
    item.id === parentId
      ? { ...item, children: [...item.children, child] }
      : { ...item, children: addToParent(item.children, parentId, child) },
  );

const removeFromTree = (items: MenuItemData[], id: string): MenuItemData[] =>
  items
    .filter((item) => item.id !== id)
    .map((item) => ({ ...item, children: removeFromTree(item.children, id) }));

const flattenTree = (items: MenuItemData[]): MenuItemData[] =>
  items.flatMap((i) => [i, ...flattenTree(i.children)]);

interface MenuRowProps {
  item: MenuItemData;
  depth?: number;
  onAddChild: (parentId: string) => void;
  onEdit: (item: MenuItemData) => void;
  onDelete: (id: string) => void;
}

const MenuRow = ({ item, depth = 0, onAddChild, onEdit, onDelete }: MenuRowProps) => (
  <>
    <div
      className={cn(
        'flex items-center gap-3 px-5 py-3.5 border-b border-border/40 last:border-b-0 hover:bg-muted/40 transition-all duration-200 group',
      )}
      style={{ paddingRight: `${1.25 + depth * 1.5}rem` }}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab shrink-0 group-hover:text-muted-foreground transition-colors" />
      <span className="flex-1 text-sm font-medium">{item.title}</span>
      <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded-md">
        {item.route || '—'}
      </span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onAddChild(item.id)}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onEdit(item)}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => onDelete(item.id)}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
    {item.children.map((child) => (
      <MenuRow key={child.id} item={child} depth={depth + 1} onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete} />
    ))}
  </>
);

const MenuBuilderPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [defaultParentId, setDefaultParentId] = useState('');

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: { title: '', route: '', parentId: '' },
  });

  const openCreate = (parentId?: string) => {
    setEditingItem(null);
    setDefaultParentId(parentId ?? '');
    form.reset({ title: '', route: '', parentId: parentId ?? '' });
    setDialogOpen(true);
  };

  const openEdit = (item: MenuItemData) => {
    setEditingItem(item);
    form.reset({ title: item.title, route: item.route, parentId: item.parentId ?? '' });
    setDialogOpen(true);
  };

  const handleSave = (values: MenuFormValues) => {
    const newItem: MenuItemData = {
      id: editingItem?.id ?? crypto.randomUUID(),
      title: values.title,
      icon: 'circle',
      route: values.route ?? '',
      parentId: values.parentId || null,
      children: editingItem?.children ?? [],
    };

    if (editingItem) {
      setMenuItems((prev) => updateInTree(prev, newItem));
    } else if (values.parentId) {
      setMenuItems((prev) => addToParent(prev, values.parentId!, newItem));
    } else {
      setMenuItems((prev) => [...prev, newItem]);
    }

    setDialogOpen(false);
    setEditingItem(null);
  };

  const flatItems = flattenTree(menuItems);

  return (
    <AdminLayout>
      <PageHeader
        title="مدیریت منوها"
        description="ساختار منوهای سیستم را مدیریت کنید"
        icon={Menu}
        actionLabel="افزودن منو"
        onAction={() => openCreate()}
      />

      <div className="card-surface overflow-hidden">
        {menuItems.length === 0 ? (
          <EmptyState
            icon={Menu}
            title="هیچ منویی تعریف نشده است"
            description="با افزودن اولین منو شروع کنید"
            actionLabel="+ افزودن منو"
            onAction={() => openCreate()}
          />
        ) : (
          menuItems.map((item) => (
            <MenuRow
              key={item.id}
              item={item}
              onAddChild={openCreate}
              onEdit={openEdit}
              onDelete={(id) => setMenuItems((prev) => removeFromTree(prev, id))}
            />
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingItem ? 'ویرایش منو' : 'افزودن منو جدید'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <Label className="label-subtle">عنوان</Label>
                    <FormControl>
                      <Input {...field} placeholder="عنوان منو" className="input-premium h-11 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="route"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <Label className="label-subtle">مسیر (Route)</Label>
                    <FormControl>
                      <Input {...field} placeholder="/example" dir="ltr" className="input-premium h-11 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!editingItem && flatItems.length > 0 && (
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <Label className="label-subtle">والد (اختیاری)</Label>
                      <Select
                        value={field.value || '__none__'}
                        onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="بدون والد (ریشه)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">بدون والد</SelectItem>
                          {flatItems.map((i) => (
                            <SelectItem key={i.id} value={i.id}>{i.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
                  انصراف
                </Button>
                <Button type="submit" className="btn-hover rounded-xl">ذخیره</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default MenuBuilderPage;
