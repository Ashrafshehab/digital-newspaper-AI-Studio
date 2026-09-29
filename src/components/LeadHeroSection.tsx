import React from 'react';
import { Article } from '../types/newspaper';
import { Clock, Eye, Heart, Bookmark, Volume2, ArrowLeft, ShieldCheck } from 'lucide-react';

interface LeadHeroSectionProps {
  leadArticle: Article;
  secondaryArticles: Article[];
  onOpenArticle: (article: Article) => void;
  onToggleBookmark: (articleId: string) => void;
  isBookmarked: (articleId: string) => boolean;
  onOpenAuthorProfile?: (authorName: string) => void;
}

export const LeadHeroSection: React.FC<LeadHeroSectionProps> = ({
  leadArticle,
  secondaryArticles,
  onOpenArticle,
  onToggleBookmark,
  isBookmarked,
  onOpenAuthorProfile
}) => {
  if (!leadArticle) return null;

  return (
    <section className="py-6 border-b border-stone-200 dark:border-stone-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Tier 1: Dominant Lead Story (7 cols on Desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Lead Photo */}
          <div
            onClick={() => onOpenArticle(leadArticle)}
            className="group relative overflow-hidden rounded-lg cursor-pointer aspect-16/9 bg-stone-200 dark:bg-stone-800"
          >
            <img
              src={leadArticle.image}
              alt={leadArticle.title}
              className={`w-full h-full transition-transform duration-500 group-hover:scale-103 ${
                leadArticle.mediaType === 'infographic' || leadArticle.imageDisplayMode === 'infographic_vertical'
                  ? 'object-contain bg-stone-950 p-2'
                  : 'object-cover'
              }`}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
              {/* Unboxed category metadata */}
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1.5 flex-wrap">
                <span>{leadArticle.category}</span>
                <span aria-hidden="true">·</span>
                <span className="text-white/80">القصة الرئيسية الأولى</span>
                {leadArticle.factCheck && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 bg-emerald-700/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm border border-emerald-400/40">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{leadArticle.factCheck.verdictLabelAr} ({leadArticle.factCheck.transparencyScore}%)</span>
                    </span>
                  </>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline leading-tight text-white group-hover:text-amber-300 transition-colors text-balance">
                {leadArticle.title}
              </h2>
            </div>
          </div>

          {/* Lead Deck & Excerpt */}
          <p className="text-base sm:text-lg text-stone-700 dark:text-stone-300 leading-relaxed font-body">
            {leadArticle.excerpt}
          </p>

          {/* Lead Author Byline, Read Time & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
            <div
              onClick={() => onOpenAuthorProfile && onOpenAuthorProfile(leadArticle.author.name)}
              className="flex items-center gap-3 cursor-pointer group/author hover:opacity-90 transition-opacity"
              title="عرض بروفايل المحرر"
            >
              <img
                src={leadArticle.author.avatar}
                alt={leadArticle.author.name}
                className="w-9 h-9 rounded-full object-cover border border-stone-300 dark:border-stone-700 group-hover/author:border-amber-500 transition-colors"
              />
              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100 block group-hover/author:text-amber-600 transition-colors">
                  {leadArticle.author.name}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                  <span>{leadArticle.author.role}</span>
                  {leadArticle.author.studentId && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-stone-400">{leadArticle.author.studentId}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{leadArticle.readTimeMinutes} دقائق قراءة</span>
              </span>

              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-mono">{leadArticle.views}</span>
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(leadArticle.id);
                }}
                className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
                  isBookmarked(leadArticle.id) ? 'text-amber-600' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
                title={isBookmarked(leadArticle.id) ? 'إزالة من المحفوظات' : 'حفظ للقراءة لاحقاً'}
              >
                <Bookmark className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenArticle(leadArticle)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
              >
                <span>قراءة التحقيق</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Tier 2: Secondary Editorial Features (5 cols on Desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:border-r lg:border-stone-200 lg:dark:border-stone-800 lg:pr-6">
          <div className="pb-2 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              أهم التقارير المختارة
            </h3>
            <span className="text-[11px] text-stone-400">تحديث مستمر</span>
          </div>

          {secondaryArticles.slice(0, 2).map((article) => (
            <article
              key={article.id}
              onClick={() => onOpenArticle(article)}
              className="group cursor-pointer flex flex-col gap-2.5 pb-5 border-b border-stone-100 dark:border-stone-800/80 last:border-b-0"
            >
              <div className="relative aspect-16/10 rounded-md overflow-hidden bg-stone-200 dark:bg-stone-800">
                <img
                  src={article.image}
                  alt={article.title}
                  className={`w-full h-full transition-transform duration-300 group-hover:scale-103 ${
                    article.mediaType === 'infographic' || article.imageDisplayMode === 'infographic_vertical'
                      ? 'object-contain bg-stone-950 p-1.5'
                      : 'object-cover'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded font-medium">
                  {article.category}
                </div>
                {article.factCheck && (
                  <div className="absolute top-2 left-2 bg-emerald-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 border border-emerald-400/40">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    <span>مدقق {article.factCheck.transparencyScore}%</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold font-headline leading-snug text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {article.title}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mt-1 leading-relaxed font-body">
                  {article.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-800 dark:text-stone-200">{article.author.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTimeMinutes} دقائق</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(article.id);
                    }}
                    className={`p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors ${
                      isBookmarked(article.id) ? 'text-amber-600' : 'text-stone-400'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
