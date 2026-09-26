import React, { useState, useEffect } from 'react';
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
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  if (!items || items.length === 0) return null;

  return (
    <div
      className="bg-red-700 text-white py-2 px-4 sm:px-8 border-y border-red-800 transition-colors"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-sm">
        
        {/* Urgent Badge & Icon */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="font-bold tracking-wider text-xs uppercase bg-red-900/60 px-2 py-0.5 rounded text-white flex items-center gap-1">
            <Bell className="w-3 h-3" />
            <span>عاجل</span>
          </span>
        </div>

        {/* Dynamic Rotating Headline */}
        <div className="flex-1 overflow-hidden">
          <button
            onClick={() => onSelectHeadline(items[currentIndex])}
            className="w-full text-right truncate hover:underline cursor-pointer font-medium text-xs sm:text-sm text-red-50 hover:text-white transition-all block"
            title="انقر لقراءة التفاصيل"
          >
            {items[currentIndex]}
          </button>
        </div>

        {/* Ticker Controls */}
        <div className="flex items-center gap-1 shrink-0 text-red-200">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 hover:text-white hover:bg-red-800 rounded transition-colors"
            title={isPaused ? 'استئناف الحركة' : 'إيقاف مؤقت'}
            aria-label={isPaused ? 'استئناف الحركة' : 'إيقاف مؤقت'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handlePrev}
            className="p-1 hover:text-white hover:bg-red-800 rounded transition-colors"
            title="الخبر السابق"
            aria-label="الخبر السابق"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleNext}
            className="p-1 hover:text-white hover:bg-red-800 rounded transition-colors"
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
