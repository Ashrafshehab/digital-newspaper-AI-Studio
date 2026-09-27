import React from 'react';
import { LayoutGrid, Columns3, List, SlidersHorizontal } from 'lucide-react';
import { Category } from '../types/newspaper';

interface NavigationCategoriesProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  viewMode: 'grid' | 'broadsheet' | 'compact';
  onChangeViewMode: (mode: 'grid' | 'broadsheet' | 'compact') => void;
  totalArticlesCount: number;
}

export const NavigationCategories: React.FC<NavigationCategoriesProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  viewMode,
  onChangeViewMode,
  totalArticlesCount
}) => {
  // Defensive deduplication to ensure exactly one tab exists per name/id
  const uniqueCategories = React.useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((cat) => {
      const key = `${cat.id}-${cat.name.trim().toLowerCase()}`;
      if (seen.has(key) || seen.has(cat.name.trim().toLowerCase())) {
        return false;
      }
      seen.add(key);
      seen.add(cat.name.trim().toLowerCase());
      return true;
    });
  }, [categories]);

  return (
    <div className="sticky top-0 z-30 bg-[#FBF9F5]/95 dark:bg-[#0c0d0e]/95 backdrop-blur-md border-b border-stone-300 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between gap-4 py-2 overflow-x-auto no-scrollbar">
          
          {/* Categories Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
            {uniqueCategories.map((cat) => {
              const isActive = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                      : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800/60'
                  }`}
                >
                  {cat.name}
                  {cat.id === 'all' && (
                    <span className="mr-1 text-[11px] opacity-70">
                      ({totalArticlesCount})
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* View Mode Switcher (Grid / Broadsheet / Compact) */}
          <div className="hidden md:flex items-center gap-1 bg-stone-200/60 dark:bg-stone-900 p-1 rounded-lg border border-stone-200 dark:border-stone-800 shrink-0">
            <span className="text-[11px] font-medium text-stone-500 px-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>العرض:</span>
            </span>

            <button
              onClick={() => onChangeViewMode('grid')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="نمط الشبكة العصرية"
              aria-label="نمط الشبكة العصرية"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onChangeViewMode('broadsheet')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'broadsheet'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="نمط الجريدة الكلاسيكية (أعمدة تحريرية)"
              aria-label="نمط الجريدة الكلاسيكية"
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onChangeViewMode('compact')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="نمط التصفح السريع المكثف"
              aria-label="نمط التصفح السريع المكثف"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
