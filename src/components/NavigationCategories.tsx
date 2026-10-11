import React from 'react';
import { Category } from '../types/newspaper';

interface NavigationCategoriesProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  totalArticlesCount: number;
}

export const NavigationCategories: React.FC<NavigationCategoriesProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
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

        </div>
      </div>
    </div>
  );
};
