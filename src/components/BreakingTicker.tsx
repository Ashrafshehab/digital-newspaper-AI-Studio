import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronRight, ChevronLeft, Pause, Play } from 'lucide-react';

interface BreakingTickerProps {
  items: string[];
  onSelectHeadline: (headline: string) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  items,
  onSelectHeadline
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const currentHeadline = items[currentIndex] || '';

  useEffect(() => {
    if (!items || items.length === 0) return;

    let timer: NodeJS.Timeout;

    if (isVisible) {
      // 1. يثبت الخبر مستقراً تماماً لمدة 5 ثوانٍ، ثم ينسحب ببطء وهدوء لليمين لمدة 3.2 ثوانٍ (إجمالي 8.2 ثوانٍ)
      timer = setTimeout(() => {
        if (!isPausedRef.current) {
          setIsVisible(false);
        }
      }, 8200);
    } else {
      // 2. فترة انتظار 2 ثانية بالضبط قبل ظهور الخبر التالي في شريط عاجل
      timer = setTimeout(() => {
        if (!isPausedRef.current) {
          setCurrentIndex((prev) => (prev + 1) % items.length);
          setIsVisible(true);
        }
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [isVisible, currentIndex, items]);

  const handleNext = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setIsVisible(true);
    }, 100);
  };

  const handlePrev = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      setIsVisible(true);
    }, 100);
  };

  return (
    <div
      className="bg-red-700 text-white py-2 px-3 sm:px-6 border-y border-red-800 transition-colors select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-sm">
        
        {/* Urgent Badge & Icon (Fixed on Right in RTL) */}
        <div className="flex items-center gap-2 shrink-0 z-10 bg-red-700 pr-1 pl-3 border-l border-red-600/40">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span className="font-bold tracking-wider text-xs uppercase bg-red-900/80 px-2 py-0.5 rounded text-white flex items-center gap-1.5 shadow-xs">
            <Bell className="w-3.5 h-3.5 text-amber-300" />
            <span>عاجل</span>
          </span>
        </div>

        {/* Viewport for Single Headline scrolling gently from Left to Right with full reading comfort */}
        <div className="flex-1 overflow-hidden relative h-6 flex items-center" dir="rtl">
          {isVisible && (
            <div
              key={`${currentIndex}-${currentHeadline}`}
              className={`w-full whitespace-nowrap animate-headline-stay-exit ${
                isPaused ? 'is-paused' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectHeadline(currentHeadline)}
                className="text-xs sm:text-sm font-medium text-red-50 hover:text-amber-200 transition-colors cursor-pointer hover:underline inline-flex items-center gap-2"
                title="انقر لقراءة التفاصيل الكاملة"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 inline-block" />
                <span>{currentHeadline}</span>
              </button>
            </div>
          )}
        </div>

        {/* Controls: Play/Pause, Next & Prev with index indicator */}
        <div className="flex items-center gap-1 shrink-0 text-red-200 z-10 bg-red-700 pl-1 pr-3 border-r border-red-600/40">
          <span className="text-[10px] font-mono opacity-70 hidden sm:inline ml-1">
            {currentIndex + 1}/{items.length}
          </span>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 hover:text-white hover:bg-red-800/80 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            title={isPaused ? 'استئناف تمرير الخبر' : 'تثبيت الخبر للقراءة'}
            aria-label={isPaused ? 'استئناف تمرير الخبر' : 'تثبيت الخبر للقراءة'}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">استئناف</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">إيقاف</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrev}
            className="p-1 hover:text-white hover:bg-red-800/80 rounded transition-colors cursor-pointer"
            title="الخبر السابق"
            aria-label="الخبر السابق"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleNext}
            className="p-1 hover:text-white hover:bg-red-800/80 rounded transition-colors cursor-pointer"
            title="الخبر التالي"
            aria-label="الخبر التالي"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
