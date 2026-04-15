import { useState } from "react";
import { Shield, Plus, Trash2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Role {
  id: string;
  name: string;
  permissions: Record<string, boolean>;
}

const permissionColumns = [
  { key: "apps", label: "اپلیکیشن‌ها" },
  { key: "menus", label: "منوها" },
  { key: "reports", label: "گزارشات" },
  { key: "users", label: "کاربران" },
  { key: "settings", label: "تنظیمات" },
];

const RolesPermissions = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const addRole = () => {
    if (!newRoleName) return;
    const role: Role = {
      id: crypto.randomUUID(),
      name: newRoleName,
      permissions: Object.fromEntries(permissionColumns.map((c) => [c.key, false])),
    };
    setRoles((prev) => [...prev, role]);
    setDialogOpen(false);
    setNewRoleName("");
  };

  const togglePermission = (roleId: string, permKey: string) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? { ...r, permissions: { ...r.permissions, [permKey]: !r.permissions[permKey] } }
          : r
      )
    );
  };

  return (
    <AdminLayout>
      <PageHeader
        title="نقش‌ها و دسترسی‌ها"
        description="ماتریس دسترسی نقش‌ها را مدیریت کنید"
        icon={Shield}
        actionLabel="افزودن نقش"
        onAction={() => setDialogOpen(true)}
      />

      <div className="card-surface">
        {roles.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="هنوز نقشی تعریف نشده است"
            description="نقش‌ها را تعریف کرده و دسترسی‌ها را مشخص کنید"
            actionLabel="+ افزودن نقش"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">نقش</TableHead>
                  {permissionColumns.map((col) => (
                    <TableHead key={col.key} className="text-center min-w-[100px]">{col.label}</TableHead>
                  ))}
                  <TableHead className="w-16">حذف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    {permissionColumns.map((col) => (
                      <TableCell key={col.key} className="text-center">
                        <Checkbox
                          checked={role.permissions[col.key]}
                          onCheckedChange={() => togglePermission(role.id, col.key)}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setRoles((prev) => prev.filter((r) => r.id !== role.id))}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>افزودن نقش جدید</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>نام نقش</Label>
              <Input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="مثلاً: مدیر محتوا" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={addRole}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default RolesPermissions;
