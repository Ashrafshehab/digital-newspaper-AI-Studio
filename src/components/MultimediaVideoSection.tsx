import React, { useState } from 'react';
import { Article } from '../types/newspaper';
import { Film, Play, Clock, Eye, Sparkles, ChevronLeft } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { toWesternDigits } from './ArticleReadershipAnalytics';

interface MultimediaVideoSectionProps {
  articles: Article[];
  onOpenArticle: (article: Article) => void;
  className?: string;
}

export const MultimediaVideoSection: React.FC<MultimediaVideoSectionProps> = ({
  articles,
  onOpenArticle,
  className = ''
}) => {
  // Filter video articles
  const videoArticles = articles.filter(
    (a) => a.mediaType === 'video' || (a.tags && a.tags.includes('فيديو')) || !!a.videoUrl
  );

  // If there are no video articles, return null
  if (videoArticles.length === 0) return null;

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const activeArticle = videoArticles[activeVideoIndex] || videoArticles[0];

  return (
    <section
      aria-label="صحافة الفيديو والتقارير المصورة"
      className={`my-8 p-5 sm:p-7 rounded-2xl bg-stone-900 text-white border border-stone-800 shadow-xl overflow-hidden relative ${className}`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-600 text-white shadow-md">
              <Film className="w-4 h-4" />
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-headline text-stone-50">
              صحافة الفيديو والتقارير المصورة
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
              MUDigital Video
            </span>
          </div>
          <p className="text-xs text-stone-400 font-body">
            تغطيات بصرية، وثائقيات واستطلاعات ميدانية مصورة تنتجها غرفة الأخبار الرقمية بكلية الإعلام
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            <strong className="font-mono tabular-nums text-stone-200" style={{ fontFeatureSettings: "'locl' 0" }}>
              {toWesternDigits(videoArticles.length)}
            </strong> تقارير مصورة متاحة
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-start">
        {/* Featured Main Video Player / Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-stone-800 bg-black">
            <VideoPlayer
              src={activeArticle.videoUrl}
              poster={activeArticle.image}
              title={activeArticle.title}
              duration={activeArticle.videoDuration || '04:15'}
              sourceType={activeArticle.videoSourceType}
              aspectRatio={activeArticle.videoAspectRatio || '16:9'}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400">{activeArticle.category}</span>
                <span aria-hidden="true">·</span>
                <span>{activeArticle.publishedAt.split('·')[0]}</span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  dir="ltr"
                  lang="en"
                  style={{ fontFeatureSettings: "'locl' 0" }}
                  className="flex items-center gap-1 font-mono tabular-nums text-stone-300"
                >
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>{toWesternDigits(activeArticle.videoDuration || `${activeArticle.readTimeMinutes} دقائق`)}</span>
                </span>
                <span
                  dir="ltr"
                  lang="en"
                  style={{ fontFeatureSettings: "'locl' 0" }}
                  className="flex items-center gap-1 font-mono tabular-nums text-stone-300"
                >
                  <Eye className="w-3 h-3 text-stone-400" />
                  <span>{toWesternDigits(activeArticle.views)}</span>
                </span>
              </div>
            </div>

            <h4
              onClick={() => onOpenArticle(activeArticle)}
              className="text-base sm:text-xl font-bold font-headline leading-snug text-white hover:text-amber-400 cursor-pointer transition-colors"
            >
              {activeArticle.title}
            </h4>

            <p className="text-xs sm:text-sm text-stone-300 font-body line-clamp-2 leading-relaxed">
              {activeArticle.excerpt}
            </p>

            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-stone-400">
                إعداد وتصوير: <strong className="text-stone-200">{activeArticle.author.name}</strong>
              </span>

              <button
                type="button"
                onClick={() => onOpenArticle(activeArticle)}
                className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-stone-700"
              >
                <span>قراءة التحقيق الكامل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Playlist Sidebar (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-400 pb-2 border-b border-stone-800 flex items-center justify-between">
            <span>قائمة التقارير المصورة</span>
            <span className="text-[11px] font-mono text-amber-400">اختر للمشاهدة</span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {videoArticles.map((article, idx) => {
              const isSelected = idx === activeVideoIndex;
              return (
                <div
                  key={article.id}
                  onClick={() => setActiveVideoIndex(idx)}
                  className={`group p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                    isSelected
                      ? 'bg-stone-800/90 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/50 hover:border-stone-700'
                  }`}
                >
                  {/* Thumbnail with Mini Play Overlay */}
                  <div className="relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden bg-stone-950 shrink-0 border border-stone-800">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-transform ${
                          isSelected ? 'bg-amber-500 text-stone-950 scale-110' : 'bg-rose-600/90 text-white group-hover:scale-110'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                      </div>
                    </div>
                    {article.videoDuration && (
                      <span
                        dir="ltr"
                        lang="en"
                        style={{ fontFeatureSettings: "'locl' 0" }}
                        className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono tabular-nums px-1.5 py-0.2 rounded text-white"
                      >
                        {toWesternDigits(article.videoDuration)}
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 block truncate">
                      {article.category}
                    </span>
                    <h5
                      className={`text-xs font-bold font-headline line-clamp-2 leading-snug transition-colors ${
                        isSelected ? 'text-amber-300' : 'text-stone-200 group-hover:text-white'
                      }`}
                    >
                      {article.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400">
                      <span>{article.author.name.split(' ')[0]}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        dir="ltr"
                        lang="en"
                        style={{ fontFeatureSettings: "'locl' 0" }}
                        className="font-mono tabular-nums"
                      >
                        {toWesternDigits(article.views)} مشاهدة
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
