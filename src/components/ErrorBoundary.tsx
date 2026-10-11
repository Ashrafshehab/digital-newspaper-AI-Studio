import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.href = window.location.pathname;
  };

  private handleClearAndReload = () => {
    try {
      localStorage.removeItem('mudigital_photo_library');
    } catch {
      // ignore
    }
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 flex items-center justify-center p-4 font-sans dir-rtl">
          <div className="max-w-md w-full bg-white dark:bg-stone-850 rounded-2xl shadow-xl p-6 border border-stone-200 dark:border-stone-800 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold">حدث خطأ غير متوقع في العرض</h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                تم استعادة حماية النظام لمنع ظهور صفحة بيضاء فارغة. يمكنك إعادة تحميل الصفحة بأمان.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة تحميل الصفحة</span>
              </button>
              <button
                type="button"
                onClick={this.handleClearAndReload}
                className="py-2.5 px-4 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-stone-300 dark:border-stone-700"
              >
                <Home className="w-3.5 h-3.5" />
                <span>العودة للرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
