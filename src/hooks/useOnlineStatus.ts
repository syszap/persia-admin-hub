import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('اتصال اینترنت برقرار شد.');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('اتصال اینترنت قطع شد. حالت آفلاین فعال است.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
