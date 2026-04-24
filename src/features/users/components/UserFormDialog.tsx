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
    defaultValues: { name: '', email: '', role: 'user' },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({ name: editingUser.name, email: editingUser.email, role: editingUser.role });
    } else {
      form.reset({ name: '', email: '', role: 'user' });
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
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <Label className="label-subtle">نام</Label>
                  <FormControl>
                    <Input {...field} placeholder="نام کاربر" className="input-premium h-11 rounded-xl" />
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
                      <SelectItem value="admin">مدیر</SelectItem>
                      <SelectItem value="moderator">ناظر</SelectItem>
                      <SelectItem value="user">کاربر</SelectItem>
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
