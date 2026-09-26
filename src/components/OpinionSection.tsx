import React from 'react';
import { OPINION_COLUMNS } from '../data/mockArticles';
import { Quote, Feather } from 'lucide-react';
import { Article } from '../types/newspaper';

interface OpinionSectionProps {
  onOpenQuickOpinion: (op: typeof OPINION_COLUMNS[0]) => void;
}

export const OpinionSection: React.FC<OpinionSectionProps> = ({ onOpenQuickOpinion }) => {
  return (
    <section className="my-8 py-6 border-y border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/30 -mx-4 sm:-mx-8 px-4 sm:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold font-headline text-stone-900 dark:text-stone-100">
              أعمدة الرأي والمقالات الفكرية
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-medium">مساحة حرية التعبير الجامعي</span>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OPINION_COLUMNS.map((col) => (
            <div
              key={col.id}
              onClick={() => onOpenQuickOpinion(col)}
              className="group cursor-pointer bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-col justify-between hover:border-amber-600/50 dark:hover:border-amber-500/50 transition-all shadow-xs"
            >
              <div className="space-y-3">
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={col.avatar}
                    alt={col.authorName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-stone-200 dark:border-stone-700 group-hover:border-amber-500 transition-colors"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-stone-950 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      {col.authorName}
                    </h3>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{col.authorTitle}</p>
                  </div>
                </div>

                {/* Column Title */}
                <h4 className="text-base font-bold font-headline text-stone-900 dark:text-stone-200 leading-snug">
                  {col.title}
                </h4>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-editorial italic leading-relaxed line-clamp-3 bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded border-r-2 border-amber-600">
                  {col.quote}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <span>وقت القراءة: {col.readTime}</span>
                <span className="text-amber-700 dark:text-amber-400 font-medium group-hover:underline">
                  قراءة المقال الكامل ←
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
