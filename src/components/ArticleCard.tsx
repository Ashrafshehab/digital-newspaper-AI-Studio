import React from 'react';
import { Article, SocialMediaAccounts } from '../types/newspaper';
import { Eye, Bookmark, ShieldCheck, BarChart2, Video, Headphones, Play } from 'lucide-react';
import { ArticleShareButtons } from './ArticleShareButtons';
import { toWesternDigits } from './ArticleReadershipAnalytics';

interface ArticleCardProps {
  article: Article;
  onOpen: (article: Article) => void;
  onToggleBookmark: (id: string) => void;
  isBookmarked: boolean;
  onOpenAuthorProfile?: (authorName: string) => void;
  onSelectTag?: (tag: string) => void;
  socialAccounts?: SocialMediaAccounts;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onOpen,
  onToggleBookmark,
  isBookmarked,
  onOpenAuthorProfile,
  onSelectTag,
  socialAccounts
}) => {
  return (
    <article
      onClick={() => onOpen(article)}
      className="group cursor-pointer flex flex-col justify-between rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="relative aspect-16/10 bg-stone-200 dark:bg-stone-800 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className={`w-full h-full transition-transform duration-300 group-hover:scale-103 ${
            article.mediaType === 'infographic' || article.imageDisplayMode === 'infographic_vertical'
              ? 'object-contain bg-stone-950 p-1'
              : 'object-cover'
          }`}
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
        {(article.mediaType === 'video' || !!article.videoUrl) && (
          <>
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>
            <div className="absolute bottom-2.5 right-2.5 bg-rose-700/95 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 z-10">
              <Video className="w-3 h-3 text-rose-200" />
              <span>تقرير مصور (فيديو)</span>
            </div>
          </>
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
            <span
              dir="ltr"
              lang="en"
              style={{ fontFeatureSettings: "'locl' 0" }}
              className="font-mono tabular-nums"
            >
              {article.videoDuration
                ? `${toWesternDigits(article.videoDuration)} دقيقة`
                : `${toWesternDigits(article.readTimeMinutes)} دقائق`}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold font-headline leading-snug text-stone-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
            {article.title}
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2 font-body leading-relaxed">
            {article.excerpt}
          </p>

          {/* Hashtags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {article.tags.slice(0, 3).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    if (onSelectTag) {
                      e.stopPropagation();
                      onSelectTag(tag);
                    }
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-amber-950/50 text-stone-600 hover:text-amber-800 dark:text-stone-300 dark:hover:text-amber-300 transition-colors cursor-pointer border border-stone-200/80 dark:border-stone-700/80"
                  title={`تصفية كل المقالات الموسومة بـ #${tag}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
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
            <ArticleShareButtons article={article} socialAccounts={socialAccounts} layout="compact" />
            <span className="flex items-center gap-1 font-mono text-[11px] text-stone-400 pl-1 border-l border-stone-200 dark:border-stone-800">
              <Eye className="w-3 h-3" />
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
              title={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ المقال'}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
