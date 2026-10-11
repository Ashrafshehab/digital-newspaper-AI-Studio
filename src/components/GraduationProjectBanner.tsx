import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Edit3,
  X,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Check
} from 'lucide-react';
import { GraduationProjectInfo } from '../types/newspaper';
import { GRADUATION_PROJECT_INFO } from '../data/mockArticles';

interface GraduationProjectBannerProps {
  info: GraduationProjectInfo;
  isOpenDefault?: boolean;
  onUpdateInfo?: (updated: GraduationProjectInfo) => void;
}

export const GraduationProjectBanner: React.FC<GraduationProjectBannerProps> = ({
  info,
  isOpenDefault = false,
  onUpdateInfo
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<GraduationProjectInfo>(info);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleOpenEdit = () => {
    setFormData(JSON.parse(JSON.stringify(info)));
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateInfo) {
      onUpdateInfo(formData);
    }
    setIsEditModalOpen(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('هل تريد بالتأكيد استعادة بيانات المشروع الافتراضية؟')) {
      setFormData(JSON.parse(JSON.stringify(GRADUATION_PROJECT_INFO)));
    }
  };

  // Team member handlers
  const handleAddMember = () => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        { name: '', role: 'محرر ومسؤول محتوى', code: `ST-${Date.now().toString().slice(-6)}` }
      ]
    }));
  };

  const handleUpdateMember = (index: number, field: 'name' | 'role' | 'code', value: string) => {
    setFormData((prev) => {
      const updated = [...prev.teamMembers];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, teamMembers: updated };
    });
  };

  const handleRemoveMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  // Objectives handlers
  const handleAddObjective = () => {
    setFormData((prev) => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const handleUpdateObjective = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.objectives];
      updated[index] = value;
      return { ...prev, objectives: updated };
    });
  };

  const handleRemoveObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  return (
    <section className="bg-stone-100/90 dark:bg-stone-900/90 border-b border-stone-200 dark:border-stone-800 transition-colors relative">
      {/* Toast Feedback */}
      {showSavedToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>تم حفظ بيانات مشروع التخرج وفريق العمل بنجاح!</span>
        </div>
      )}

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

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-800 px-2.5 py-1 rounded border border-stone-200 dark:border-stone-700">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>إشراف: {info.supervisor}</span>
            </div>

            {/* Edit Button */}
            <button
              type="button"
              onClick={handleOpenEdit}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-md border border-amber-500/30 transition-colors cursor-pointer shadow-xs"
              title="تعديل بيانات مشروع التخرج وفريق العمل"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل بيانات المشروع</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white px-2.5 py-1 rounded hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <span>{isOpen ? 'إخفاء بطاقة المشروع' : 'استعراض تفاصيل المشروع ونظام النشر'}</span>
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
                {info.teamMembers.map((member, index) => (
                  <div key={`${member.code}-${index}`} className="text-xs flex items-center justify-between">
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

      {/* Edit Graduation Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-headline text-stone-900 dark:text-stone-50">
                    تعديل بطاقة مشروع التخرج وفريق العمل
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    يمكنك إدخال بيانات جامعتك، عنوان المشروع، المشرف الأكاديمي، وقائمة الطلاب الفعلية.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-right" dir="rtl">
              {/* Section 1: Academic Data */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-stone-200 dark:border-stone-800">
                  <BookOpen className="w-4 h-4" />
                  <span>البيانات الأكاديمية والجامعية</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      اسم الجامعة
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      placeholder="مثال: جامعة المنوفية - كلية الإعلام"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      الكلية
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.faculty}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      placeholder="مثال: كلية الإعلام وفنون الاتصال"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      القسم العلمي
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="مثال: قسم الصحافة الرقمية والإلكترونية"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      العام الجامعي
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      placeholder="مثال: العام الجامعي 2025 / 2026"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    عنوان المشروع الكامل
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    placeholder="مثال: مشروع تخرج: صحيفة MUDigital - نظام غرف الأخبار الرقمية"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    المشرف الأكاديمي (الاسم والدرجة العلمية)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                    placeholder="مثال: أ.د. عبد الرحمن الشريف (أستاذ تكنولوجيا الصحافة والنشر الرقمي)"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Section 2: Summary & Objectives */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-stone-200 dark:border-stone-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ملخص فكرة المشروع والأهداف</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ملخص فكرة المشروع ونظام دورة النشر
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-body"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      أهداف وابتكارات المشروع
                    </label>
                    <button
                      type="button"
                      onClick={handleAddObjective}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة هدف</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.objectives.map((obj, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={obj}
                          onChange={(e) => handleUpdateObjective(i, e.target.value)}
                          placeholder={`الهدف رقم ${i + 1}`}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        {formData.objectives.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveObjective(i)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="حذف هذا الهدف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Student Team Members */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-stone-200 dark:border-stone-800">
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>فريق العمل من الطلاب ({formData.teamMembers.length} طلاب)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة طالب جديد</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-stone-500 dark:text-stone-400 mb-0.5">
                          اسم الطالب الرباعي
                        </label>
                        <input
                          type="text"
                          required
                          value={member.name}
                          onChange={(e) => handleUpdateMember(index, 'name', e.target.value)}
                          placeholder="اسم الطالب"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-stone-500 dark:text-stone-400 mb-0.5">
                          الدور أو التخصص في المشروع
                        </label>
                        <input
                          type="text"
                          required
                          value={member.role}
                          onChange={(e) => handleUpdateMember(index, 'role', e.target.value)}
                          placeholder="مثال: مسؤول التحقيقات وصحافة البيانات"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-stone-500 dark:text-stone-400 mb-0.5">
                          كود الطالب / الرقم الجامعي
                        </label>
                        <input
                          type="text"
                          value={member.code}
                          onChange={(e) => handleUpdateMember(index, 'code', e.target.value)}
                          placeholder="مثال: ST-20220412"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-1 flex items-center justify-center pt-3 sm:pt-0">
                        {formData.teamMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(index)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="حذف الطالب من الفريق"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-white dark:bg-stone-900 py-2">
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة البيانات الافتراضية</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ البيانات وتطبيقها فوراً</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
