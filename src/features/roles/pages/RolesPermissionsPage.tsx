import { useState } from 'react';
import { Shield } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import RoleTable from '../components/RoleTable';
import RoleFormDialog from '../components/RoleFormDialog';
import { PERMISSION_COLUMNS, type Role } from '../types';

const RolesPermissionsPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const addRole = (name: string) => {
    const role: Role = {
      id: crypto.randomUUID(),
      name,
      permissions: Object.fromEntries(PERMISSION_COLUMNS.map((c) => [c.key, false])) as Role['permissions'],
    };
    setRoles((prev) => [...prev, role]);
    setDialogOpen(false);
  };

  const togglePermission = (roleId: string, permKey: string) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? { ...r, permissions: { ...r.permissions, [permKey]: !r.permissions[permKey as keyof Role['permissions']] } }
          : r,
      ),
    );
  };

  const deleteRole = (roleId: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
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

      <div className="card-surface overflow-hidden">
        {roles.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="هنوز نقشی تعریف نشده است"
            description="نقش‌ها را تعریف کرده و دسترسی‌ها را مشخص کنید"
            actionLabel="+ افزودن نقش"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <RoleTable roles={roles} onToggle={togglePermission} onDelete={deleteRole} />
        )}
      </div>

      <RoleFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={addRole}
      />
    </AdminLayout>
  );
};

export default RolesPermissionsPage;
