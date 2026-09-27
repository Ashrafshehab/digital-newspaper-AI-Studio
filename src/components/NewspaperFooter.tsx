import React from 'react';
import { ArrowUp, Award, ShieldCheck } from 'lucide-react';
import { GraduationProjectInfo } from '../types/newspaper';

interface NewspaperFooterProps {
  info: GraduationProjectInfo;
  onOpenGraduationInfo: () => void;
  onSelectCategory: (id: string) => void;
  onOpenEditorialPortal: () => void;
}

export const NewspaperFooter: React.FC<NewspaperFooterProps> = ({
  info,
  onOpenGraduationInfo,
  onSelectCategory,
  onOpenEditorialPortal
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t-2 border-stone-900 dark:border-stone-700 bg-stone-100 dark:bg-[#0c0d0e] transition-colors mt-16 text-stone-700 dark:text-stone-300">
      
      {/* Top Footer Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-200 dark:border-stone-800">
          
          {/* Brand & Academic Identity */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="font-headline text-3xl sm:text-4xl font-black text-stone-950 dark:text-white">
              صحيفة MUDigital
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-body leading-relaxed max-w-lg">
              قالب صحيفة إلكترونية متكامل بأسلوب عصري، تم تصميمه وتطويره كمشروع تخرج تطبيقي لقسم الصحافة الرقمية بكلية الإعلام، يطبق دورة تحريرية صارمة تمر بثلاث مراحل تدقيق (رئيس القسم ثم المصحح اللغوي ثم إجازة مدير التحرير للنشر).
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={onOpenGraduationInfo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 rounded border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>بيانات مشروع التخرج ولجنة التحكيم</span>
              </button>

              <button
                onClick={onOpenEditorialPortal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-200/50 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                <span>دخول بوابة التحرير والنشر</span>
              </button>
            </div>
          </div>

          {/* Quick Categories Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
              أقسام الصحيفة
            </h3>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <button
                  onClick={() => onSelectCategory('multimedia')}
                  className="hover:text-stone-950 dark:hover:text-white cursor-pointer font-semibold text-amber-700 dark:text-amber-400"
                >
                  وسائط وملتيميديا (إنفوجرافيك وفيديو)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('investigations')}
                  className="hover:text-stone-950 dark:hover:text-white cursor-pointer"
                >
                  تقارير وتحقيقات
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('campus')}
                  className="hover:text-stone-950 dark:hover:text-white cursor-pointer"
                >
                  نبض الجامعة وشؤون الطلاب
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('technology')}
                  className="hover:text-stone-950 dark:hover:text-white cursor-pointer"
                >
                  تقنية وذكاء اصطناعي
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('culture')}
                  className="hover:text-stone-950 dark:hover:text-white cursor-pointer"
                >
                  ثقافة وتراث ومجتمع
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('opinion')}
                  className="hover:text-stone-950 dark:hover:text-white cursor-pointer"
                >
                  أقلام وأعمدة الرأي
                </button>
              </li>
            </ul>
          </div>

          {/* Journalistic Charter */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ميثاق الشرف الصحفي</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-body leading-relaxed">
              تلتزم صحيفة MUDigital بالدقة المهنية، التحقق المستقل من المصادر، النزاهة التحريرية، والامتناع عن النشر العشوائي قبل استيفاء مراحل التدقيق الثلاث.
            </p>
            <div className="pt-2 text-xs text-stone-500">
              <span>إشراف أكاديمي: </span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{info.supervisor}</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Scroll to Top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>© 2026 صحيفة MUDigital - جميع الحقوق محفوظة لطلاب قسم الصحافة والنشر الرقمي.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-white dark:bg-stone-800 px-3 py-1.5 rounded border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
          >
            <span>العودة لأعلى الصفحة</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
