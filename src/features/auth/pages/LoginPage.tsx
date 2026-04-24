import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, LogIn, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import logo from '@/assets/logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', rememberMe: false },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError('');
    try {
      const { token, refreshToken, user } = await authService.login(values);
      setAuth(token, refreshToken ?? '', user);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'خطا در اتصال به سرور';
      setServerError(msg);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-[440px] animate-fade-in" style={{ animationDuration: '0.5s' }}>
          <div
            className="bg-card rounded-2xl p-8 md:p-10"
            style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-3 mb-8">
              <img src={logo} alt="شیما" className="w-10 h-10 object-contain" />
              <span className="font-bold text-lg text-foreground">پنل مدیریت شیما</span>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-1.5">ورود به حساب کاربری</h1>
            <p className="text-sm text-muted-foreground mb-8">اطلاعات خود را وارد کنید</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">نام کاربری</Label>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="نام کاربری خود را وارد کنید"
                            className="h-12 rounded-xl pr-10 bg-background border-border transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">کلمه عبور</Label>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none text-muted-foreground" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="کلمه عبور خود را وارد کنید"
                            className="h-12 rounded-xl pr-10 bg-background border-border transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm text-muted-foreground cursor-pointer select-none"
                        >
                          مرا به خاطر بسپار
                        </label>
                      </div>
                    </FormItem>
                  )}
                />

                {serverError && (
                  <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-2.5 animate-fade-in">
                    {serverError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl text-base font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] mt-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      ورود به سیستم
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Branding side (desktop only) */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-16 right-16 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div
          className="relative text-center text-white px-12 max-w-lg animate-fade-in"
          style={{ animationDuration: '0.6s', animationDelay: '0.15s', animationFillMode: 'both' }}
        >
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 shadow-lg">
            <img src={logo} alt="شیما" className="w-14 h-14 object-contain brightness-0 invert" />
          </div>
          <h2 className="text-3xl font-bold mb-4">پنل مدیریت شیما</h2>
          <p className="text-lg text-white/75 leading-relaxed">
            سامانه مدیریت یکپارچه برای کنترل و نظارت بر تمامی بخش‌های سیستم
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
