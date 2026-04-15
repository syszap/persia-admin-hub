import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("لطفاً تمام فیلدها را پر کنید");
      return;
    }
    setLoading(true);
    // Simulate — replace with real auth
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Right side — Login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <img src={logo} alt="شیما" className="w-11 h-11 object-contain animate-fade-in" />
            <span className="font-bold text-xl text-foreground">پنل مدیریت شیما</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">ورود به حساب کاربری</h1>
          <p className="text-sm text-muted-foreground mb-8">اطلاعات خود را وارد کنید</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="label-subtle">نام کاربری</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری خود را وارد کنید"
                  className="input-premium h-12 rounded-xl pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="label-subtle">کلمه عبور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="کلمه عبور خود را وارد کنید"
                  className="input-premium h-12 rounded-xl pr-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                مرا به خاطر بسپار
              </label>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3 animate-fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl btn-hover text-base font-medium shadow-md"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  ورود به سیستم
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Left side — Branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-primary/80">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/8 rounded-full blur-2xl" />
        </div>

        <div className="relative text-center text-white px-12 max-w-lg animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 shadow-lg">
            <img src={logo} alt="شیما" className="w-14 h-14 object-contain brightness-0 invert" />
          </div>
          <h2 className="text-3xl font-bold mb-4">پنل مدیریت شیما</h2>
          <p className="text-lg text-white/80 leading-relaxed">
            سامانه مدیریت یکپارچه برای کنترل و نظارت بر تمامی بخش‌های سیستم
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white/60" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
