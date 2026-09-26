import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Eye,
  Heart,
  Bookmark,
  Share2,
  Printer,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Send,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Check,
  Award,
  Edit3,
  Save,
  Camera,
  Info,
  CheckCircle2,
  FolderOpen,
  History,
  ShieldCheck,
  Undo2,
  User,
  FileCheck,
  ExternalLink,
  Shield,
  Trash2
} from 'lucide-react';
import {
  Article,
  Comment,
  EditorialUser,
  Category,
  PhotoLibraryItem,
  WorkflowLog,
  FactCheckInfo,
  FactCheckVerdict,
  VerificationSource
} from '../types/newspaper';
import { PhotoLibraryModal, PhotoSelectionResult } from './PhotoLibraryModal';

interface QuickReaderModalProps {
  article: Article | null;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  isBookmarked: boolean;
  onLikeArticle: (id: string) => void;
  onAddComment: (articleId: string, comment: { authorName: string; text: string }) => void;
  onNextArticle?: () => void;
  onPrevArticle?: () => void;
  onOpenAuthorProfile?: (authorName: string) => void;
  currentUser?: EditorialUser | null;
  onUpdateArticle?: (articleId: string, updatedFields: Partial<Article>) => void;
  categories?: Category[];
  editorialUsers?: EditorialUser[];
  photoLibrary?: PhotoLibraryItem[];
  onAddPhoto?: (photo: PhotoLibraryItem) => void;
  onUpdatePhoto?: (id: string, updated: Partial<PhotoLibraryItem>) => void;
  onDeletePhoto?: (id: string) => void;
}

export const QuickReaderModal: React.FC<QuickReaderModalProps> = ({
  article,
  onClose,
  onToggleBookmark,
  isBookmarked,
  onLikeArticle,
  onAddComment,
  onNextArticle,
  onPrevArticle,
  onOpenAuthorProfile,
  currentUser,
  onUpdateArticle,
  categories = [],
  editorialUsers = [],
  photoLibrary = [],
  onAddPhoto,
  onUpdatePhoto,
  onDeletePhoto
}) => {
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1); // 0: Small, 1: Normal, 2: Large, 3: XL
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);

  // Comments local state
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [hasLiked, setHasLiked] = useState(false);

  // Correction / Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editContentRaw, setEditContentRaw] = useState('');
  const [editPullQuote, setEditPullQuote] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editImageCaption, setEditImageCaption] = useState('');
  const [editCorrectionNotice, setEditCorrectionNotice] = useState('');
  const [editAuthorName, setEditAuthorName] = useState('');
  const [editAuthorRole, setEditAuthorRole] = useState('');
  const [editAuthorAvatar, setEditAuthorAvatar] = useState('');
  const [photoPickerTarget, setPhotoPickerTarget] = useState<'article' | 'author'>('article');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Fact-Check State
  const [isFactCheckExpanded, setIsFactCheckExpanded] = useState(false);
  const [editHasFactCheck, setEditHasFactCheck] = useState(false);
  const [editFactCheckVerdict, setEditFactCheckVerdict] = useState<FactCheckVerdict>('verified');
  const [editFactCheckScore, setEditFactCheckScore] = useState(95);
  const [editFactCheckMethodology, setEditFactCheckMethodology] = useState('');
  const [editFactCheckSources, setEditFactCheckSources] = useState<VerificationSource[]>([]);
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceType, setNewSourceType] = useState<VerificationSource['type']>('official_document');
  const [newSourceNotes, setNewSourceNotes] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  // Photo library picker state
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);

  // Sync edit form whenever article changes
  useEffect(() => {
    if (article) {
      setEditTitle(article.title || '');
      setEditSubtitle(article.subtitle || '');
      setEditCategory(article.category || '');
      setEditCategoryId(article.categoryId || '');
      setEditExcerpt(article.excerpt || '');
      setEditContentRaw(article.content ? article.content.join('\n\n') : '');
      setEditPullQuote(article.pullQuote || '');
      setEditImage(article.image || '');
      setEditImageCaption(article.imageCaption || '');
      setEditCorrectionNotice(article.correctionNotice || '');
      setEditAuthorName(article.author?.name || '');
      setEditAuthorRole(article.author?.role || '');
      setEditAuthorAvatar(article.author?.avatar || '');

      if (article.factCheck) {
        setEditHasFactCheck(true);
        setEditFactCheckVerdict(article.factCheck.verdict);
        setEditFactCheckScore(article.factCheck.transparencyScore);
        setEditFactCheckMethodology(article.factCheck.methodologySummary || '');
        setEditFactCheckSources(article.factCheck.sourcesList || []);
      } else {
        setEditHasFactCheck(false);
        setEditFactCheckVerdict('verified');
        setEditFactCheckScore(95);
        setEditFactCheckMethodology('');
        setEditFactCheckSources([]);
      }
    }
    setIsEditing(false);
    setIsFactCheckExpanded(false);
    setSaveSuccessMsg('');
  }, [article]);

  const handleAddSource = () => {
    if (!newSourceTitle.trim()) return;
    const typeLabels: Record<VerificationSource['type'], string> = {
      official_document: 'وثيقة رسمية',
      interview: 'مقابلة ميدانية مسجلة',
      field_data: 'بيانات وإحصاءات ميدانية',
      academic_study: 'دراسة أكاديمية محكمة',
      press_release: 'بيان صحفي معتمد'
    };
    const newSource: VerificationSource = {
      id: `src-${Date.now()}`,
      title: newSourceTitle.trim(),
      type: newSourceType,
      typeLabelAr: typeLabels[newSourceType],
      notes: newSourceNotes.trim() || undefined,
      url: newSourceUrl.trim() || undefined
    };
    setEditFactCheckSources([...editFactCheckSources, newSource]);
    setNewSourceTitle('');
    setNewSourceNotes('');
    setNewSourceUrl('');
  };

  const handleRemoveSource = (id: string) => {
    setEditFactCheckSources(editFactCheckSources.filter((s) => s.id !== id));
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPhotoPickerOpen) {
          setIsPhotoPickerOpen(false);
        } else if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
      if (!isEditing) {
        if (e.key === 'ArrowRight' && onPrevArticle) onPrevArticle();
        if (e.key === 'ArrowLeft' && onNextArticle) onNextArticle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNextArticle, onPrevArticle, isEditing, isPhotoPickerOpen]);

  // Audio simulator timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingAudio) {
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1 * audioSpeed;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlayingAudio, audioSpeed]);

  if (!article) return null;

  const fontSizes = [
    'text-sm leading-relaxed',
    'text-base leading-relaxed',
    'text-lg leading-loose',
    'text-xl leading-loose'
  ];

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentAuthor.trim() || !newCommentText.trim()) return;
    onAddComment(article.id, {
      authorName: newCommentAuthor.trim(),
      text: newCommentText.trim()
    });
    setNewCommentText('');
  };

  const handleLike = () => {
    if (!hasLiked) {
      onLikeArticle(article.id);
      setHasLiked(true);
    }
  };

  // Save Article Correction Handler
  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editExcerpt.trim() || !editContentRaw.trim()) {
      alert('يرجى التأكد من ملء العنوان، المقدمة، ومتن المقال.');
      return;
    }

    const paragraphs = editContentRaw
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const nowFormatted = new Date().toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const correctionLog: WorkflowLog = {
      id: `log-edit-${Date.now()}`,
      stageName: 'تصحيح وتعديل بعد النشر',
      actorName: currentUser ? currentUser.name : 'محرر مسؤول',
      actorRole: currentUser ? currentUser.roleTitleAr : 'مشرف التحرير',
      action: 'publish',
      timestamp: 'الآن',
      notes: editCorrectionNotice.trim() || (editHasFactCheck ? 'تم تحديث بيانات المقال وشارة تدقيق الحقائق وموثوقية المصادر.' : 'تم إجراء تصحيح وتدقيق تحريري على المقال المنشور.')
    };

    const existingLogs = article.workflowLogs || [];

    const verdictLabels: Record<FactCheckVerdict, string> = {
      verified: 'حقائق مؤكدة ومدققة',
      investigative: 'تحقيق استقصائي موثق بالوثائق',
      official_source: 'مستند إلى مصادر رسمية معتمدة',
      expert_reviewed: 'مراجع من خبراء وأكاديميين',
      in_progress: 'التدقيق جارٍ ومستمر'
    };

    let updatedFactCheck: FactCheckInfo | undefined = undefined;
    if (editHasFactCheck) {
      updatedFactCheck = {
        verdict: editFactCheckVerdict,
        verdictLabelAr: verdictLabels[editFactCheckVerdict] || 'مدقق تحريرياً',
        checkedBy: article.factCheck?.checkedBy || (currentUser ? `وحدة التدقيق (${currentUser.name})` : 'وحدة التحقق الرقمي والنزاهة الصحفية MUDigital'),
        checkedAt: 'اليوم',
        transparencyScore: editFactCheckScore,
        methodologySummary: editFactCheckMethodology.trim() || 'تمت مراجعة وتدقيق الوقائع والأرقام والمصادر الميدانية.',
        sourcesList: editFactCheckSources
      };
    }

    if (onUpdateArticle) {
      onUpdateArticle(article.id, {
        title: editTitle.trim(),
        subtitle: editSubtitle.trim() || undefined,
        category: editCategory,
        categoryId: editCategoryId as any,
        author: {
          name: editAuthorName.trim() || article.author.name,
          role: editAuthorRole.trim() || article.author.role,
          avatar: editAuthorAvatar.trim() || article.author.avatar,
          studentId: article.author.studentId
        },
        excerpt: editExcerpt.trim(),
        content: paragraphs.length > 0 ? paragraphs : [editContentRaw.trim()],
        pullQuote: editPullQuote.trim() || undefined,
        image: editImage,
        imageCaption: editImageCaption.trim() || undefined,
        correctionNotice: editCorrectionNotice.trim() || undefined,
        lastEditedAt: nowFormatted,
        workflowLogs: [correctionLog, ...existingLogs],
        factCheck: updatedFactCheck
      });
    }

    setSaveSuccessMsg('تم حفظ التعديلات بنجاح واعتماد بيانات كاتب المقال ونشر النسخة المصححة فوراً!');
    setTimeout(() => {
      setSaveSuccessMsg('');
      setIsEditing(false);
    }, 1800);
  };

  // Photo picked from library
  const handlePhotoPicked = (result: PhotoSelectionResult) => {
    if (photoPickerTarget === 'article') {
      setEditImage(result.url);
      if (result.caption) {
        setEditImageCaption(result.caption);
      }
    } else if (photoPickerTarget === 'author') {
      setEditAuthorAvatar(result.url);
    }
    setIsPhotoPickerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="bg-[#FBF9F5] dark:bg-[#121316] w-full max-w-4xl min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden text-stone-900 dark:text-stone-100 transition-colors font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Top Bar (Zero-distraction controls) */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-stone-200 dark:border-stone-800 bg-[#FBF9F5]/95 dark:bg-[#121316]/95 backdrop-blur-md">
          {/* Left: Article category & fast prev/next */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
              {article.category}
            </span>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <span className="text-xs text-stone-500 font-medium hidden sm:inline">
              وضع القراءة السريعة المعززة
            </span>

            {/* Quick Next/Prev for rapid browsing */}
            <div className="flex items-center gap-1 text-stone-400">
              {onPrevArticle && (
                <button
                  onClick={onPrevArticle}
                  disabled={isEditing}
                  className="p-1 hover:text-stone-900 dark:hover:text-white rounded hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors disabled:opacity-30 cursor-pointer"
                  title="المقال السابق"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {onNextArticle && (
                <button
                  onClick={onNextArticle}
                  disabled={isEditing}
                  className="p-1 hover:text-stone-900 dark:hover:text-white rounded hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors disabled:opacity-30 cursor-pointer"
                  title="المقال التالي"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Reading controls (Font sizing, Audio reader, Print, Share, Close) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isEditing && (
              <>
                {/* Font Adjuster */}
                <div className="flex items-center bg-stone-200/60 dark:bg-stone-800/80 rounded-md p-0.5">
                  <button
                    onClick={() => setFontSizeLevel((prev) => Math.max(0, prev - 1))}
                    className="p-1 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white rounded disabled:opacity-30 cursor-pointer"
                    disabled={fontSizeLevel === 0}
                    title="تصغير الخط"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1.5 text-stone-500">
                    {fontSizeLevel === 0 ? 'A-' : fontSizeLevel === 3 ? 'A+' : 'A'}
                  </span>
                  <button
                    onClick={() => setFontSizeLevel((prev) => Math.min(3, prev + 1))}
                    className="p-1 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white rounded disabled:opacity-30 cursor-pointer"
                    disabled={fontSizeLevel === 3}
                    title="تكبير الخط"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bookmark button */}
                <button
                  onClick={() => onToggleBookmark(article.id)}
                  className={`p-1.5 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
                    isBookmarked ? 'text-amber-600' : 'text-stone-600 dark:text-stone-400'
                  }`}
                  title={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ المقال'}
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                {/* Share / Copy link */}
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer relative"
                  title="نسخ الرابط"
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>

                {/* Print button */}
                <button
                  onClick={handlePrint}
                  className="p-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer hidden sm:inline-flex"
                  title="طباعة المقال"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Logged-in Editorial Ribbon & Quick Correction Trigger */}
        {currentUser && (
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-b border-amber-500/30 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>
                مسجل الدخول: <strong>{currentUser.name}</strong> ({currentUser.roleTitleAr})
              </span>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'العودة لوضع القراءة' : '✏️ تصحيح وتعديل المقال'}</span>
            </button>
          </div>
        )}

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-100 dark:bg-emerald-950/80 border-b border-emerald-300 dark:border-emerald-800 px-6 py-2 text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* 3. Main Body: Read Mode vs. Edit / Correction Mode */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {isEditing ? (
            /* POST-PUBLICATION EDIT / CORRECTION FORM */
            <form onSubmit={handleSaveCorrection} className="max-w-3xl mx-auto space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  <span>وضع تصحيح المادة الصحفية بعد النشر:</span>
                </div>
                <p>
                  يمكنك تصحيح الأخطاء اللغوية أو تحديث الأرقام والمعلومات أو استبدال الصورة وتعليقها. تحفظ التعديلات فوراً وتنعكس على الموقع مع تسجيل توثيق التعديل.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  عنوان المقال الصحفي *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold font-headline rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  العنوان الفرعي أو التمهيدي
                </label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Category & Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    القسم الصحفي *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => {
                      setEditCategory(e.target.value);
                      const found = categories.find((c) => c.name === e.target.value);
                      if (found) setEditCategoryId(found.id);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option value={article.category}>{article.category}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Comprehensive Author Customization Section (Admin / Privileged Editor) */}
              <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>تعديل وتحديد كاتب المقال (يدعم اختيار محرر مسجل أو كاتب خارجي / ضيف):</span>
                  </label>

                  {/* Fast selection dropdown from registered editors */}
                  {editorialUsers && editorialUsers.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-500 whitespace-nowrap">اختيار سريع:</span>
                      <select
                        onChange={(e) => {
                          const selected = editorialUsers.find((u) => u.name === e.target.value);
                          if (selected) {
                            setEditAuthorName(selected.name);
                            setEditAuthorRole(selected.roleTitleAr);
                            setEditAuthorAvatar(selected.avatar);
                          }
                        }}
                        className="text-xs px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium cursor-pointer"
                      >
                        <option value="">-- اختر من هيئة التحرير --</option>
                        {editorialUsers.map((u) => (
                          <option key={u.id} value={u.name}>
                            {u.name} ({u.roleTitleAr})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      اسم كاتب المقال *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="اسم الكاتب (مثال: د. شريف كمال، كاتب ضيف...)"
                      value={editAuthorName}
                      onChange={(e) => setEditAuthorName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      صفة / توصيف الكاتب
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: كاتب رأي ومفكر، طالب صحافة، باحث إعلامي..."
                      value={editAuthorRole}
                      onChange={(e) => setEditAuthorRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                {/* Author Avatar & Photo Library */}
                <div className="pt-2 border-t border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-center gap-3">
                  <img
                    src={editAuthorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80'}
                    alt={editAuthorName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-600 shadow-sm shrink-0 bg-stone-200"
                  />
                  <div className="flex-1 w-full space-y-1">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="رابط صورة الكاتب الشخصية..."
                        value={editAuthorAvatar}
                        onChange={(e) => setEditAuthorAvatar(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPickerTarget('author');
                          setIsPhotoPickerOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-600" />
                        <span>مكتبة الصور (400 × 400)</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-amber-800 dark:text-amber-300">
                      💡 يمكنك تغيير الكاتب إلى أي اسم خارجي حتى إن لم يكن يملك حساباً في النظام ليظهر اسمه وصفته وصورته رسمياً مع المقال.
                    </span>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  المقدمة أو الملخص الصحفي (Excerpt) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editExcerpt}
                  onChange={(e) => setEditExcerpt(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Body Prose Content */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  متن المقال والفقرات الكاملة *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="افصل بين الفقرات بسطر فارغ..."
                  value={editContentRaw}
                  onChange={(e) => setEditContentRaw(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-body leading-relaxed"
                />
              </div>

              {/* Pull quote */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  الاقتباس البارز (Pull Quote)
                </label>
                <input
                  type="text"
                  value={editPullQuote}
                  onChange={(e) => setEditPullQuote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Image & Caption Section with Photo Library Trigger */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>الصورة الصحفية للمقال (1200 × 675 - نسبة 16:9)</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsPhotoPickerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>اختيار من مكتبة الصور الصحفية</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-stone-850 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <div className="relative w-full sm:w-48 aspect-video rounded-lg overflow-hidden bg-stone-950 shrink-0">
                    <img src={editImage} alt="Cover" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                      1200 × 675 px
                    </span>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        تعليق الصورة الصحفي (Image Caption):
                      </label>
                      <textarea
                        rows={2}
                        value={editImageCaption}
                        onChange={(e) => setEditImageCaption(e.target.value)}
                        placeholder="تعليق يوضح سياق الصورة ومصدرها..."
                        className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Editorial Correction Notice for Readers */}
              <div className="p-4 rounded-xl border border-amber-300/80 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                <label className="block text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>تنويه التصحيح التحريري للقراء (اختياري):</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: تنويه تحريري: تم تدقيق وتحديث بعض الإحصائيات والأرقام لمزيد من الدقة."
                  value={editCorrectionNotice}
                  onChange={(e) => setEditCorrectionNotice(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
                <p className="text-[11px] text-stone-500">
                  إذا تم ملء هذا الحقل، سيظهر صندوق تنويه رسمي للقراء داخل المقال يوضح طبيعة التصحيح وفقاً لميثاق الشفافية المهنية.
                </p>
              </div>

              {/* Fact-Checking & Sources Index Editor */}
              <div className="p-4 rounded-xl border border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>شارة تدقيق الحقائق وفهرس المصادر والشفافية (Fact-Checking & Sources):</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editHasFactCheck}
                      onChange={(e) => setEditHasFactCheck(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-stone-700 dark:text-stone-300">تفعيل شارة التدقيق وفهرس المصادر</span>
                  </label>
                </div>

                {editHasFactCheck && (
                  <div className="space-y-4 pt-2 border-t border-emerald-200 dark:border-emerald-900/60 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          حكم التدقيق الصحفي (Verdict):
                        </label>
                        <select
                          value={editFactCheckVerdict}
                          onChange={(e) => setEditFactCheckVerdict(e.target.value as FactCheckVerdict)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-stone-900 font-bold text-stone-900 dark:text-stone-100"
                        >
                          <option value="verified">✓ حقائق مؤكدة ومدققة (100% Verified)</option>
                          <option value="investigative">🛡️ تحقيق استقصائي موثق بالوثائق</option>
                          <option value="official_source">🏛️ مستند إلى مصادر رسمية معتمدة</option>
                          <option value="expert_reviewed">🎓 مراجع من خبراء وأكاديميين</option>
                          <option value="in_progress">⏱️ التدقيق جارٍ ومستمر</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          مؤشر الشفافية والموثوقية ({editFactCheckScore}%):
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="60"
                            max="100"
                            value={editFactCheckScore}
                            onChange={(e) => setEditFactCheckScore(Number(e.target.value))}
                            className="flex-1 accent-emerald-600 cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {editFactCheckScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        ملخص منهجية التدقيق والتحقق (Methodology Summary):
                      </label>
                      <textarea
                        rows={2}
                        value={editFactCheckMethodology}
                        onChange={(e) => setEditFactCheckMethodology(e.target.value)}
                        placeholder="اشرح للقراء كيف تم التحقق من الوقائع والأرقام (مثال: تمت مطابقة الأرقام مع سجلات الجامعة ومقابلات مسجلة...)"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    {/* Sources Management */}
                    <div className="space-y-2 pt-2 border-t border-emerald-200 dark:border-emerald-900/40">
                      <span className="block text-[11px] font-bold text-emerald-950 dark:text-emerald-200">
                        فهرس الوثائق والمصادر المعتمدة ({editFactCheckSources.length}):
                      </span>

                      {editFactCheckSources.length > 0 && (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {editFactCheckSources.map((source) => (
                            <div
                              key={source.id}
                              className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold whitespace-nowrap">
                                  {source.typeLabelAr || source.type}
                                </span>
                                <span className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                                  {source.title}
                                </span>
                                {source.notes && (
                                  <span className="text-[11px] text-stone-400 truncate hidden sm:inline">
                                    ({source.notes})
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveSource(source.id)}
                                className="text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                                title="حذف هذا المصدر"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new source input row */}
                      <div className="p-2.5 rounded-lg bg-emerald-100/40 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                        <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">
                          + إضافة مصدر أو وثيقة جديدة:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="اسم المصدر أو الوثيقة الرسمية..."
                            value={newSourceTitle}
                            onChange={(e) => setNewSourceTitle(e.target.value)}
                            className="sm:col-span-2 px-2.5 py-1 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                          />
                          <select
                            value={newSourceType}
                            onChange={(e) => setNewSourceType(e.target.value as any)}
                            className="px-2 py-1 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                          >
                            <option value="official_document">وثيقة رسمية</option>
                            <option value="interview">مقابلة مسجلة</option>
                            <option value="field_data">بيانات ميدانية</option>
                            <option value="academic_study">دراسة أكاديمية</option>
                            <option value="press_release">بيان صحفي</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="توضيح مختصر حول الوثيقة أو تاريخ التسجيل..."
                            value={newSourceNotes}
                            onChange={(e) => setNewSourceNotes(e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                          />
                          <button
                            type="button"
                            onClick={handleAddSource}
                            className="px-3 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded cursor-pointer shrink-0"
                          >
                            إضافة المصدر
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  إلغاء التصحيح والعودة للقراءة
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات ونشر النسخة المصححة الآن</span>
                </button>
              </div>
            </form>
          ) : (
            /* STANDARD ARTICLE READ VIEW */
            <article className="space-y-6 animate-fadeIn">
              {/* Official Editorial Correction Notice Banner (if edited previously) */}
              {article.correctionNotice && (
                <div className="max-w-3xl mx-auto p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5 shadow-2xs">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">تنويه تحريري وتصحيح: </span>
                    <span>{article.correctionNotice}</span>
                    {article.lastEditedAt && (
                      <span className="block text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        تاريخ التدقيق والتحديث: {article.lastEditedAt}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Header Title Block */}
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {article.category}
                  </span>
                  <span>·</span>
                  <span>{article.publishedAt}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{article.readTimeMinutes} دقائق قراءة</span>
                  </span>
                  {article.lastEditedAt && !article.correctionNotice && (
                    <>
                      <span>·</span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium">
                        (تم التعديل: {article.lastEditedAt})
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold font-headline text-stone-950 dark:text-white leading-tight">
                  {article.title}
                </h1>

                {article.subtitle && (
                  <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 font-medium leading-relaxed font-body">
                    {article.subtitle}
                  </p>
                )}

                {/* Author Byline Badge */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800">
                  <div
                    onClick={() => onOpenAuthorProfile && onOpenAuthorProfile(article.author.name)}
                    className="flex items-center gap-3 cursor-pointer group/auth hover:opacity-90 transition-opacity"
                    title="عرض بروفايل المحرر والأرشيف الكامل"
                  >
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-11 h-11 rounded-full object-cover border border-stone-300 dark:border-stone-700 group-hover/auth:border-amber-500 transition-colors"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100 group-hover/auth:text-amber-600 transition-colors">
                          {article.author.name}
                        </span>
                        {article.author.studentId && (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-mono">
                            محرر طالب {article.author.studentId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{article.author.role}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-xs text-stone-400">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>مشروع تخرج 2026</span>
                  </div>
                </div>
              </div>

              {/* Fact-Checking & Source Transparency Badge Card */}
              {article.factCheck && (
                <div className="max-w-3xl mx-auto rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 overflow-hidden shadow-2xs">
                  <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 dark:border-emerald-900/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold font-headline text-emerald-950 dark:text-emerald-100">
                            شارة تدقيق الحقائق وموثوقية المصادر
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                            {article.factCheck.verdictLabelAr}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                          مدقق بواسطة: <strong>{article.factCheck.checkedBy}</strong> ({article.factCheck.checkedAt})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="block text-[10px] text-stone-500 dark:text-stone-400">مؤشر الشفافية</span>
                        <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400">
                          {article.factCheck.transparencyScore}% موثوقية
                        </span>
                      </div>
                      <button
                        onClick={() => setIsFactCheckExpanded(!isFactCheckExpanded)}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-200/70 dark:bg-emerald-900/60 hover:bg-emerald-300/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>{isFactCheckExpanded ? 'إخفاء الفهرس' : `فهرس المصادر (${article.factCheck.sourcesList?.length || 0}) ↓`}</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Transparency & Sources Drawer */}
                  {isFactCheckExpanded && (
                    <div className="p-4 bg-white/70 dark:bg-stone-900/70 space-y-3.5 text-xs animate-fadeIn">
                      {article.factCheck.methodologySummary && (
                        <div className="p-3 rounded-lg bg-emerald-100/50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200">
                          <strong className="block text-[11px] text-emerald-900 dark:text-emerald-300 mb-1">
                            منهجية التحقق والنزاهة الصحفية:
                          </strong>
                          <p className="leading-relaxed">{article.factCheck.methodologySummary}</p>
                        </div>
                      )}

                      {article.factCheck.sourcesList && article.factCheck.sourcesList.length > 0 && (
                        <div className="space-y-2">
                          <span className="block font-bold text-stone-800 dark:text-stone-200 text-xs">
                            قائمة الوثائق والمصادر التي تم الاستناد إليها:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {article.factCheck.sourcesList.map((source, sIdx) => (
                              <div
                                key={source.id || sIdx}
                                className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-1 shadow-2xs"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                                    {source.typeLabelAr || 'مصدر معتمد'}
                                  </span>
                                  {source.url && (
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 text-[10px]"
                                    >
                                      <span>الرابط</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                                <h5 className="font-bold text-stone-900 dark:text-stone-100 text-xs leading-snug">
                                  {source.title}
                                </h5>
                                {source.notes && (
                                  <p className="text-[11px] text-stone-500 leading-normal">
                                    {source.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Audio Player (TTS Narration Simulator) */}
              <div className="max-w-3xl mx-auto bg-stone-200/50 dark:bg-stone-900/80 rounded-lg p-3 sm:p-4 border border-stone-200 dark:border-stone-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold">
                    <Volume2 className="w-4 h-4 text-amber-600" />
                    <span>القارئ الصوتي الذكي (استمع للمقال بصوت واضح)</span>
                  </div>
                  <span className="font-mono text-stone-500 text-[11px]">
                    {article.audioDuration || '04:15 دقيقة'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                    title={isPlayingAudio ? 'إيقاف مؤقت' : 'تشغيل الاستماع'}
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 mr-0.5" />}
                  </button>

                  {/* Progress bar */}
                  <div className="flex-1 bg-stone-300 dark:bg-stone-700 h-2 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="bg-amber-600 h-full transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>

                  {/* Speed toggle */}
                  <button
                    onClick={() => {
                      const speeds = [1, 1.25, 1.5];
                      const nextIdx = (speeds.indexOf(audioSpeed) + 1) % speeds.length;
                      setAudioSpeed(speeds[nextIdx]);
                    }}
                    className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-stone-300/60 dark:bg-stone-800 rounded text-stone-700 dark:text-stone-300 cursor-pointer"
                    title="سرعة الإلقاء"
                  >
                    {audioSpeed}x
                  </button>
                </div>
                {isPlayingAudio && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 animate-pulse text-right">
                    جاري الإلقاء الصوتي الآلي للمقال... يمكنك متابعة القراءة بالأسفل
                  </p>
                )}
              </div>

              {/* Article Featured Photo */}
              <div className="max-w-3xl mx-auto space-y-2">
                <div className="aspect-16/9 rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-800">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {article.imageCaption && (
                  <p className="text-xs text-stone-500 italic text-center font-editorial">
                    {article.imageCaption}
                  </p>
                )}
              </div>

              {/* Body Prose Columns */}
              <div className="max-w-3xl mx-auto space-y-6 pt-4 border-t border-stone-200 dark:border-stone-800">
                {article.content.map((paragraph, index) => {
                  const isFirst = index === 0;
                  return (
                    <p
                      key={index}
                      className={`text-stone-800 dark:text-stone-200 font-body ${fontSizes[fontSizeLevel]} ${
                        isFirst
                          ? 'first-letter:text-4xl first-letter:font-editorial first-letter:font-bold first-letter:float-right first-letter:ml-3 first-letter:text-amber-800 dark:first-letter:text-amber-400'
                          : ''
                      }`}
                    >
                      {paragraph}
                    </p>
                  );
                })}

                {/* Elegant Editorial Pull Quote */}
                {article.pullQuote && (
                  <blockquote className="my-8 py-4 px-6 border-r-4 border-amber-600 bg-stone-100/60 dark:bg-stone-900/40 rounded-l-md font-editorial text-xl sm:text-2xl text-stone-800 dark:text-stone-100 italic leading-relaxed">
                    "{article.pullQuote}"
                  </blockquote>
                )}

                {/* Article Tags */}
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-stone-500">الكلمات المفتاحية:</span>
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Interactive Feedback Bar (Likes & Comments Counter) */}
                <div className="flex items-center justify-between py-4 border-y border-stone-200 dark:border-stone-800 my-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                        hasLiked
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400'
                          : 'text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                      <span>{article.likes + (hasLiked ? 1 : 0)} إعجاب</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                      <MessageSquare className="w-4 h-4" />
                      <span>{article.comments.length} تعليقات</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-200/50 dark:hover:bg-stone-800 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'تم نسخ الرابط!' : 'مشاركة'}</span>
                    </button>
                  </div>
                </div>

                {/* Comments Thread */}
                <div className="space-y-6 pt-4">
                  <h3 className="text-base font-bold font-headline text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <span>تعليقات القراء وملاحظات التقييم ({article.comments.length})</span>
                  </h3>

                  {/* Add comment form */}
                  <form onSubmit={handleSubmitComment} className="space-y-3 bg-stone-100/70 dark:bg-stone-900/60 p-4 rounded-lg border border-stone-200 dark:border-stone-800">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="اسمك الكريم أو الصفة الأكاديمية..."
                        value={newCommentAuthor}
                        onChange={(e) => setNewCommentAuthor(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 sm:w-1/3"
                        required
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="شاركنا برأيك أو نقدك البنّاء للمقال..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 leading-relaxed"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 rounded transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>نشر التعليق</span>
                      </button>
                    </div>
                  </form>

                  {/* Comments list */}
                  <div className="space-y-3">
                    {article.comments.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-3.5 rounded-lg border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/40 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 dark:text-stone-100">
                              {comm.authorName}
                            </span>
                            {comm.authorRole && (
                              <span className="text-[10px] text-stone-400">({comm.authorRole})</span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-400">{comm.date}</span>
                        </div>
                        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-body">
                          {comm.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>

        {/* Photo Library Picker for Edit Mode */}
        {isPhotoPickerOpen && (
          <PhotoLibraryModal
            isOpen={isPhotoPickerOpen}
            onClose={() => setIsPhotoPickerOpen(false)}
            photoLibrary={photoLibrary}
            onAddPhoto={onAddPhoto || (() => {})}
            onUpdatePhoto={onUpdatePhoto || (() => {})}
            onDeletePhoto={onDeletePhoto || (() => {})}
            onSelectPhoto={handlePhotoPicked}
            initialPresetFilter={photoPickerTarget === 'article' ? 'topic_landscape' : 'profile_square'}
            modalTitle={
              photoPickerTarget === 'article'
                ? 'اختيار صورة موضوعية مصححة للمقال (1200 × 675)'
                : `اختيار صورة شخصية لكاتب المقال: ${editAuthorName || 'الكاتب'} (400 × 400)`
            }
          />
        )}
      </div>
    </div>
  );
};
