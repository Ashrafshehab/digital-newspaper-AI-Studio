import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Trash2,
  Edit2,
  Search,
  Sparkles,
  Info,
  Maximize2,
  Crop,
  Camera,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { PhotoLibraryItem, PhotoPresetType } from '../types/newspaper';
import { PHOTO_PRESETS, optimizeAndResizeImage } from '../utils/imageOptimizer';

export interface PhotoSelectionResult {
  url: string;
  caption: string;
  title: string;
  photographer?: string;
  preset: PhotoPresetType;
  width: number;
  height: number;
}

interface PhotoLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoLibrary: PhotoLibraryItem[];
  onAddPhoto: (photo: PhotoLibraryItem) => void;
  onUpdatePhoto: (id: string, updated: Partial<PhotoLibraryItem>) => void;
  onDeletePhoto: (id: string) => void;
  /**
   * If provided, the modal acts in "Select" mode.
   * When user clicks "Select", this callback is triggered and modal closes.
   */
  onSelectPhoto?: (result: PhotoSelectionResult) => void;
  /**
   * Filter initially by this preset (e.g. 'topic_landscape' or 'profile_square')
   */
  initialPresetFilter?: PhotoPresetType | 'all';
  /**
   * Custom title for modal
   */
  modalTitle?: string;
}

export const PhotoLibraryModal: React.FC<PhotoLibraryModalProps> = ({
  isOpen,
  onClose,
  photoLibrary,
  onAddPhoto,
  onUpdatePhoto,
  onDeletePhoto,
  onSelectPhoto,
  initialPresetFilter = 'all',
  modalTitle
}) => {
  const [activeFilter, setActiveFilter] = useState<PhotoPresetType | 'all'>(initialPresetFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // Upload view state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreset, setUploadPreset] = useState<PhotoPresetType>(
    initialPresetFilter !== 'all' ? initialPresetFilter : 'topic_landscape'
  );
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadPhotographer, setUploadPhotographer] = useState('عدسة: MUDigital');
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [optimizedPreview, setOptimizedPreview] = useState<{
    dataUrl: string;
    width: number;
    height: number;
    fileSizeKB: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  // Edit photo metadata state
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editPhotographer, setEditPhotographer] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentPresetConfig = PHOTO_PRESETS[uploadPreset];

  // Process image on file change or preset change
  const handleFileSelected = async (file: File, presetKey: PhotoPresetType = uploadPreset) => {
    setRawFile(file);
    setIsProcessing(true);
    setProcessError(null);

    const config = PHOTO_PRESETS[presetKey];
    try {
      const result = await optimizeAndResizeImage(
        file,
        config.recommendedWidth,
        config.recommendedHeight,
        0.9
      );
      setOptimizedPreview(result);
      if (!uploadTitle) {
        // Generate nice default title from file name without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setUploadTitle(cleanName || 'صورة صحفية معتمدة');
      }
    } catch (err: any) {
      setProcessError(err.message || 'حدث خطأ أثناء معالجة أبعاد الصورة');
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-process if user changes target preset while file is selected
  const handlePresetChange = async (newPreset: PhotoPresetType) => {
    setUploadPreset(newPreset);
    if (rawFile) {
      setIsProcessing(true);
      const config = PHOTO_PRESETS[newPreset];
      try {
        const result = await optimizeAndResizeImage(
          rawFile,
          config.recommendedWidth,
          config.recommendedHeight,
          0.9
        );
        setOptimizedPreview(result);
      } catch (err: any) {
        setProcessError(err.message || 'حدث خطأ أثناء تعديل أبعاد الصورة');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optimizedPreview) return;

    const newPhoto: PhotoLibraryItem = {
      id: `photo-${Date.now()}`,
      title: uploadTitle.trim() || 'صورة صحفية',
      url: optimizedPreview.dataUrl,
      caption: uploadCaption.trim() || 'لا يوجد تعليق مدخل',
      photographer: uploadPhotographer.trim() || undefined,
      preset: uploadPreset,
      width: optimizedPreview.width,
      height: optimizedPreview.height,
      uploadedAt: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
      fileSizeKB: optimizedPreview.fileSizeKB
    };

    onAddPhoto(newPhoto);
    setSelectedPhotoId(newPhoto.id);

    // If in select mode, allow immediate selection
    if (onSelectPhoto) {
      onSelectPhoto({
        url: newPhoto.url,
        caption: newPhoto.caption,
        title: newPhoto.title,
        photographer: newPhoto.photographer,
        preset: newPhoto.preset,
        width: newPhoto.width,
        height: newPhoto.height
      });
      onClose();
      return;
    }

    // Reset upload form
    setIsUploading(false);
    setRawFile(null);
    setOptimizedPreview(null);
    setUploadTitle('');
    setUploadCaption('');
  };

  const handleStartEdit = (photo: PhotoLibraryItem) => {
    setEditingPhotoId(photo.id);
    setEditTitle(photo.title);
    setEditCaption(photo.caption || '');
    setEditPhotographer(photo.photographer || '');
  };

  const handleSaveEdit = (id: string) => {
    onUpdatePhoto(id, {
      title: editTitle.trim(),
      caption: editCaption.trim(),
      photographer: editPhotographer.trim() || undefined
    });
    setEditingPhotoId(null);
  };

  const filteredPhotos = photoLibrary.filter((p) => {
    const matchesFilter = activeFilter === 'all' || p.preset === activeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.caption && p.caption.toLowerCase().includes(q)) ||
      (p.photographer && p.photographer.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const selectedPhoto = photoLibrary.find((p) => p.id === selectedPhotoId);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="bg-[#FBF9F5] dark:bg-[#121316] w-full max-w-5xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col max-h-[92vh] my-auto transition-colors font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-headline text-stone-950 dark:text-white flex items-center gap-2">
                <span>{modalTitle || 'مكتبة الصور والوسائط الصحفية (Photo Library)'}</span>
                {onSelectPhoto && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    وضع الانتقاء
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                نظام معالجة وضبط أبعاد الصور تلقائياً حسب المقاسات المعتمدة في قالب MUDigital
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isUploading ? (
              <button
                onClick={() => setIsUploading(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>رفع صورة جديدة وضبطها</span>
              </button>
            ) : (
              <button
                onClick={() => setIsUploading(false)}
                className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
              >
                العودة للمعرض
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prominent Guidelines & Dimensions Notice */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 border-b border-stone-200 dark:border-stone-800 text-xs">
          <div className="flex items-start sm:items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-bold">المقاسات المعتمدة بالقالب:</span>
              <span className="inline-flex items-center gap-1 bg-white/80 dark:bg-stone-800 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                <span className="font-bold text-amber-700 dark:text-amber-400">الصور الموضوعية:</span> 1200 × 675 بكسل (16:9)
              </span>
              <span className="inline-flex items-center gap-1 bg-white/80 dark:bg-stone-800 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                <span className="font-bold text-amber-700 dark:text-amber-400">الصور الشخصية للمحرر:</span> 400 × 400 بكسل (1:1)
              </span>
              <span className="inline-flex items-center gap-1 bg-white/80 dark:bg-stone-800 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                <span className="font-bold text-amber-700 dark:text-amber-400">البانر العريض:</span> 1600 × 600 بكسل (8:3)
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isUploading ? (
            /* UPLOAD & AUTO-RESIZE FORM */
            <form onSubmit={handleSaveUpload} className="max-w-2xl mx-auto space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>المعالجة الذكية الفورية للأبعاد:</span>
                </div>
                <p>
                  عند رفع أي صورة مهما كانت أبعادها الأصلية، يقوم النظام تلقائياً باقتصاصها وتوسيطها وضبط دقتها لتطابق المقاس المعتمد بدون أي مط أو تشويه وبأعلى جودة.
                </p>
              </div>

              {/* Step 1: Select Preset Target */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-2">
                  1. اختر نوع واستخدام الصورة المراد رفعها (تحديد المقاس التلقائي): *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(PHOTO_PRESETS) as PhotoPresetType[]).map((key) => {
                    const preset = PHOTO_PRESETS[key];
                    const isSelected = uploadPreset === key;
                    return (
                      <div
                        key={key}
                        onClick={() => handlePresetChange(key)}
                        className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 ring-2 ring-amber-600/30 shadow-xs'
                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                            {preset.label}
                          </span>
                          <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                            isSelected
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                          }`}>
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-tight">
                          {preset.usageDescription}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: File Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  2. اختيار ملف الصورة من جهازك: *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file);
                  }}
                  className="hidden"
                />

                {!optimizedPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-8 text-center hover:border-amber-600 dark:hover:border-amber-500 bg-white dark:bg-stone-850 transition-colors cursor-pointer group"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-1">
                      اضغط لاختيار صورة من جهازك (JPG، PNG، WebP)
                    </p>
                    <p className="text-xs text-stone-500">
                      سيتم ضبطها فوراً لمقاس: <span className="font-bold text-amber-600">{currentPresetConfig.badge}</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم ضبط وتحسين أبعاد الصورة بنجاح!</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        اختيار ملف آخر
                      </button>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-900 flex items-center justify-center max-h-64">
                      <img
                        src={optimizedPreview.dataUrl}
                        alt="Preview"
                        className="max-h-64 object-contain mx-auto"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded font-mono">
                        {optimizedPreview.width} × {optimizedPreview.height} px · {optimizedPreview.fileSizeKB} KB
                      </div>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>جارٍ معالجة واقتصاص الصورة بالأبعاد المعتمدة...</span>
                  </p>
                )}

                {processError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{processError}</span>
                  </p>
                )}
              </div>

              {/* Step 3: Metadata (Title, Caption, Photographer) */}
              <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    عنوان أو وصف الصورة *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: طلاب قسم الصحافة في قاعة التحرير..."
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    تعليق الصورة الصحفي (Image Caption) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="يظهر هذا التعليق أسفل الصورة في المقال لإيضاح سياقها للجمهور..."
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    المصور أو مصدر الصورة (Credit)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: تصوير: سارة المنصوري / أرشيف كلية الإعلام MTI"
                    value={uploadPhotographer}
                    onChange={(e) => setUploadPhotographer(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={!optimizedPreview || isProcessing}
                  className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>
                    {onSelectPhoto
                      ? 'حفظ بالمكتبة واختيارها فوراً'
                      : 'حفظ الصورة في المكتبة الصحفية'}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* GALLERY VIEW */
            <div className="space-y-4">
              {/* Filter tabs & Search bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    الكل ({photoLibrary.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('topic_landscape')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      activeFilter === 'topic_landscape'
                        ? 'bg-amber-700 text-white dark:bg-amber-600'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    صور موضوعية (16:9)
                  </button>
                  <button
                    onClick={() => setActiveFilter('profile_square')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      activeFilter === 'profile_square'
                        ? 'bg-amber-700 text-white dark:bg-amber-600'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    صور شخصية للمحررين (1:1)
                  </button>
                  <button
                    onClick={() => setActiveFilter('banner_wide')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      activeFilter === 'banner_wide'
                        ? 'bg-amber-700 text-white dark:bg-amber-600'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    بانرات (8:3)
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="بحث في الصور والتعليقات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-8 pl-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Photos Grid */}
              {filteredPhotos.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
                  <ImageIcon className="w-12 h-12 mx-auto text-stone-400 mb-3 opacity-60" />
                  <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-1">
                    لا توجد صور مطابقة لهذا التصنيف
                  </h4>
                  <p className="text-xs text-stone-500 mb-4">
                    يمكنك رفع صورة جديدة وضبط أبعادها تلقائياً بضغطة زر.
                  </p>
                  <button
                    onClick={() => setIsUploading(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg"
                  >
                    رفع صورة جديدة الآن
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredPhotos.map((photo) => {
                    const isSelected = selectedPhotoId === photo.id;
                    const presetInfo = PHOTO_PRESETS[photo.preset] || PHOTO_PRESETS.topic_landscape;

                    return (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedPhotoId(photo.id)}
                        className={`rounded-2xl border overflow-hidden transition-all bg-white dark:bg-stone-850 cursor-pointer flex flex-col ${
                          isSelected
                            ? 'border-amber-600 ring-2 ring-amber-600/30 shadow-md'
                            : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        {/* Image Preview with Badges */}
                        <div className="relative aspect-video bg-stone-950 overflow-hidden flex items-center justify-center">
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className={`w-full h-full ${
                              photo.preset === 'profile_square' ? 'object-cover' : 'object-cover'
                            }`}
                          />
                          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                            {presetInfo.badge}
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 left-2 bg-amber-600 text-white p-1 rounded-full shadow">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Metadata & Caption */}
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                              {photo.title}
                            </h5>
                            {photo.caption && (
                              <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                                {photo.caption}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 mt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
                            <span>{photo.photographer || 'MTI Media'}</span>
                            <span>{photo.uploadedAt}</span>
                          </div>

                          {/* Quick Actions */}
                          <div className="pt-2 flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(photo);
                              }}
                              className="text-[11px] text-stone-500 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>تعديل التعليق</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('هل أنت متأكد من حذف هذه الصورة من المكتبة؟')) {
                                  onDeletePhoto(photo.id);
                                }
                              }}
                              className="text-[11px] text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                              title="حذف الصورة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer / Selection Bar */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            {selectedPhoto ? (
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-stone-900 dark:text-stone-100">{selectedPhoto.title}</span>
                <span>·</span>
                <span className="font-mono">{selectedPhoto.width} × {selectedPhoto.height} px</span>
              </span>
            ) : (
              <span>اختر صورة من القائمة لعرض تفاصيلها أو إدراجها.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              إغلاق
            </button>

            {onSelectPhoto && selectedPhoto && (
              <button
                onClick={() => {
                  onSelectPhoto({
                    url: selectedPhoto.url,
                    caption: selectedPhoto.caption,
                    title: selectedPhoto.title,
                    photographer: selectedPhoto.photographer,
                    preset: selectedPhoto.preset,
                    width: selectedPhoto.width,
                    height: selectedPhoto.height
                  });
                  onClose();
                }}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>اعتماد هذه الصورة المحددة</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit Caption / Metadata Modal Sub-layer */}
        {editingPhotoId && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xl space-y-4">
              <h4 className="text-sm font-bold font-headline text-stone-950 dark:text-white">
                تعديل بيانات وتعليق الصورة الصحفية
              </h4>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  عنوان الصورة:
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  تعليق الصورة (Caption):
                </label>
                <textarea
                  rows={3}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  المصور / المصدر:
                </label>
                <input
                  type="text"
                  value={editPhotographer}
                  onChange={(e) => setEditPhotographer(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPhotoId(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(editingPhotoId)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 rounded-lg cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
