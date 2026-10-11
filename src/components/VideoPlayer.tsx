import React, { useState, useRef, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, Film, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { toWesternDigits } from './ArticleReadershipAnalytics';

export const DEFAULT_LOCAL_BACKUP_VIDEO = '/videos/campus-documentary.mp4';

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  duration?: string;
  sourceType?: 'upload' | 'youtube' | 'direct_url';
  aspectRatio?: '16:9' | '9:16';
  className?: string;
  autoPlay?: boolean;
}

// Helper to extract YouTube video ID from various link formats (shorts, watch, live, embed, youtu.be)
export const extractYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  const cleanUrl = url.trim();
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
  const match = cleanUrl.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  duration,
  sourceType,
  aspectRatio = '16:9',
  className = '',
  autoPlay = false
}) => {
  const [activeSrc, setActiveSrc] = useState<string>(src || '');
  const [isUsingBackup, setIsUsingBackup] = useState(false);
  const [hasStarted, setHasStarted] = useState(autoPlay);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [loadError, setLoadError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync state when src prop changes
  React.useEffect(() => {
    setActiveSrc(src || '');
    setIsUsingBackup(false);
    setHasStarted(autoPlay);
    setIsPlaying(autoPlay);
    setLoadError(false);
  }, [src, autoPlay]);

  // Check if YouTube
  const youtubeId = useMemo(() => {
    if (!activeSrc) return null;
    return extractYouTubeId(activeSrc);
  }, [activeSrc]);

  const isYouTube = !!youtubeId;
  const isVertical = aspectRatio === '9:16';

  const handleStartPlay = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setLoadError(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy or media load exception
      });
    }
  };

  const handleSwitchToBackup = () => {
    setActiveSrc(DEFAULT_LOCAL_BACKUP_VIDEO);
    setIsUsingBackup(true);
    setLoadError(false);
    setHasStarted(true);
    setIsPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    }, 150);
  };

  const handleRetry = () => {
    setLoadError(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  // If no source is provided
  if (!activeSrc) {
    return (
      <div
        className={`relative ${
          isVertical ? 'aspect-9/16 max-w-xs mx-auto' : 'aspect-video w-full'
        } rounded-xl bg-stone-900 border border-stone-800 overflow-hidden flex flex-col items-center justify-center p-6 text-center ${className}`}
      >
        {poster && (
          <img
            src={poster}
            alt={title || 'غلاف الفيديو'}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-10 space-y-2">
          <div className="w-14 h-14 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center mx-auto border border-stone-700">
            <Film className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-stone-200">التقرير المصور (فيديو)</p>
          <p className="text-xs text-stone-400 max-w-sm">
            يمكن لمدير التحرير أو كاتب المادة رفع ملف فيديو أو إدراج رابط يوتيوب عبر لوحة التحكم.
          </p>
          <button
            type="button"
            onClick={handleSwitchToBackup}
            className="mt-2 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>تشغيل نموذج الفيديو المعتمد للمجلة</span>
          </button>
        </div>
      </div>
    );
  }

  // 1. YouTube Player
  if (isYouTube && youtubeId) {
    if (!hasStarted) {
      // Cover state before clicking play
      return (
        <div
          onClick={handleStartPlay}
          className={`relative ${
            isVertical ? 'aspect-9/16 max-w-xs mx-auto' : 'aspect-video w-full'
          } rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shadow-md group cursor-pointer ${className}`}
        >
          {/* Poster or YouTube thumbnail */}
          <img
            src={poster || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
            alt={title || 'تقرير مصور'}
            className="w-full h-full object-cover opacity-85 group-hover:opacity-75 transition-opacity"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 flex flex-col justify-between p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                <Play className="w-3 h-3 fill-white" />
                <span>تقرير مصور (YouTube HD)</span>
              </span>
              {duration && (
                <span
                  dir="ltr"
                  lang="en"
                  style={{ fontFeatureSettings: "'locl' 0" }}
                  className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[11px] font-mono tabular-nums text-white"
                >
                  {toWesternDigits(duration)}
                </span>
              )}
            </div>

            <div className="flex flex-col items-center justify-center my-auto">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-rose-500 transition-all">
                <Play className="w-8 sm:w-10 h-8 sm:h-10 fill-white ml-1" />
              </div>
              <span className="mt-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-xs text-xs font-bold text-white shadow-sm">
                انقر لبدء تشغيل التقرير
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              {title && (
                <p className="text-xs sm:text-sm font-bold font-headline text-stone-200 line-clamp-1">
                  {title}
                </p>
              )}
              <a
                href={`https://www.youtube.com/watch?v=${youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] text-stone-300 hover:text-white flex items-center gap-1 bg-black/60 px-2 py-1 rounded shrink-0 backdrop-blur-xs"
              >
                <span>فتح في YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Active YouTube Embed iframe
    return (
      <div
        className={`relative ${
          isVertical ? 'aspect-9/16 max-w-xs mx-auto' : 'aspect-video w-full'
        } rounded-xl overflow-hidden bg-black border border-stone-800 shadow-md ${className}`}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title || 'YouTube video player'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
        <div className="absolute bottom-2 left-2 z-10">
          <a
            href={`https://www.youtube.com/watch?v=${youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded bg-black/70 hover:bg-black/90 text-stone-300 hover:text-white text-[10px] font-bold inline-flex items-center gap-1 backdrop-blur-xs transition-colors"
          >
            <span>مشاهدة في YouTube</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    );
  }

  // 2. Native HTML5 Video Player (Local MP4/WebM, Uploaded File, or Direct URL)
  return (
    <div
      className={`relative ${
        isVertical ? 'aspect-9/16 max-w-xs mx-auto' : 'aspect-video w-full'
      } rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shadow-md group ${className}`}
    >
      <video
        key={activeSrc}
        ref={videoRef}
        src={activeSrc}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        onPlay={() => {
          setIsPlaying(true);
          setLoadError(false);
        }}
        onPause={() => setIsPlaying(false)}
        onError={() => setLoadError(true)}
        className="w-full h-full object-contain bg-black"
      >
        <track kind="captions" />
        متصفحك لا يدعم تشغيل هذا التقرير المصور مباشرة.
      </video>

      {/* Backup Notification Badge */}
      {isUsingBackup && !loadError && (
        <div className="absolute top-3 left-3 bg-emerald-950/90 border border-emerald-600/50 text-emerald-300 text-[11px] px-2.5 py-1 rounded-md z-10 backdrop-blur-xs flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>النسخة المحلية البديلة للمجلة (متاحة بنجاح)</span>
        </div>
      )}

      {/* Error & Recovery State */}
      {loadError && (
        <div className="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
          <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mb-1">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-stone-100 font-headline">
            تعذر تشغيل هذا التقرير المصور من الرابط الحالي
          </p>
          <p className="text-xs text-stone-400 max-w-md leading-relaxed">
            قد يكون رابط الفيديو مقيداً بحقوق البث أو يواجه انقطاعاً مؤقتاً. يمكنك تشغيل النسخة المحلية المعتمدة للمجلة فوراً أو إعادة المحاولة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleSwitchToBackup}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-colors"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>تشغيل التقرير البديل المتاح محلياً</span>
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1.5 border border-stone-700 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>
            {activeSrc && (activeSrc.startsWith('http://') || activeSrc.startsWith('https://')) && (
              <a
                href={activeSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-stone-800 transition-colors"
              >
                <span>فتح الرابط الأصلي</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Top badges bar (Visible before playing) */}
      {!hasStarted && !loadError && (
        <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
            <Film className="w-3 h-3" />
            <span>تقرير مصور (فيديو MUDigital)</span>
          </span>
          {duration && (
            <span
              dir="ltr"
              lang="en"
              style={{ fontFeatureSettings: "'locl' 0" }}
              className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[11px] font-mono tabular-nums text-white"
            >
              {toWesternDigits(duration)}
            </span>
          )}
        </div>
      )}

      {/* Center play button prompt if not started */}
      {!hasStarted && !loadError && (
        <div
          onClick={handleStartPlay}
          className="absolute inset-0 bg-black/35 group-hover:bg-black/45 flex flex-col items-center justify-center cursor-pointer transition-colors z-10"
        >
          <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-rose-500 transition-all">
            <Play className="w-8 sm:w-10 h-8 sm:h-10 fill-white ml-1" />
          </div>
          <span className="mt-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-xs text-xs font-bold text-white shadow-sm">
            مشاهدة التقرير المصور
          </span>
        </div>
      )}
    </div>
  );
};
