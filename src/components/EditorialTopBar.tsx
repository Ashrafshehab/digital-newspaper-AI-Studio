import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Clock,
  Sparkles
} from 'lucide-react';
import { EditorialUser } from '../types/newspaper';
import { toWesternDigits } from './ArticleReadershipAnalytics';

interface EditorialTopBarProps {
  user: EditorialUser;
  pendingArticlesCount?: number;
  onOpenDashboard: () => void;
  onOpenComposer?: () => void;
  onLogout: () => void;
}

export const EditorialTopBar: React.FC<EditorialTopBarProps> = ({
  user,
  pendingArticlesCount = 0,
  onOpenDashboard,
  onOpenComposer,
  onLogout
}) => {
  return (
    <aside
      aria-label="شريط أدوات هيئة التحرير"
      className="bg-stone-950 text-stone-100 border-b border-stone-800 text-xs py-1.5 px-4 sm:px-8 sticky top-0 z-50 shadow-lg backdrop-blur-sm"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* User Identity & Role */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>كادر التحرير</span>
          </div>

          <div className="flex items-center gap-2">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-5 h-5 rounded-full object-cover border border-amber-500/40"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center text-[10px] font-bold">
                {user.name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-stone-100">{user.name}</span>
            <span className="text-stone-500 text-[10px]">·</span>
            <span className="text-[11px] text-amber-400 font-medium">
              {user.roleTitleAr}
            </span>
          </div>

          {pendingArticlesCount > 0 && (
            <div
              className="hidden sm:flex items-center gap-1 bg-rose-950/80 border border-rose-800/60 text-rose-300 px-2 py-0.5 rounded text-[11px] font-bold font-mono"
              title="مقالات بانتظار المراجعة والاعتماد في دورة النشر"
            >
              <Clock className="w-3 h-3 text-rose-400" />
              <span>{toWesternDigits(pendingArticlesCount)} بانتظار الاعتماد</span>
            </div>
          )}
        </div>

        {/* Quick Editorial Actions */}
        <div className="flex items-center gap-2">
          {onOpenComposer && (
            <button
              type="button"
              onClick={onOpenComposer}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition-colors cursor-pointer border border-stone-700 text-xs font-semibold"
              title="صياغة مسودة خبر أو تقرير جديد"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">صياغة خبر</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenDashboard}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer shadow-xs text-xs font-bold"
            title="فتح لوحة التحكم التحريرية الكاملة"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>لوحة التحكم التحريرية</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-300 border border-stone-800 hover:border-rose-900 transition-colors cursor-pointer text-xs"
            title="تسجيل الخروج والعودة لوضع القارئ العادي"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
