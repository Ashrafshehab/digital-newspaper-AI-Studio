import React from 'react';
import { Article } from '../types/newspaper';
import { Clock, Eye, Bookmark, ArrowLeft, ShieldCheck, BarChart2, Video, Headphones } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  viewMode: 'grid' | 'broadsheet' | 'compact';
  onOpen: (article: Article) => void;
  onToggleBookmark: (id: string) => void;
  isBookmarked: boolean;
  onOpenAuthorProfile?: (authorName: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  viewMode,
  onOpen,
  onToggleBookmark,
  isBookmarked,
  onOpenAuthorProfile
}) => {
  if (viewMode === 'compact') {
    return (
      <article
        onClick={() => onOpen(article)}
        className="group flex items-center justify-between gap-4 p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-all cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1 flex-wrap">
            <span className="font-semibold text-amber-700 dark:text-amber-400">{article.category}</span>
            <span aria-hidden="true">·</span>
            <span>{article.publishedAt.split('·')[0]}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readTimeMinutes} دقائق</span>
            {article.factCheck && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>مدقق {article.factCheck.transparencyScore}%</span>
                </span>
              </>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold font-headline text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
            {article.title}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 truncate mt-0.5 font-body">
            {article.excerpt}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article.id);
            }}
            className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer ${
              isBookmarked ? 'text-amber-600' : 'text-stone-400'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
          <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors" />
        </div>
      </article>
    );
  }

  if (viewMode === 'broadsheet') {
    return (
      <article
        onClick={() => onOpen(article)}
        className="group cursor-pointer flex flex-col justify-between p-4 rounded border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400 dark:hover:border-stone-600 transition-all space-y-3"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 pb-1.5 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-800 dark:text-amber-400">{article.category}</span>
              {article.factCheck && (
                <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{article.factCheck.verdictLabelAr} ({article.factCheck.transparencyScore}%)</span>
                </span>
              )}
            </div>
            <span>{article.readTimeMinutes} دقائق قراءة</span>
          </div>

          <h3 className="text-lg font-bold font-headline leading-snug text-stone-950 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
            {article.title}
          </h3>

          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 line-clamp-3 leading-relaxed font-body">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <div
            onClick={(e) => {
              if (onOpenAuthorProfile) {
                e.stopPropagation();
                onOpenAuthorProfile(article.author.name);
              }
            }}
            className="flex items-center gap-2 cursor-pointer hover:text-amber-600 transition-colors"
            title="عرض بروفايل المحرر"
          >
            <span className="font-semibold text-stone-800 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400">{article.author.name}</span>
            {article.author.studentId && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[11px] text-stone-400 font-mono">{article.author.studentId}</span>
              </>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article.id);
            }}
            className={`p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors ${
              isBookmarked ? 'text-amber-600' : 'text-stone-400'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
        </div>
      </article>
    );
  }

  // Default: Modern Grid view
  return (
    <article
      onClick={() => onOpen(article)}
      className="group cursor-pointer flex flex-col justify-between rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="relative aspect-16/10 bg-stone-200 dark:bg-stone-800 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2.5 right-2.5 bg-stone-950/75 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
          {article.category}
        </div>
        {article.factCheck && (
          <div className="absolute top-2.5 left-2.5 bg-emerald-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 border border-emerald-400/40">
            <ShieldCheck className="w-3 h-3 text-emerald-300" />
            <span>مدقق {article.factCheck.transparencyScore}%</span>
          </div>
        )}
        {article.mediaType === 'infographic' && (
          <div className="absolute bottom-2.5 right-2.5 bg-emerald-800/95 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
            <BarChart2 className="w-3 h-3 text-emerald-300" />
            <span>إنفوجرافيك طولي كامل</span>
          </div>
        )}
        {article.mediaType === 'video' && (
          <div className="absolute bottom-2.5 right-2.5 bg-rose-700/95 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
            <Video className="w-3 h-3 text-rose-200" />
            <span>تقرير مصور وفيديو</span>
          </div>
        )}
        {article.mediaType === 'podcast' && (
          <div className="absolute bottom-2.5 right-2.5 bg-purple-700/95 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
            <Headphones className="w-3 h-3 text-purple-200" />
            <span>بودكاست صوتي</span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>{article.publishedAt.split('·')[0]}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readTimeMinutes} دقائق</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold font-headline leading-snug text-stone-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
            {article.title}
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2 font-body leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <div
            onClick={(e) => {
              if (onOpenAuthorProfile) {
                e.stopPropagation();
                onOpenAuthorProfile(article.author.name);
              }
            }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            title="عرض بروفايل المحرر"
          >
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="font-semibold text-stone-800 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400">{article.author.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Eye className="w-3 h-3 text-stone-400" />
              <span>{article.views}</span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(article.id);
              }}
              className={`p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
                isBookmarked ? 'text-amber-600' : 'text-stone-400'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
