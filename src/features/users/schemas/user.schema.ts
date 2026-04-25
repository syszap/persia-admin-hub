import { z } from 'zod';

export const userSchema = z.object({
  username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد'),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد').optional(),
  email: z.string().email('آدرس ایمیل معتبر نیست').optional().or(z.literal('')),
  fullName: z.string().optional(),
  role: z.enum(['owner', 'admin', 'finance_manager', 'product_manager', 'user', 'customer'], {
    errorMap: () => ({ message: 'نقش معتبری انتخاب کنید' }),
  }),
  isActive: z.boolean().default(true),
});

export type UserFormValues = z.infer<typeof userSchema>;
