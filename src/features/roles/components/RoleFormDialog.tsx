import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const roleSchema = z.object({
  name: z.string().min(2, 'نام نقش باید حداقل ۲ کاراکتر باشد'),
});
type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

const RoleFormDialog = ({ open, onClose, onSubmit }: RoleFormDialogProps) => {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: '' },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = (values: RoleFormValues) => {
    onSubmit(values.name);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">افزودن نقش جدید</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <Label className="label-subtle">نام نقش</Label>
                  <FormControl>
                    <Input {...field} placeholder="مثلاً: مدیر محتوا" className="input-premium h-11 rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="rounded-xl">
                انصراف
              </Button>
              <Button type="submit" className="btn-hover rounded-xl">ذخیره</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleFormDialog;
