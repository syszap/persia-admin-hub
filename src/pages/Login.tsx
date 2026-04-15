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
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("لطفاً تمام فیلدها را پر کنید");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Right side — Login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div
          className="w-full max-w-[440px] animate-fade-in"
          style={{ animationDuration: "0.5s" }}
        >
          {/* Card container */}
          <div className="bg-card rounded-2xl p-8 md:p-10"
            style={{
              boxShadow: "0 20px 50px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <img
                src={logo}
                alt="شیما"
                className="w-10 h-10 object-contain"
              />
              <span className="font-bold text-lg text-foreground">
                پنل مدیریت شیما
              </span>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-1.5">
              ورود به حساب کاربری
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              اطلاعات خود را وارد کنید
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  نام کاربری
                </Label>
                <div className="relative">
                  <User
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-200 ${
                      focused === "username"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocused("username")}
                    onBlur={() => setFocused(null)}
                    placeholder="نام کاربری خود را وارد کنید"
                    className="h-12 rounded-xl pr-10 bg-background border-border transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  کلمه عبور
                </Label>
                <div className="relative">
                  <Lock
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none transition-colors duration-200 ${
                      focused === "password"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    placeholder="کلمه عبور خود را وارد کنید"
                    className="h-12 rounded-xl pr-10 bg-background border-border transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer select-none"
                >
                  مرا به خاطر بسپار
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-2.5 animate-fade-in">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-base font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] mt-2"
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
      </div>

      {/* Left side — Branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        {/* Decorative layers */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute bottom-16 right-16 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/[0.07] rounded-full blur-2xl" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div
          className="relative text-center text-white px-12 max-w-lg animate-fade-in"
          style={{ animationDuration: "0.6s", animationDelay: "0.15s", animationFillMode: "both" }}
        >
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 shadow-lg">
            <img
              src={logo}
              alt="شیما"
              className="w-14 h-14 object-contain brightness-0 invert"
            />
          </div>
          <h2 className="text-3xl font-bold mb-4">پنل مدیریت شیما</h2>
          <p className="text-lg text-white/75 leading-relaxed">
            سامانه مدیریت یکپارچه برای کنترل و نظارت بر تمامی بخش‌های سیستم
          </p>
          <div className="mt-10 flex items-center justify-center gap-2.5">
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
