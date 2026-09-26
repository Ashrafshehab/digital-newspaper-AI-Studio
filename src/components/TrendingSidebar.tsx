import React, { useState } from 'react';
import { Article } from '../types/newspaper';
import { Flame, Mail, CheckCircle2, BookmarkCheck, TrendingUp } from 'lucide-react';

interface TrendingSidebarProps {
  articles: Article[];
  onOpenArticle: (article: Article) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({
  articles,
  onOpenArticle,
  selectedTag,
  onSelectTag
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Trending ranked articles
  const trendingArticles = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  // Gather unique tags
  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags || []))).slice(0, 8);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <aside className="space-y-6">
      
      {/* 1. Most Read / Trending Widget */}
      <div className="bg-white dark:bg-stone-900 rounded-lg p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <h3 className="text-sm font-bold font-headline text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>الأكثر قراءة الآن</span>
          </h3>
          <span className="text-[11px] text-stone-400 font-mono">ترتيب تفاعلي</span>
        </div>

        <div className="space-y-4 divide-y divide-stone-100 dark:divide-stone-800/80">
          {trendingArticles.map((article, index) => {
            const rank = index + 1;
            return (
              <div
                key={article.id}
                onClick={() => onOpenArticle(article)}
                className="group cursor-pointer pt-3 first:pt-0 flex items-start gap-3"
              >
                {/* Numbered Salience */}
                <span className="font-editorial text-2xl font-bold text-stone-300 dark:text-stone-700 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors w-6 shrink-0 tabular-nums">
                  0{rank}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <span className="font-medium text-amber-800 dark:text-amber-300">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{article.views} قراءة</span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold font-headline text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Hot Tags Filter */}
      <div className="bg-white dark:bg-stone-900 rounded-lg p-4 sm:p-5 border border-stone-200 dark:border-stone-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            مواضيع شائعة بالجامعة
          </h3>
          {selectedTag && (
            <button
              onClick={() => onSelectTag(null)}
              className="text-[11px] text-amber-600 hover:underline"
            >
              إلغاء الفرز
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Newspaper Edition Newsletter */}
      <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-lg p-4 sm:p-5 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
          <Mail className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            النشرة البريدية اليومية
          </h4>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-400 font-body leading-relaxed">
          اشترك لتصلك خلاصة التحقيقات الاستقصائية ومشاريع التخرج المميزة مباشرة إلى بريدك كل صباح.
        </p>

        {subscribed ? (
          <div className="flex items-center gap-2 p-2.5 rounded bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>شكراً لاشتراكك! تم تسجيل بريدك في النشرة الجامعية بنجاح.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              required
              placeholder="أدخل بريدك الإلكتروني..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600"
            />
            <button
              type="submit"
              className="w-full py-1.5 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded hover:opacity-90 transition-opacity cursor-pointer"
            >
              اشتراك مجاني
            </button>
          </form>
        )}
      </div>

    </aside>
  );
};
