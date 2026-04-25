import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { userSchema, type UserFormValues } from '../schemas/user.schema';
import type { User } from '../types';

interface UserFormDialogProps {
  open: boolean;
  editingUser: User | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

const UserFormDialog = ({ open, editingUser, onClose, onSubmit }: UserFormDialogProps) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { username: '', email: '', role: 'user', isActive: true },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({ username: editingUser.username, email: editingUser.email ?? '', role: editingUser.role, isActive: editingUser.isActive });
    } else {
      form.reset({ username: '', email: '', role: 'user', isActive: true });
    }
  }, [editingUser, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {editingUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <Label className="label-subtle">نام کاربری</Label>
                  <FormControl>
                    <Input {...field} placeholder="نام کاربری" className="input-premium h-11 rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <Label className="label-subtle">ایمیل</Label>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="email@example.com"
                      dir="ltr"
                      className="input-premium h-11 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <Label className="label-subtle">نقش</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="owner">مالک</SelectItem>
                      <SelectItem value="admin">مدیر</SelectItem>
                      <SelectItem value="finance_manager">مدیر مالی</SelectItem>
                      <SelectItem value="product_manager">مدیر محصول</SelectItem>
                      <SelectItem value="user">کاربر</SelectItem>
                      <SelectItem value="customer">مشتری</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="rounded-xl">
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="btn-hover rounded-xl"
              >
                ذخیره
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
