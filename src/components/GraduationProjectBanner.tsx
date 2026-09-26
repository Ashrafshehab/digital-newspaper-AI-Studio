import React, { useState } from 'react';
import { GraduationCap, Award, Users, BookOpen, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { GraduationProjectInfo } from '../types/newspaper';

interface GraduationProjectBannerProps {
  info: GraduationProjectInfo;
  isOpenDefault?: boolean;
}

export const GraduationProjectBanner: React.FC<GraduationProjectBannerProps> = ({
  info,
  isOpenDefault = false
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <section className="bg-stone-100/90 dark:bg-stone-900/90 border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  مشروع تخرج قسم الصحافة الرقمية 2026
                </span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                  {info.university}
                </span>
              </div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {info.projectTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-800 px-2.5 py-1 rounded border border-stone-200 dark:border-stone-700">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>إشراف: {info.supervisor}</span>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white px-2.5 py-1 rounded hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <span>{isOpen ? 'إخفاء بطاقة المشروع' : 'استعراض تفاصيل المشروع ونظام النشر الثلاثي'}</span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Column 1: Summary & Objectives */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>ملخص فكرة المشروع ونظام دورة النشر التحريرية</span>
                </h3>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-body">
                  {info.summary}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                  الأهداف والابتكارات المطبقة في نموذج MUDigital
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 dark:text-stone-300">
                  {info.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white/70 dark:bg-stone-800/60 p-2 rounded border border-stone-200/60 dark:border-stone-700/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Team Members & Academic Supervisor */}
            <div className="bg-white dark:bg-stone-800/80 p-4 rounded-lg border border-stone-200 dark:border-stone-700/70 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-700">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>فريق العمل من الطلاب</span>
                </span>
                <span className="text-[11px] text-stone-500 font-mono">دفعة 2026</span>
              </div>

              <div className="space-y-2">
                {info.teamMembers.map((member) => (
                  <div key={member.code} className="text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">{member.name}</span>
                      <p className="text-[11px] text-stone-500">{member.role}</p>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded">
                      {member.code}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400">
                <span className="font-semibold text-stone-900 dark:text-stone-200 block">المشرف الأكاديمي:</span>
                <span>{info.supervisor}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
