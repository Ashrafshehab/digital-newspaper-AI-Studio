import React from 'react';
import { X, Bookmark, Trash2, ArrowLeft, Clock } from 'lucide-react';
import { Article } from '../types/newspaper';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedArticles: Article[];
  onOpenArticle: (article: Article) => void;
  onRemoveBookmark: (id: string) => void;
  onClearAll: () => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarkedArticles,
  onOpenArticle,
  onRemoveBookmark,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#FBF9F5] dark:bg-[#121316] h-full shadow-2xl border-r border-stone-200 dark:border-stone-800 flex flex-col text-stone-900 dark:text-stone-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/70">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold font-headline text-base">
              المقالات المحفوظة ({bookmarkedArticles.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {bookmarkedArticles.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>إفراغ القائمة</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-stone-500 hover:text-stone-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarkedArticles.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2">
              <Bookmark className="w-10 h-10 opacity-30 stroke-1" />
              <p className="text-sm font-medium">لم تحفظ أي مقالات بعد</p>
              <p className="text-xs text-stone-500">
                انقر على أيقونة الإشارة المرجعية بجانب أي مقال لقراءته في أي وقت بدون تشتيت.
              </p>
            </div>
          ) : (
            bookmarkedArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => {
                  onOpenArticle(article);
                  onClose();
                }}
                className="group cursor-pointer p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-600/60 dark:hover:border-amber-500/60 transition-all flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                    <span className="font-semibold text-amber-800 dark:text-amber-300">{article.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTimeMinutes} دقائق</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold font-headline text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-body">
                    {article.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400">
                  <span>بقلم: {article.author.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(article.id);
                      }}
                      className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                      title="حذف من المحفوظات"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:text-amber-600 transition-colors" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-100/50 dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500">
          يتم تخزين المحفوظات على متصفحك مباشرة لسرعة الاسترجاع.
        </div>
      </div>
    </div>
  );
};
