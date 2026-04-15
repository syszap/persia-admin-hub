import { useState } from "react";
import { Users, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "user" });

  const handleSave = () => {
    if (!form.name || !form.email) return;
    const user: User = {
      id: editingUser?.id || crypto.randomUUID(),
      ...form,
    };
    if (editingUser) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    } else {
      setUsers((prev) => [...prev, user]);
    }
    setDialogOpen(false);
    setEditingUser(null);
    setForm({ name: "", email: "", role: "user" });
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", role: "user" });
    setDialogOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, role: u.role });
    setDialogOpen(true);
  };

  const roleColors: Record<string, string> = {
    admin: "bg-primary/10 text-primary border-primary/20",
    moderator: "bg-warning/10 text-warning border-warning/20",
    user: "bg-muted text-muted-foreground border-border",
  };

  return (
    <AdminLayout>
      <PageHeader
        title="مدیریت کاربران"
        description="کاربران سیستم را مشاهده و مدیریت کنید"
        icon={Users}
        actionLabel="افزودن کاربر"
        onAction={openCreate}
      />

      <div className="card-surface overflow-hidden">
        {users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="هنوز کاربری ثبت نشده است"
            description="اولین کاربر سیستم را اضافه کنید"
            actionLabel="+ افزودن کاربر"
            onAction={openCreate}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground">نام</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">ایمیل</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">نقش</TableHead>
                <TableHead className="w-24 text-xs font-medium text-muted-foreground">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-sm">{user.name}</TableCell>
                  <TableCell dir="ltr" className="text-right text-sm text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${roleColors[user.role] || ""} text-xs font-medium`}>
                      {user.role === "admin" ? "مدیر" : user.role === "moderator" ? "ناظر" : "کاربر"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(user)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => setUsers((prev) => prev.filter((u) => u.id !== user.id))}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">{editingUser ? "ویرایش کاربر" : "افزودن کاربر جدید"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-3">
              <Label className="label-subtle">نام</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام کاربر" className="input-premium h-11 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Label className="label-subtle">ایمیل</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" dir="ltr" className="input-premium h-11 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Label className="label-subtle">نقش</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدیر</SelectItem>
                  <SelectItem value="moderator">ناظر</SelectItem>
                  <SelectItem value="user">کاربر</SelectItem>
                </SelectContent>
              </Select>
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

export default UserManagement;
