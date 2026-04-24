import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  email: z.string().email('آدرس ایمیل معتبر نیست'),
  role: z.enum(['admin', 'moderator', 'user'], {
    errorMap: () => ({ message: 'نقش معتبری انتخاب کنید' }),
  }),
});

export type UserFormValues = z.infer<typeof userSchema>;
