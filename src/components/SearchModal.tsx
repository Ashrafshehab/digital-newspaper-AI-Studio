import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowLeft } from 'lucide-react';
import { Article } from '../types/newspaper';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onOpenArticle: (article: Article) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onOpenArticle
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? articles.filter((a) => {
        const q = query.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.author.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-[#FBF9F5] dark:bg-[#121316] rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col text-stone-900 dark:text-stone-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-stone-200 dark:border-stone-800">
          <Search className="w-5 h-5 text-amber-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="ابحث بالعنوان، الكاتب، الوسم، أو نص التحقيق..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-base sm:text-lg focus:outline-hidden text-stone-900 dark:text-white placeholder:text-stone-400 font-headline font-semibold"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-stone-500 space-y-2">
              <p>جرّب البحث عن كلمات مثل:</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['الذكاء الاصطناعي', 'غرف الأخبار', 'المخطوطات', 'مشاريع التخرج', 'البيئة'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="px-2.5 py-1 bg-stone-200/60 dark:bg-stone-800 rounded text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">
              لم نعثر على أي نتائج تطابق "{query}". جرب استخدام كلمات مفتاحية أخرى.
            </div>
          ) : (
            filtered.map((article) => (
              <div
                key={article.id}
                onClick={() => {
                  onOpenArticle(article);
                  onClose();
                }}
                className="group cursor-pointer p-3 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800/70 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.author.name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTimeMinutes} دقائق</span>
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold font-headline text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                    {article.title}
                  </h4>
                  <p className="text-xs text-stone-500 truncate font-body">
                    {article.excerpt}
                  </p>
                </div>
                <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-100/60 dark:bg-stone-900/60 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
          <span>نتائج سريعة بالبحث الميداني للصحيفة</span>
          <span>اضغط ESC للإغلاق</span>
        </div>
      </div>
    </div>
  );
};
