import React, { useState, useRef } from 'react';
import {
  X,
  Mail,
  Award,
  BookOpen,
  Eye,
  Heart,
  Clock,
  ArrowLeft,
  Check,
  Edit3,
  Calendar,
  Building,
  GraduationCap,
  Upload,
  CheckCircle2,
  Camera
} from 'lucide-react';
import { Article, EditorialUser, PhotoLibraryItem } from '../types/newspaper';
import { optimizeAndResizeImage } from '../utils/imageOptimizer';

interface AuthorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorName: string;
  articles: Article[];
  editorialUsers: EditorialUser[];
  onOpenArticle: (article: Article) => void;
  currentUser?: EditorialUser | null;
  onUpdateUserProfile?: (userId: string, updatedData: Partial<EditorialUser>) => void;
  onAddPhoto?: (photo: PhotoLibraryItem) => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  isOpen,
  onClose,
  authorName,
  articles,
  editorialUsers,
  onOpenArticle,
  currentUser,
  onUpdateUserProfile,
  onAddPhoto
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [photoUploadSuccess, setPhotoUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find user data if exists
  const matchedUser = editorialUsers.find(
    (u) => u.name.trim() === authorName.trim() || authorName.includes(u.name) || u.name.includes(authorName)
  );

  // Filter articles by this author
  const authorArticles = articles.filter(
    (a) => a.author.name.trim() === authorName.trim() || a.author.name.includes(authorName)
  );

  // Editable fields
  const [editBio, setEditBio] = useState(matchedUser?.bio || '');
  const [editEmail, setEditEmail] = useState(matchedUser?.email || '');
  const [editAvatar, setEditAvatar] = useState(matchedUser?.avatar || '');

  if (!isOpen) return null;

  const totalViews = authorArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalLikes = authorArticles.reduce((sum, a) => sum + (a.likes || 0), 0);

  const canEdit =
    currentUser &&
    (currentUser.role === 'admin' ||
      currentUser.canManageUsers ||
      (matchedUser && currentUser.id === matchedUser.id));

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchedUser && onUpdateUserProfile) {
      const finalAvatar = editAvatar.trim() || matchedUser.avatar;
      onUpdateUserProfile(matchedUser.id, {
        bio: editBio.trim(),
        email: editEmail.trim(),
        avatar: finalAvatar
      });
      setSaveSuccessMsg(`تم حفظ وتحديث بيانات وصورة المحرر "${matchedUser.name}" بنجاح!`);
      setTimeout(() => setSaveSuccessMsg(''), 5500);
    }
    setIsEditing(false);
  };

  const handleDeviceAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await optimizeAndResizeImage(file, 400, 400, {
        fitMode: 'crop_cover',
        quality: 0.82
      });

      if (onAddPhoto) {
        const newPhoto: PhotoLibraryItem = {
          id: `photo-user-${Date.now()}`,
          title: `صورة المحرر: ${authorName}`,
          url: result.dataUrl,
          caption: `صورة شخصية معتمدة للصحفي ${authorName}`,
          preset: 'profile_square',
          fitMode: 'crop_cover',
          width: 400,
          height: 400,
          originalWidth: result.originalWidth,
          originalHeight: result.originalHeight,
          uploadedAt: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
          fileSizeKB: result.fileSizeKB,
          isInfographic: false
        };
        onAddPhoto(newPhoto);
      }

      setEditAvatar(result.dataUrl);
      setPhotoUploadSuccess('تم رفع الصورة بنجاح وتعيينها للمحرر وحفظها في مكتبة الصور!');
      setTimeout(() => setPhotoUploadSuccess(''), 5000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء معالجة الصورة');
    }
  };

  const userAvatar = matchedUser?.avatar || authorArticles[0]?.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const userRole = matchedUser?.roleTitleAr || authorArticles[0]?.author.role || 'محرر صحفي';
  const userEmail = matchedUser?.email || `${authorName.replace(/\s+/g, '.').toLowerCase()}@mti.edu.eg`;
  const userBio = matchedUser?.bio || 'محرر ومشارك في تحرير المحتوى الاستقصائي والتقارير الإخبارية بصحيفة MUDigital الرقمية - كلية الإعلام والاتصال بالجامعة الحديثة MTI.';
  const userDept = matchedUser?.department || 'كلية الإعلام وفنون الاتصال - الجامعة الحديثة للتكنولوجيا والمعلومات';
  const userStudentId = matchedUser?.studentId || authorArticles[0]?.author.studentId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="bg-[#FBF9F5] dark:bg-[#121316] w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col max-h-[92vh] my-auto transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Cover Banner */}
        <div className="h-32 bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 relative p-4 flex items-start justify-between">
          <div className="flex items-center gap-1.5 text-xs text-amber-200 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>الجامعة الحديثة للتكنولوجيا والمعلومات MTI</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="px-6 pb-4 pt-0 relative border-b border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 font-body">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={userAvatar}
                alt={authorName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-stone-900 shadow-lg bg-stone-200"
              />
              <div className="space-y-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold font-headline text-stone-950 dark:text-white">
                    {authorName}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                    {userRole}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-stone-400" />
                    <span>{userDept}</span>
                  </span>
                  {userStudentId && (
                    <span className="font-mono bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[11px]">
                      كود القيد: {userStudentId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Edit Profile (if allowed) */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {canEdit && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer border border-stone-300 dark:border-stone-700"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isEditing ? 'إلغاء التعديل' : 'تعديل البروفايل'}</span>
                </button>
              )}

              <button
                onClick={() => handleCopyEmail(userEmail)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                title="نسخ البريد الإلكتروني"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Mail className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? 'تم نسخ البريد!' : 'تواصل عبر البريد'}</span>
              </button>
            </div>
          </div>

          {/* Confirmation Success Message */}
          {saveSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Edit Form if toggled */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="mt-3 p-4 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 space-y-3">
              <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                تعديل بيانات المحرر وصورته الشخصية:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    الصورة الشخصية (400 × 400)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleDeviceAvatarUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع من الجهاز</span>
                    </button>
                    <input
                      type="url"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="أو رابط الصورة..."
                      className="flex-1 px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                </div>
              </div>

              {photoUploadSuccess && (
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs rounded border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{photoUploadSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  النبذة التعريفية (Bio)
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          ) : (
            /* Bio & Email Strip */
            <div className="space-y-3 pt-2">
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-body">
                {userBio}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <a href={`mailto:${userEmail}`} className="hover:underline text-stone-700 dark:text-stone-300 font-mono text-xs">
                    {userEmail}
                  </a>
                </div>
                {matchedUser?.joinedDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>تاريخ الانضمام لهيئة التحرير: {matchedUser.joinedDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 text-center">
            <div className="p-2 rounded-lg bg-stone-100/70 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800">
              <span className="text-lg font-bold font-mono text-stone-900 dark:text-white block">
                {authorArticles.length}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">مقالات منشورة</span>
            </div>

            <div className="p-2 rounded-lg bg-stone-100/70 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800">
              <span className="text-lg font-bold font-mono text-amber-700 dark:text-amber-400 block">
                {totalViews}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">إجمالي القراءات</span>
            </div>

            <div className="p-2 rounded-lg bg-stone-100/70 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800">
              <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 block">
                {totalLikes}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">إجمالي التفاعلات</span>
            </div>
          </div>
        </div>

        {/* Author Articles Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-sm font-bold font-headline text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>أرشيف المقالات والتحقيقات بقلم {authorName}</span>
            </h3>
            <span className="text-xs text-stone-500">
              {authorArticles.length} مواد صحفية
            </span>
          </div>

          {authorArticles.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              لم تنشر أي مقالات معتمدة لهذا المحرر بعد.
            </div>
          ) : (
            <div className="space-y-3">
              {authorArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => {
                    onOpenArticle(article);
                    onClose();
                  }}
                  className="group cursor-pointer p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-600/60 dark:hover:border-amber-500/60 transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span className="font-semibold text-amber-800 dark:text-amber-300">{article.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.publishedAt}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTimeMinutes} دقائق</span>
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold font-headline text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                      {article.title}
                    </h4>

                    <p className="text-xs text-stone-500 line-clamp-2 font-body leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-3 pt-2">
                    <span className="flex items-center gap-1 text-[11px] font-mono text-stone-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{article.views}</span>
                    </span>
                    <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
