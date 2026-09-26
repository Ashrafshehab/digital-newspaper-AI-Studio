import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Bookmark,
  Search,
  Lock,
  GraduationCap,
  CloudSun,
  Calendar,
  ChevronDown
} from 'lucide-react';

interface MastheadProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  bookmarksCount: number;
  onOpenBookmarks: () => void;
  onOpenEditorialPortal: () => void;
  onOpenGraduationInfo: () => void;
  onSearchClick: () => void;
  loggedInUserRoleTitle?: string;
}

const CITIES_WEATHER = [
  { city: 'القاهرة', temp: '28°م', condition: 'مشمس معتدل' },
  { city: 'الرياض', temp: '34°م', condition: 'صحو' },
  { city: 'دبي', temp: '32°م', condition: 'رطب جزئيا' },
  { city: 'عمان', temp: '25°م', condition: 'معتدل' },
  { city: 'بغداد', temp: '31°م', condition: 'صاف' }
];

export const Masthead: React.FC<MastheadProps> = ({
  darkMode,
  onToggleDarkMode,
  bookmarksCount,
  onOpenBookmarks,
  onOpenEditorialPortal,
  onOpenGraduationInfo,
  onSearchClick,
  loggedInUserRoleTitle
}) => {
  const [cityIndex, setCityIndex] = useState(0);
  const [currentDateString, setCurrentDateString] = useState('');
  const [hijriDateString, setHijriDateString] = useState('');

  useEffect(() => {
    const toWesternDigits = (str: string) => {
      const eastern = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return str.replace(/[٠-٩]/g, (w) => String(eastern.indexOf(w)));
    };

    const now = new Date();
    const gregorianOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    try {
      const greg = now.toLocaleDateString('ar-EG-u-nu-latn', gregorianOptions);
      setCurrentDateString(toWesternDigits(greg));
    } catch {
      setCurrentDateString(toWesternDigits(now.toLocaleDateString('ar-EG', gregorianOptions)));
    }
    
    try {
      const hijriOptions: Intl.DateTimeFormatOptions = {
        calendar: 'islamic-umalqura',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      const hijri = now.toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-latn', hijriOptions);
      setHijriDateString(toWesternDigits(hijri));
    } catch {
      setHijriDateString('14 ربيع الآخر 1448 هـ');
    }
  }, []);

  const currentWeather = CITIES_WEATHER[cityIndex];

  const handleNextCity = () => {
    setCityIndex((prev) => (prev + 1) % CITIES_WEATHER.length);
  };

  return (
    <header className="border-b border-stone-200 dark:border-stone-800 bg-[#FBF9F5] dark:bg-[#0c0d0e] transition-colors">
      {/* 1. Top Operational Utility Ribbon */}
      <div className="border-b border-stone-200/80 dark:border-stone-800/80 text-xs text-stone-600 dark:text-stone-400 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Date & Location in RTL */}
          <div className="flex items-center gap-3 text-[13px]">
            <div className="flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>{currentDateString || 'الجمعة 25 سبتمبر 2026'}</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span className="text-stone-500 dark:text-stone-400">{hijriDateString || '14 ربيع الآخر 1448 هـ'}</span>
            </div>

            <button
              onClick={handleNextCity}
              title="انقر لتبديل المدينة"
              className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-400 cursor-pointer"
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentWeather.city}</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{currentWeather.temp}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>
          </div>

          {/* Quick Actions & Editorial Portal Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Graduation Capstone Button */}
            <button
              onClick={onOpenGraduationInfo}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
              title="استعراض تفاصيل وبطاقة مشروع التخرج"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>مشروع تخرج 2026</span>
            </button>

            {/* Editorial Control Panel & Publishing Portal (Protected) */}
            <button
              onClick={onOpenEditorialPortal}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-stone-900 dark:text-stone-100 bg-amber-500/20 hover:bg-amber-500/30 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 border border-amber-500/40 rounded-md transition-colors cursor-pointer"
              title="لوحة التحكم المحمية بكلمة سر لنشر ومراجعة المقالات"
            >
              <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>{loggedInUserRoleTitle ? `لوحة التحكم (${loggedInUserRoleTitle})` : 'لوحة التحكم بالنشر'}</span>
            </button>

            {/* Bookmarks Counter */}
            <button
              onClick={onOpenBookmarks}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer relative"
              title="المقالات المحفوظة للقراءة لاحقا"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">المحفوظات</span>
              {bookmarksCount > 0 && (
                <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {bookmarksCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label={darkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
              title={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>
          </div>

        </div>
      </div>

      {/* 2. Main Newspaper Masthead Zone */}
      <div className="py-6 sm:py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Side Editorial Info (Left on desktop) */}
          <div className="hidden lg:flex flex-col text-right text-xs text-stone-500 dark:text-stone-400 border-l border-stone-200 dark:border-stone-800 pl-6 leading-relaxed">
            <span className="font-semibold text-stone-800 dark:text-stone-200">النسخة الرقمية المتطورة</span>
            <span>العدد التأسيسي الأول · رقم الإيداع الجامعي 2026/04</span>
            <span className="text-amber-700 dark:text-amber-400">قسم الصحافة الرقمية - كلية الإعلام</span>
          </div>

          {/* Central Newspaper Logo Wordmark: MUDigital */}
          <div className="text-center flex flex-col items-center">
            <a href="/" className="group inline-flex flex-col items-center">
              <span className="font-headline text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-stone-900 dark:text-white transition-colors">
                MUDigital
              </span>
              <span className="text-xs sm:text-sm font-headline tracking-widest text-stone-600 dark:text-stone-400 mt-1 uppercase">
                صحيفة إلكترونية جامعية مستقلة · صوت الحقيقة وفكر الشباب
              </span>
            </a>
          </div>

          {/* Side Quick Search */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            <button
              onClick={onSearchClick}
              className="flex items-center gap-2 px-4 py-2 text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200/70 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700/60 rounded-md transition-all w-full sm:w-64 justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-stone-400" />
                <span>ابحث في الأخبار والتحقيقات...</span>
              </span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-stone-500 bg-stone-200 dark:bg-stone-800 rounded border border-stone-300 dark:border-stone-700">
                /
              </kbd>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
