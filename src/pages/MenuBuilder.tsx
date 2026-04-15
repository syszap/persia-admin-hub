import { useState } from "react";
import { Menu, GripVertical, Plus, Pencil, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface MenuItemData {
  id: string;
  title: string;
  icon: string;
  route: string;
  parentId: string | null;
  children: MenuItemData[];
}

const MenuBuilder = () => {
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [form, setForm] = useState({ title: "", icon: "circle", route: "", parentId: "" });

  const handleSave = () => {
    if (!form.title) return;
    const newItem: MenuItemData = {
      id: editingItem?.id || crypto.randomUUID(),
      title: form.title,
      icon: form.icon,
      route: form.route,
      parentId: form.parentId || null,
      children: editingItem?.children || [],
    };

    if (editingItem) {
      setMenuItems((prev) => updateItemInTree(prev, newItem));
    } else if (form.parentId) {
      setMenuItems((prev) => addChildToParent(prev, form.parentId, newItem));
    } else {
      setMenuItems((prev) => [...prev, newItem]);
    }

    setDialogOpen(false);
    setEditingItem(null);
    setForm({ title: "", icon: "circle", route: "", parentId: "" });
  };

  const updateItemInTree = (items: MenuItemData[], updated: MenuItemData): MenuItemData[] => {
    return items.map((item) => {
      if (item.id === updated.id) return { ...updated, children: item.children };
      return { ...item, children: updateItemInTree(item.children, updated) };
    });
  };

  const addChildToParent = (items: MenuItemData[], parentId: string, child: MenuItemData): MenuItemData[] => {
    return items.map((item) => {
      if (item.id === parentId) return { ...item, children: [...item.children, child] };
      return { ...item, children: addChildToParent(item.children, parentId, child) };
    });
  };

  const deleteItem = (items: MenuItemData[], id: string): MenuItemData[] => {
    return items
      .filter((item) => item.id !== id)
      .map((item) => ({ ...item, children: deleteItem(item.children, id) }));
  };

  const flatItems = (items: MenuItemData[]): MenuItemData[] => {
    return items.flatMap((i) => [i, ...flatItems(i.children)]);
  };

  const openCreate = (parentId?: string) => {
    setEditingItem(null);
    setForm({ title: "", icon: "circle", route: "", parentId: parentId || "" });
    setDialogOpen(true);
  };

  const openEdit = (item: MenuItemData) => {
    setEditingItem(item);
    setForm({ title: item.title, icon: item.icon, route: item.route, parentId: item.parentId || "" });
    setDialogOpen(true);
  };

  const MenuRow = ({ item, depth = 0 }: { item: MenuItemData; depth?: number }) => (
    <>
      <div
        className={cn(
          "flex items-center gap-3 px-5 py-3.5 border-b border-border/40 last:border-b-0 hover:bg-muted/40 transition-all duration-200 group",
        )}
        style={{ paddingRight: `${1.25 + depth * 1.5}rem` }}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab shrink-0 group-hover:text-muted-foreground transition-colors" />
        <span className="flex-1 text-sm font-medium">{item.title}</span>
        <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded-md">{item.route || "—"}</span>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openCreate(item.id)}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(item)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => setMenuItems((prev) => deleteItem(prev, item.id))}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      {item.children.map((child) => (
        <MenuRow key={child.id} item={child} depth={depth + 1} />
      ))}
    </>
  );

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
          menuItems.map((item) => <MenuRow key={item.id} item={item} />)
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">{editingItem ? "ویرایش منو" : "افزودن منو جدید"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-3">
              <Label className="label-subtle">عنوان</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان منو" className="input-premium h-11 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Label className="label-subtle">مسیر (Route)</Label>
              <Input value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} placeholder="/example" dir="ltr" className="input-premium h-11 rounded-xl" />
            </div>
            {!editingItem && flatItems(menuItems).length > 0 && (
              <div className="space-y-3">
                <Label className="label-subtle">والد (اختیاری)</Label>
                <Select value={form.parentId} onValueChange={(v) => setForm({ ...form, parentId: v })}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="بدون والد (ریشه)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">بدون والد</SelectItem>
                    {flatItems(menuItems).map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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

export default MenuBuilder;
