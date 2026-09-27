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
  FileCheck,
  Scaling,
  Eye,
  BarChart2,
  Sparkle
} from 'lucide-react';
import { PhotoLibraryItem, PhotoPresetType, PhotoFitMode } from '../types/newspaper';
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
  onSelectPhoto?: (result: PhotoSelectionResult) => void;
  initialPresetFilter?: PhotoPresetType | 'all';
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

  // Full-size preview modal for tall infographics & high-res images
  const [fullPreviewPhoto, setFullPreviewPhoto] = useState<PhotoLibraryItem | null>(null);

  // Upload view state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreset, setUploadPreset] = useState<PhotoPresetType>(
    initialPresetFilter !== 'all' ? initialPresetFilter : 'topic_landscape'
  );
  const [uploadFitMode, setUploadFitMode] = useState<PhotoFitMode>('crop_cover');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadPhotographer, setUploadPhotographer] = useState('عدسة: MUDigital');
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [optimizedPreview, setOptimizedPreview] = useState<{
    dataUrl: string;
    width: number;
    height: number;
    originalWidth: number;
    originalHeight: number;
    fileSizeKB: number;
    cropPercent: number;
    fitMode: PhotoFitMode;
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

  const currentPresetConfig = PHOTO_PRESETS[uploadPreset] || PHOTO_PRESETS.topic_landscape;

  // Process image with options
  const processImageWithOptions = async (
    file: File,
    presetKey: PhotoPresetType,
    fitModeKey: PhotoFitMode
  ) => {
    setIsProcessing(true);
    setProcessError(null);

    const config = PHOTO_PRESETS[presetKey] || PHOTO_PRESETS.topic_landscape;
    try {
      const result = await optimizeAndResizeImage(
        file,
        config.recommendedWidth,
        config.recommendedHeight,
        {
          fitMode: fitModeKey,
          quality: 0.9,
          backgroundColor: '#18181b'
        }
      );
      setOptimizedPreview(result);
      if (!uploadTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setUploadTitle(cleanName || 'صورة صحفية معتمدة');
      }
    } catch (err: any) {
      setProcessError(err.message || 'حدث خطأ أثناء معالجة أبعاد الصورة');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process image on file selection
  const handleFileSelected = (file: File) => {
    setRawFile(file);
    const recommendedFit = PHOTO_PRESETS[uploadPreset]?.defaultFitMode || 'crop_cover';
    setUploadFitMode(recommendedFit);
    processImageWithOptions(file, uploadPreset, recommendedFit);
  };

  // Re-process on preset change
  const handlePresetChange = (newPreset: PhotoPresetType) => {
    setUploadPreset(newPreset);
    const recommendedFit = PHOTO_PRESETS[newPreset]?.defaultFitMode || 'crop_cover';
    setUploadFitMode(recommendedFit);
    if (rawFile) {
      processImageWithOptions(rawFile, newPreset, recommendedFit);
    }
  };

  // Re-process on fitMode change
  const handleFitModeChange = (newFit: PhotoFitMode) => {
    setUploadFitMode(newFit);
    if (rawFile) {
      processImageWithOptions(rawFile, uploadPreset, newFit);
    }
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optimizedPreview) return;

    const isInfographic =
      uploadPreset === 'infographic_vertical' ||
      optimizedPreview.height > optimizedPreview.width * 1.15 ||
      uploadFitMode === 'no_crop_scale';

    const newPhoto: PhotoLibraryItem = {
      id: `photo-${Date.now()}`,
      title: uploadTitle.trim() || 'صورة صحفية',
      url: optimizedPreview.dataUrl,
      caption: uploadCaption.trim() || 'لا يوجد تعليق مدخل',
      photographer: uploadPhotographer.trim() || undefined,
      preset: uploadPreset,
      fitMode: uploadFitMode,
      width: optimizedPreview.width,
      height: optimizedPreview.height,
      originalWidth: optimizedPreview.originalWidth,
      originalHeight: optimizedPreview.originalHeight,
      uploadedAt: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
      fileSizeKB: optimizedPreview.fileSizeKB,
      isInfographic
    };

    onAddPhoto(newPhoto);
    setSelectedPhotoId(newPhoto.id);

    // If in select mode, select immediately
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
    const matchesFilter =
      activeFilter === 'all' ||
      p.preset === activeFilter ||
      (activeFilter === 'infographic_vertical' && (p.isInfographic || p.height > p.width));
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="bg-[#FBF9F5] dark:bg-[#121316] w-full max-w-6xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col max-h-[94vh] my-auto transition-colors font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-600/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-headline text-stone-950 dark:text-white flex items-center gap-2">
                <span>{modalTitle || 'مكتبة الصور والوسائط والإنفوجرافيك'}</span>
                {onSelectPhoto && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    وضع الانتقاء
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                نظام معالجة وتصغير حجم الصور بدون قص، ودعم الإنفوجرافيك الطولي والأبعاد الرأسية والأفقية المعتمدة
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
                <span>رفع صورة جديدة أو إنفوجرافيك</span>
              </button>
            ) : (
              <button
                onClick={() => setIsUploading(false)}
                className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                العودة للمعرض
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Notice: Zero-Crop & Infographic Support */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-amber-50 via-emerald-50/40 to-amber-50 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 border-b border-stone-200 dark:border-stone-800 text-xs">
          <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap text-stone-800 dark:text-stone-200">
            <div className="flex items-center gap-2">
              <Scaling className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-emerald-900 dark:text-emerald-300">
                ميزة تصغير الحجم بدون قص (No-Crop Scaling):
              </span>
              <span className="text-stone-600 dark:text-stone-400 hidden sm:inline">
                يمكنك رفع الإنفوجرافيك الطولي أو أي صورة عمودية والاحتفاظ بكامل بياناتها وارتفاعها دون أي اقتطاع.
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono">
                أفقي: 1200×675
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                إنفوجرافيك: طولي كامل
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono">
                مربع: 400×400
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isUploading ? (
            /* UPLOAD & SMART FIT FORM */
            <form onSubmit={handleSaveUpload} className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
              
              {/* Step 1: Preset Target */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-2">
                  1. اختر نوع واستخدام الصورة المراد رفعها: *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1">
                            {preset.isVertical && <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />}
                            <span>{preset.label}</span>
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold whitespace-nowrap ${
                              isSelected
                                ? 'bg-amber-600 text-white'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                            }`}
                          >
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

              {/* Step 2: Fit Mode Selection (No-Crop vs Contain vs Cover Crop) */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Crop className="w-4 h-4 text-amber-600" />
                    <span>2. خيارات الاقتصاص والتحجيم (خاصية عدم قص الإنفوجرافيك): *</span>
                  </label>
                  {uploadFitMode === 'no_crop_scale' && (
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                      ✓ تفعيل عدم القص (نسبة الاقتطاع 0%)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleFitModeChange('no_crop_scale')}
                    className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                      uploadFitMode === 'no_crop_scale'
                        ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/50 ring-2 ring-emerald-600/30 text-emerald-950 dark:text-emerald-100'
                        : 'border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                    }`}
                  >
                    <div className="font-bold text-xs mb-1 flex items-center justify-between">
                      <span>المحافظة على كامل الصورة (بدون قص)</span>
                      {uploadFitMode === 'no_crop_scale' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      تصغير الحجم والضغط الذكي مع الحفاظ على كامل الارتفاع والبيانات للإنفوجرافيك بنسبة 100%.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFitModeChange('contain_letterbox')}
                    className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                      uploadFitMode === 'contain_letterbox'
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 ring-2 ring-blue-600/30 text-blue-950 dark:text-blue-100'
                        : 'border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                    }`}
                  >
                    <div className="font-bold text-xs mb-1 flex items-center justify-between">
                      <span>احتواء داخل الإطار (Letterbox)</span>
                      {uploadFitMode === 'contain_letterbox' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      وضع الصورة كاملة داخل المقاس المعتمد مع هوامش أنيقة دون اقتطاع أي بكسل.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFitModeChange('crop_cover')}
                    className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                      uploadFitMode === 'crop_cover'
                        ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/50 ring-2 ring-amber-600/30 text-amber-950 dark:text-amber-100'
                        : 'border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                    }`}
                  >
                    <div className="font-bold text-xs mb-1 flex items-center justify-between">
                      <span>قص وتوسيط لملء الإطار بالكامل</span>
                      {uploadFitMode === 'crop_cover' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      اقتصاص وتوسيط الصورة لتملأ أبعاد الإطار تماماً بدقة عالية بدون حواف.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 3: File Picker & Live Preview */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  3. اختيار ملف الصورة أو الإنفوجرافيك: *
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
                      اضغط لاختيار صورة أو إنفوجرافيك من جهازك (JPG، PNG، WebP)
                    </p>
                    <p className="text-xs text-stone-500">
                      سيتم ضبطها فوراً وفق الخيار المحدد:{' '}
                      <span className="font-bold text-amber-600">{currentPresetConfig.badge}</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
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

                    {/* Image Preview Box with Scroll Support for Long Infographics */}
                    <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-900 flex items-center justify-center max-h-96 overflow-y-auto p-2">
                      <img
                        src={optimizedPreview.dataUrl}
                        alt="Preview"
                        className="max-w-full max-h-96 object-contain mx-auto rounded"
                      />
                    </div>

                    {/* Image Processing Details Card */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                        <span className="text-[10px] text-stone-500 block">الأبعاد الأصلية:</span>
                        <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                          {optimizedPreview.originalWidth} × {optimizedPreview.originalHeight} px
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                        <span className="text-[10px] text-stone-500 block">الأبعاد المعالجة:</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {optimizedPreview.width} × {optimizedPreview.height} px
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                        <span className="text-[10px] text-stone-500 block">نسبة القص:</span>
                        <span className={`font-mono font-bold ${
                          optimizedPreview.cropPercent === 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600'
                        }`}>
                          {optimizedPreview.cropPercent === 0 ? '0% (بدون أي قص ✓)' : `${optimizedPreview.cropPercent}%`}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                        <span className="text-[10px] text-stone-500 block">حجم الملف المخفف:</span>
                        <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                          {optimizedPreview.fileSizeKB} KB
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>جارٍ معالجة وتحسين أبعاد الصورة بدون أي تشويه...</span>
                  </p>
                )}

                {processError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{processError}</span>
                  </p>
                )}
              </div>

              {/* Step 4: Metadata (Title, Caption, Photographer) */}
              <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    عنوان أو وصف الصورة / الإنفوجرافيك *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: إنفوجرافيك: مؤشرات التحول الرقمي بالجامعة..."
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
                    المصور أو جهة التصميم (الاعتماد الصحفي)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: تصميم: سارة المنصوري / قسم صحافة البيانات والإنفوجرافيك"
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
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs no-scrollbar">
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
                    onClick={() => setActiveFilter('infographic_vertical')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      activeFilter === 'infographic_vertical'
                        ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>إنفوجرافيك ورأسي</span>
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
                    صور شخصية (1:1)
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
                    placeholder="بحث في الصور والإنفوجرافيك..."
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
                    يمكنك رفع صورة جديدة أو إنفوجرافيك وضبط أبعادها تلقائياً بدون أي قص.
                  </p>
                  <button
                    onClick={() => setIsUploading(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
                  >
                    رفع صورة الآن
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredPhotos.map((photo) => {
                    const isSelected = selectedPhotoId === photo.id;
                    const presetInfo = PHOTO_PRESETS[photo.preset] || PHOTO_PRESETS.topic_landscape;
                    const isTall = photo.preset === 'infographic_vertical' || photo.isInfographic || (photo.height > photo.width);

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
                        {/* Image Preview with Badges & Contain for Tall Graphics */}
                        <div className={`relative ${isTall ? 'h-64' : 'aspect-video'} bg-stone-950 overflow-hidden flex items-center justify-center group`}>
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className={`w-full h-full ${
                              isTall || photo.fitMode === 'no_crop_scale' ? 'object-contain p-1' : 'object-cover'
                            }`}
                          />

                          {/* Presets and No-Crop Badges */}
                          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                            <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                              {presetInfo.badge}
                            </span>
                            {isTall && (
                              <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-xs">
                                إنفوجرافيك كامل (بدون قص)
                              </span>
                            )}
                          </div>

                          {/* Zoom Full Preview Icon */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFullPreviewPhoto(photo);
                            }}
                            className="absolute bottom-2 left-2 bg-black/60 hover:bg-black/90 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="معاينة بالحجم الكامل"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>

                          {isSelected && (
                            <div className="absolute top-2 left-2 bg-amber-600 text-white p-1 rounded-full shadow">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Metadata & Caption */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
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

                          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
                            <span>{photo.photographer || 'MTI Media'}</span>
                            <span className="font-mono">{photo.width} × {photo.height}</span>
                          </div>

                          {/* Quick Actions */}
                          <div className="pt-1 flex items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
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

                              {isTall && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFullPreviewPhoto(photo);
                                  }}
                                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>فحص الطول</span>
                                </button>
                              )}
                            </div>

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
              <span className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-stone-900 dark:text-stone-100">{selectedPhoto.title}</span>
                <span>·</span>
                <span className="font-mono">{selectedPhoto.width} × {selectedPhoto.height} px</span>
                <span>·</span>
                <span>{selectedPhoto.fitMode === 'no_crop_scale' ? 'بدون قص (كاملة)' : 'معالجة قياسية'}</span>
              </span>
            ) : (
              <span>اختر صورة من القائمة لعرض تفاصيلها أو إدراجها في المقال.</span>
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
      </div>

      {/* Full-Height Infographic Preview Overlay Modal */}
      {fullPreviewPhoto && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setFullPreviewPhoto(null)}
        >
          <div
            className="bg-stone-950 border border-stone-800 rounded-2xl max-w-4xl max-h-[92vh] w-full overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-stone-800 flex items-center justify-between text-white">
              <div>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-500" />
                  <span>{fullPreviewPhoto.title}</span>
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  معاينة كاملة بدون قص · {fullPreviewPhoto.width} × {fullPreviewPhoto.height} بكسل · {fullPreviewPhoto.photographer || 'MTI Media'}
                </p>
              </div>
              <button
                onClick={() => setFullPreviewPhoto(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-black/50">
              <img
                src={fullPreviewPhoto.url}
                alt={fullPreviewPhoto.title}
                className="max-w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Photo Metadata Mini Modal */}
      {editingPhotoId && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setEditingPhotoId(null)}
        >
          <div
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-600" />
              <span>تعديل بيانات الصورة بالمكتبة</span>
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                  عنوان الصورة:
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                  التعليق الصحفي (Caption):
                </label>
                <textarea
                  rows={3}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                  جهة التصميم أو المصور:
                </label>
                <input
                  type="text"
                  value={editPhotographer}
                  onChange={(e) => setEditPhotographer(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
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
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
