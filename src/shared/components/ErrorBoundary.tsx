import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 p-8 text-center" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">خطای غیرمنتظره</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {this.state.error?.message ?? 'مشکلی در بارگذاری این بخش رخ داده است.'}
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl gap-2"
            onClick={this.reset}
          >
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
