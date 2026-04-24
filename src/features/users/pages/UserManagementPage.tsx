import { useState } from 'react';
import { Users } from 'lucide-react';
import AdminLayout from '@/shared/components/layout/AdminLayout';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import UserTable from '../components/UserTable';
import UserFormDialog from '../components/UserFormDialog';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../hooks/useUsers';
import type { User } from '../types';
import type { UserFormValues } from '../schemas/user.schema';

const UserManagementPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const openCreate = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: UserFormValues) => {
    if (editingUser) {
      await updateUser.mutateAsync({ id: editingUser.id, payload: values });
    } else {
      await createUser.mutateAsync(values);
    }
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => deleteUser.mutate(id);

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
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            در حال بارگذاری...
          </div>
        )}
        {!isLoading && users.length === 0 && (
          <EmptyState
            icon={Users}
            title="هنوز کاربری ثبت نشده است"
            description="اولین کاربر سیستم را اضافه کنید"
            actionLabel="+ افزودن کاربر"
            onAction={openCreate}
          />
        )}
        {!isLoading && users.length > 0 && (
          <UserTable users={users} onEdit={openEdit} onDelete={handleDelete} />
        )}
      </div>

      <UserFormDialog
        open={dialogOpen}
        editingUser={editingUser}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </AdminLayout>
  );
};

export default UserManagementPage;
