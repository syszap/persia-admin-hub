import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface OfflineFallbackProps {
  children: React.ReactNode;
}

/**
 * Wraps a subtree and overlays a full-screen offline notice when the device
 * loses network connectivity. The children remain mounted (and served from the
 * React Query cache) so the user can still read stale data.
 */
const OfflineFallback = ({ children }: OfflineFallbackProps) => {
  const isOnline = useOnlineStatus();

  return (
    <>
      {children}

      {!isOnline && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm"
          dir="rtl"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-muted-foreground" />
          </div>

          <div className="text-center space-y-2 max-w-sm px-6">
            <h2 className="text-xl font-bold text-foreground">اتصال اینترنت قطع است</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              اطلاعات ذخیره‌شده نمایش داده می‌شود. برای دسترسی کامل به امکانات، اتصال اینترنت خود را
              بررسی کنید.
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-xl gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </Button>
        </div>
      )}
    </>
  );
};

export default OfflineFallback;
