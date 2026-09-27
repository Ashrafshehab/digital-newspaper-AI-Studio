import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Check,
  X,
  FileCheck,
  Maximize2,
  Trash2,
  Edit2,
  Search,
  Crop,
  AlertTriangle,
  ImageIcon,
  Sparkles,
  Scaling,
  BarChart2,
  CheckCircle2,
  Smartphone,
  Monitor,
  Percent,
  Sliders,
  HelpCircle
} from 'lucide-react';
import {
  PhotoLibraryItem,
  PhotoPresetType,
  PhotoFitMode,
  PhotoCategoryGroup
} from '../types/newspaper';
import { PHOTO_PRESETS, optimizeAndResizeImage } from '../utils/imageOptimizer';

export interface PhotoSelectionResult {
  url: string;
  caption?: string;
  title?: string;
  photographer?: string;
  preset?: PhotoPresetType;
  width?: number;
  height?: number;
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
  initialGroup?: PhotoCategoryGroup;
  initialOrientation?: 'vertical' | 'horizontal';
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
  initialGroup = 'all',
  initialOrientation = 'vertical',
  modalTitle
}) => {
  // Gallery filter state
  const [activeGroupFilter, setActiveGroupFilter] = useState<PhotoCategoryGroup>(initialGroup);
  const [activePresetFilter, setActivePresetFilter] = useState<PhotoPresetType | 'all'>(initialPresetFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // Full-size preview modal for tall infographics & high-res images
  const [fullPreviewPhoto, setFullPreviewPhoto] = useState<PhotoLibraryItem | null>(null);

  // Upload view state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadGroup, setUploadGroup] = useState<'topic' | 'profile' | 'infographic'>(
    initialGroup === 'profile' ? 'profile' : initialGroup === 'infographic' ? 'infographic' : 'topic'
  );
  const [uploadOrientation, setUploadOrientation] = useState<'vertical' | 'horizontal'>(initialOrientation);
  const [uploadScalePercentage, setUploadScalePercentage] = useState<number>(100);

  const [uploadPreset, setUploadPreset] = useState<PhotoPresetType>(
    initialGroup === 'infographic'
      ? (initialOrientation === 'horizontal' ? 'infographic_horizontal' : 'infographic_vertical')
      : initialGroup === 'profile'
      ? 'profile_square'
      : 'topic_landscape'
  );
  const [uploadFitMode, setUploadFitMode] = useState<PhotoFitMode>(
    initialGroup === 'infographic' ? 'no_crop_scale' : 'crop_cover'
  );

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadPhotographer, setUploadPhotographer] = useState('تصميم: وحدة الإنفوجرافيك وصحافة البيانات');
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

  // Process image with options
  const processImageWithOptions = async (
    file: File,
    presetKey: PhotoPresetType,
    fitModeKey: PhotoFitMode,
    scalePercent: number = uploadScalePercentage
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
          backgroundColor: '#18181b',
          scalePercentage: scalePercent
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
    const recommendedFit =
      uploadGroup === 'infographic'
        ? 'no_crop_scale'
        : PHOTO_PRESETS[uploadPreset]?.defaultFitMode || 'crop_cover';
    setUploadFitMode(recommendedFit);
    processImageWithOptions(file, uploadPreset, recommendedFit, uploadScalePercentage);
  };

  // Switch upload section (Topic / Profile / Infographic)
  const handleSelectUploadGroup = (group: 'topic' | 'profile' | 'infographic') => {
    setUploadGroup(group);
    let targetPreset: PhotoPresetType = 'topic_landscape';
    let targetFit: PhotoFitMode = 'crop_cover';

    if (group === 'profile') {
      targetPreset = 'profile_square';
      targetFit = 'crop_cover';
      setUploadPhotographer('بروفايل: هيئة التحرير');
    } else if (group === 'infographic') {
      targetPreset = uploadOrientation === 'horizontal' ? 'infographic_horizontal' : 'infographic_vertical';
      targetFit = 'no_crop_scale';
      setUploadPhotographer('تصميم: وحدة الإنفوجرافيك وصحافة البيانات');
    } else {
      targetPreset = 'topic_landscape';
      targetFit = 'crop_cover';
      setUploadPhotographer('عدسة: MUDigital');
    }

    setUploadPreset(targetPreset);
    setUploadFitMode(targetFit);

    if (rawFile) {
      processImageWithOptions(rawFile, targetPreset, targetFit, uploadScalePercentage);
    }
  };

  // Switch Infographic orientation (vertical / horizontal)
  const handleSelectOrientation = (orientation: 'vertical' | 'horizontal') => {
    setUploadOrientation(orientation);
    let nextPreset: PhotoPresetType =
      orientation === 'horizontal' ? 'infographic_horizontal' : 'infographic_vertical';
    setUploadPreset(nextPreset);
    setUploadFitMode('no_crop_scale');

    if (rawFile) {
      processImageWithOptions(rawFile, nextPreset, 'no_crop_scale', uploadScalePercentage);
    }
  };

  // Change scale percentage for no-crop scaling
  const handleScalePercentageChange = (percent: number) => {
    setUploadScalePercentage(percent);
    if (rawFile) {
      processImageWithOptions(rawFile, uploadPreset, uploadFitMode, percent);
    }
  };

  // Re-process on preset change
  const handlePresetChange = (newPreset: PhotoPresetType) => {
    setUploadPreset(newPreset);
    const recommendedFit =
      uploadGroup === 'infographic'
        ? 'no_crop_scale'
        : PHOTO_PRESETS[newPreset]?.defaultFitMode || 'crop_cover';
    setUploadFitMode(recommendedFit);
    if (rawFile) {
      processImageWithOptions(rawFile, newPreset, recommendedFit, uploadScalePercentage);
    }
  };

  // Re-process on fitMode change
  const handleFitModeChange = (newFit: PhotoFitMode) => {
    setUploadFitMode(newFit);
    if (rawFile) {
      processImageWithOptions(rawFile, uploadPreset, newFit, uploadScalePercentage);
    }
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optimizedPreview) return;

    const isInfographic =
      uploadGroup === 'infographic' ||
      uploadPreset === 'infographic_vertical' ||
      uploadPreset === 'infographic_horizontal' ||
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
      isInfographic,
      orientation: uploadGroup === 'infographic' ? uploadOrientation : undefined,
      scalePercentage: uploadScalePercentage
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

  // Filter gallery items by group and search query
  const filteredPhotos = photoLibrary.filter((p) => {
    let matchesGroup = true;
    if (activeGroupFilter === 'topic') {
      matchesGroup = p.preset === 'topic_landscape' || p.preset === 'standard_photo' || p.preset === 'banner_wide';
    } else if (activeGroupFilter === 'profile') {
      matchesGroup = p.preset === 'profile_square';
    } else if (activeGroupFilter === 'infographic') {
      matchesGroup =
        p.isInfographic === true ||
        p.preset === 'infographic_vertical' ||
        p.preset === 'infographic_horizontal' ||
        p.preset === 'original_no_crop' ||
        p.preset === 'story_vertical' ||
        p.fitMode === 'no_crop_scale' ||
        p.height > p.width * 1.15;
    }

    const matchesPreset = activePresetFilter === 'all' || p.preset === activePresetFilter;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.caption && p.caption.toLowerCase().includes(q)) ||
      (p.photographer && p.photographer.toLowerCase().includes(q));

    return matchesGroup && matchesPreset && matchesSearch;
  });

  const selectedPhoto = photoLibrary.find((p) => p.id === selectedPhotoId);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="bg-[#FBF9F5] dark:bg-[#121316] w-full max-w-6xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col max-h-[94vh] my-auto transition-colors font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-600/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-headline text-stone-950 dark:text-white flex items-center gap-2">
                <span>{modalTitle || 'مكتبة الصور والوسائط والإنفوجرافيك'}</span>
                {onSelectPhoto && (
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-sans font-medium">
                    وضع الاختيار للمحتوى
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                إدارة وسائط المقالات، صور البروفايل، وقسم الإنفوجرافيك الطولي والعريض بدون أي قص
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

        {/* Feature Notice Banner */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-emerald-50 via-amber-50/50 to-emerald-50 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 border-b border-stone-200 dark:border-stone-800 text-xs">
          <div className="flex items-center justify-between gap-3 flex-wrap text-stone-800 dark:text-stone-200">
            <div className="flex items-center gap-2">
              <Scaling className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-emerald-900 dark:text-emerald-300">
                ميزة تصغير الحجم بدون قص (No-Crop Scaling):
              </span>
              <span className="text-stone-600 dark:text-stone-400 hidden sm:inline">
                قسم مخصص للإنفوجرافيك الطولي والعريض والصور التي يتم استخدام حجمها الطبيعي أو تصغيرها بنسبة 0% قص.
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-600 dark:text-stone-300">
                موضوعية: 1200×675
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-600 dark:text-stone-300">
                شخصية: 400×400
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-700 font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                إنفوجرافيك: كامل (0% قص)
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isUploading ? (
            /* UPLOAD & SMART FIT FORM */
            <form onSubmit={handleSaveUpload} className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
              
              {/* Step 1: Select Main Section (Topic / Profile / Infographic) */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-2">
                  1. اختر قسم ونوع الصورة المراد رفعها إلى المكتبة: *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Topic Section Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectUploadGroup('topic')}
                    className={`p-3.5 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between ${
                      uploadGroup === 'topic'
                        ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-600/30 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-amber-600" />
                          <span>الصور الموضوعية (للمقالات والتحقيقات)</span>
                        </span>
                        {uploadGroup === 'topic' && <Check className="w-4 h-4 text-amber-600" />}
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        صور أفقية قياسية لغلاف الأخبار والتقارير والتحقيقات بنسبة 16:9 و 4:3.
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">
                      1200 × 675 px (أفقي)
                    </div>
                  </button>

                  {/* Profile Section Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectUploadGroup('profile')}
                    className={`p-3.5 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between ${
                      uploadGroup === 'profile'
                        ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-600/30 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-amber-600" />
                          <span>الصور الشخصية (لهيئة التحرير والبروفايل)</span>
                        </span>
                        {uploadGroup === 'profile' && <Check className="w-4 h-4 text-amber-600" />}
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        صور مربعة للمحررين والكُتّاب وبطاقات المشاركين في مشروع التخرج.
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">
                      400 × 400 px (مربع 1:1)
                    </div>
                  </button>

                  {/* Dedicated Infographic & No-Crop Section Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectUploadGroup('infographic')}
                    className={`p-3.5 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between ${
                      uploadGroup === 'infographic'
                        ? 'border-emerald-600 bg-emerald-50/90 dark:bg-emerald-950/50 ring-2 ring-emerald-600/40 shadow-xs'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 hover:border-emerald-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                          <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>قسم صور الإنفوجرافيك والمخططات (بدون قص)</span>
                        </span>
                        {uploadGroup === 'infographic' && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        تصغير الحجم أو استخدام الحجم الطبيعي للإنفوجرافيك رأسياً أو عريضاً بنسبة قص 0%.
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      رأسي وعريض (كامل 100%)
                    </div>
                  </button>

                </div>
              </div>

              {/* DEDICATED INFOGRAPHIC SECTION OPTIONS & EXPLANATION */}
              {uploadGroup === 'infographic' && (
                <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-4 animate-fadeIn">
                  
                  {/* Official User-Requested Clarification Banner */}
                  <div className="p-3.5 bg-white dark:bg-stone-900 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 dark:text-emerald-200">
                      <BarChart2 className="w-4 h-4 text-emerald-600" />
                      <span>توضيح قسم صور الإنفوجرافيك والمخططات البيانية:</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      هذا القسم مخصص لصور الإنفوجرافيك والرسوم البيانية والصور التي يتم استخدام حجمها الطبيعي أو تصغيرها بدون قص، مع إتاحة خيارات وضع الصورة عريضاً أو رأسياً، وقائمة خيارات بمقاسات مختلفة يختار المحرر من بينها المقاس الذي يريده للصورة دون أي اقتطاع.
                    </p>
                  </div>

                  {/* Orientation Toggles: Vertical vs Horizontal */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-2">
                      أ) اتجاه وضع الصورة:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectOrientation('vertical')}
                        className={`p-3 rounded-xl border text-right cursor-pointer transition-all flex items-center justify-between ${
                          uploadOrientation === 'vertical'
                            ? 'border-emerald-600 bg-white dark:bg-stone-900 ring-2 ring-emerald-500/30 text-emerald-950 dark:text-emerald-100 font-bold'
                            : 'border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/50 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div className="text-xs">رأسياً (عمودي / Portrait)</div>
                            <div className="text-[10px] opacity-75 font-normal">للإنفوجرافيك الطولي وشاشات الهواتف والقصص</div>
                          </div>
                        </div>
                        {uploadOrientation === 'vertical' && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectOrientation('horizontal')}
                        className={`p-3 rounded-xl border text-right cursor-pointer transition-all flex items-center justify-between ${
                          uploadOrientation === 'horizontal'
                            ? 'border-emerald-600 bg-white dark:bg-stone-900 ring-2 ring-emerald-500/30 text-emerald-950 dark:text-emerald-100 font-bold'
                            : 'border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/50 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div className="text-xs">عريضاً (أفقي / Landscape)</div>
                            <div className="text-[10px] opacity-75 font-normal">للإنفوجرافيك العريض والخرائط والمخططات البيانية</div>
                          </div>
                        </div>
                        {uploadOrientation === 'horizontal' && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    </div>
                  </div>

                  {/* Preset Sizes List for Infographics */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-2">
                      ب) قائمة مقاسات الإنفوجرافيك المعتمدة (اختر المقاس المناسب):
                    </label>

                    {uploadOrientation === 'vertical' ? (
                      /* VERTICAL SIZES */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        
                        {/* 1. Natural Size */}
                        <div
                          onClick={() => handlePresetChange('original_no_crop')}
                          className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                            uploadPreset === 'original_no_crop'
                              ? 'border-emerald-600 bg-white dark:bg-stone-900 ring-2 ring-emerald-600/30'
                              : 'border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              الحجم الطبيعي 100% (أبعاد التصميم كاملة)
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-bold">
                              الأصل بدون قص
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            الحفاظ على الأبعاد الأصلية بنسبة 100% دون أي تعديل أو قص، مع ضغط ذكي لحجم الملف.
                          </p>
                        </div>

                        {/* 2. Full Tall Infographic */}
                        <div
                          onClick={() => handlePresetChange('infographic_vertical')}
                          className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                            uploadPreset === 'infographic_vertical'
                              ? 'border-emerald-600 bg-white dark:bg-stone-900 ring-2 ring-emerald-600/30'
                              : 'border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              إنفوجرافيك طولي فائق (1080 × 2800)
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-bold">
                              1:2.6 طولي كامل
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            المقاس القياسي لبوسترات صحافة البيانات والتقارير الإحصائية الطويلة المتسلسلة.
                          </p>
                        </div>

                        {/* 3. Story Vertical (1080x1350) */}
                        <div
                          onClick={() => handlePresetChange('story_vertical')}
                          className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                            uploadPreset === 'story_vertical'
                              ? 'border-emerald-600 bg-white dark:bg-stone-900 ring-2 ring-emerald-600/30'
                              : 'border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              قصة / تقرير رأسي (1080 × 1350)
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold">
                              4:5 شاشات الهواتف
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            المقاس المعتمد للقصص الرأسية والإنفوجرافيك القصير والرسومات التوضيحية للموبايل.
                          </p>
                        </div>

                        {/* 4. Full-HD Mobile Vertical */}
                        <div
                          onClick={() => handlePresetChange('infographic_vertical')}
                          className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 text-right"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              إنفوجرافيك كامل الشاشة (1080 × 1920)
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold">
                              9:16 رأسي
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            نسبة 9:16 القياسية لشاشات الهواتف الذكية والتطبيقات الصحفية.
                          </p>
                        </div>

                      </div>
                    ) : (
                      /* HORIZONTAL SIZES */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        
                        {/* 1. Natural Size */}
                        <div
                          onClick={() => handlePresetChange('original_no_crop')}
                          className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                            uploadPreset === 'original_no_crop'
                              ? 'border-emerald-600 bg-white dark:bg-stone-900 ring-2 ring-emerald-600/30'
                              : 'border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              الحجم الطبيعي 100% (أبعاد التصميم كاملة)
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-bold">
                              الأصل بدون قص
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            الحفاظ على كامل الأبعاد الأفقية والتفاصيل الدقيقة كما أنتجها المصمم.
                          </p>
                        </div>

                        {/* 2. Full HD Horizontal Infographic */}
                        <div
                          onClick={() => handlePresetChange('infographic_horizontal')}
                          className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                            uploadPreset === 'infographic_horizontal'
                              ? 'border-emerald-600 bg-white dark:bg-stone-900 ring-2 ring-emerald-600/30'
                              : 'border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              إنفوجرافيك عريض ومخطط فائق (1920 × 1080)
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-bold">
                              16:9 عريض
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            المقاس المعتمد للخرائط التفاعلية الكبيرة والرسوم البيانية الأفقية لشاشات الكمبيوتر.
                          </p>
                        </div>

                        {/* 3. Compact Horizontal (1600x900) */}
                        <div
                          onClick={() => handlePresetChange('infographic_horizontal')}
                          className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 text-right"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              إنفوجرافيك أفقي سريع التحميل (1600 × 900)
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold">
                              16:9 خفيف
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            مقاس متناسق يجمع بين الوضوح العالي وسرعة التحميل الفائقة.
                          </p>
                        </div>

                        {/* 4. Classic Chart (1200x900 - 4:3) */}
                        <div
                          onClick={() => handlePresetChange('standard_photo')}
                          className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/60 text-right"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              مخطط بياني إحصائي كلاسيكي (1200 × 900)
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold">
                              4:3 متناسق
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            المقاس الأنسب للجداول الإحصائية، المقارنات، والرسوم الهندسية.
                          </p>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Percentage Scaling Options (No-Crop) */}
                  <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-emerald-600" />
                        <span>جـ) خيارات تصغير الحجم بدون قص (لتخفيف حجم الملف):</span>
                      </label>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {uploadScalePercentage}% من الحجم الأصلي
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[100, 75, 50, 35].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleScalePercentageChange(pct)}
                          className={`py-1.5 px-2 text-xs rounded-lg font-bold border transition-colors cursor-pointer ${
                            uploadScalePercentage === pct
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {pct === 100 ? '100% (الأصل)' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TOPIC OR PROFILE REGULAR PRESETS */}
              {uploadGroup !== 'infographic' && (
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-2">
                    المقاس المعتمد للصورة: *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {uploadGroup === 'topic' ? (
                      <>
                        <div
                          onClick={() => handlePresetChange('topic_landscape')}
                          className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                            uploadPreset === 'topic_landscape'
                              ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-600/30'
                              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850'
                          }`}
                        >
                          <div className="font-bold text-xs text-stone-900 dark:text-stone-100 mb-1 flex items-center justify-between">
                            <span>غلاف المقالات والتحقيقات الصحفية (16:9)</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold">
                              1200 × 675
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            المقاس القياسي لغلاف كافة الأخبار والتحقيقات الصحفية.
                          </p>
                        </div>

                        <div
                          onClick={() => handlePresetChange('banner_wide')}
                          className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                            uploadPreset === 'banner_wide'
                              ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-600/30'
                              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850'
                          }`}
                        >
                          <div className="font-bold text-xs text-stone-900 dark:text-stone-100 mb-1 flex items-center justify-between">
                            <span>بانر عريض وتغطية تفاعلية (8:3)</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold">
                              1600 × 600
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">
                            المقاس المعتمد للبانرات العريضة ومشروعات التخرج والملفات الخاصة.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div
                        onClick={() => handlePresetChange('profile_square')}
                        className="p-3 rounded-xl border border-amber-600 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-600/30 text-right"
                      >
                        <div className="font-bold text-xs text-stone-900 dark:text-stone-100 mb-1 flex items-center justify-between">
                          <span>صورة شخصية دائرية للمحررين (1:1)</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-600 text-white font-bold">
                            400 × 400
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          تُعرض دائرياً وبدقة عالية في بروفايل الكاتب وبطاقات التحرير.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Fit Mode Selection */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Crop className="w-4 h-4 text-amber-600" />
                    <span>2. خيارات المعالجة والاقتصاص: *</span>
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
                      تصغير الحجم والضغط الذكي مع الحفاظ على كامل الارتفاع والبيانات بنسبة 100%.
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
                      وضع الصورة كاملة داخل المقاس مع هوامش أنيقة دون اقتطاع أي بكسل.
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
                      <span>قص وتوسيط لملء الإطار</span>
                      {uploadFitMode === 'crop_cover' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      اقتصاص وتوسيط الصورة لتملأ أبعاد الإطار تماماً بدقة عالية بدون حواف.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 3: File Picker & Live Inspection */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  3. اختيار ملف الصورة أو الإنفوجرافيك من جهازك: *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-600 dark:hover:border-amber-500 rounded-2xl p-6 text-center bg-white dark:bg-stone-850 cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelected(file);
                    }}
                  />
                  <Upload className="w-8 h-8 mx-auto text-stone-400 dark:text-stone-500 mb-2" />
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    اضغط لاختيار صورة، أو اسحب الملف وأفلته هنا
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    يدعم ملفات JPG, PNG, WebP (بما فيها الإنفوجرافيك الطويل عالي الدقة بدون أي قيود على الارتفاع)
                  </p>
                </div>

                {/* Live Inspection Card */}
                {optimizedPreview && (
                  <div className="mt-4 p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 space-y-3 animate-fadeIn">
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

                    {/* Preview Canvas */}
                    <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-900 flex items-center justify-center max-h-96 overflow-y-auto p-2">
                      <img
                        src={optimizedPreview.dataUrl}
                        alt="Preview"
                        className="max-w-full max-h-96 object-contain mx-auto rounded"
                      />
                    </div>

                    {/* Process Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                        <span className="text-[10px] text-stone-500 block">الأبعاد الأصلية:</span>
                        <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                          {optimizedPreview.originalWidth} × {optimizedPreview.originalHeight} px
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
                        <span className="text-[10px] text-stone-500 block">الأبعاد المعالجة:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
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
                        <span className="text-[10px] text-stone-500 block">حجم الملف بعد الضغط:</span>
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

              {/* Form Action Buttons */}
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
              {/* Category Group Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs no-scrollbar">
                  
                  {/* All */}
                  <button
                    onClick={() => {
                      setActiveGroupFilter('all');
                      setActivePresetFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      activeGroupFilter === 'all'
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    الكل ({photoLibrary.length})
                  </button>

                  {/* 1. Topic Section Tab */}
                  <button
                    onClick={() => {
                      setActiveGroupFilter('topic');
                      setActivePresetFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      activeGroupFilter === 'topic'
                        ? 'bg-amber-700 text-white dark:bg-amber-600'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>الصور الموضوعية (للمقالات والتحقيقات)</span>
                  </button>

                  {/* 2. Profile Section Tab */}
                  <button
                    onClick={() => {
                      setActiveGroupFilter('profile');
                      setActivePresetFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      activeGroupFilter === 'profile'
                        ? 'bg-amber-700 text-white dark:bg-amber-600'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>الصور الشخصية (لهيئة التحرير والبروفايل)</span>
                  </button>

                  {/* 3. Infographic Section Tab */}
                  <button
                    onClick={() => {
                      setActiveGroupFilter('infographic');
                      setActivePresetFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      activeGroupFilter === 'infographic'
                        ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-xs'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span className="font-bold">قسم صور الإنفوجرافيك والمخططات (بدون قص)</span>
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
                    لا توجد صور مطابقة لهذا القسم
                  </h4>
                  <p className="text-xs text-stone-500 mb-4">
                    يمكنك رفع صورة جديدة أو إنفوجرافيك وضبط أبعادها تلقائياً بدون أي قص.
                  </p>
                  <button
                    onClick={() => setIsUploading(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
                  >
                    رفع صورة أو إنفوجرافيك الآن
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredPhotos.map((photo) => {
                    const isSelected = selectedPhotoId === photo.id;
                    const presetInfo = PHOTO_PRESETS[photo.preset] || PHOTO_PRESETS.topic_landscape;
                    const isTall =
                      photo.preset === 'infographic_vertical' ||
                      photo.isInfographic ||
                      photo.fitMode === 'no_crop_scale' ||
                      photo.height > photo.width;

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
                        {/* Image Preview with Contain for Tall Graphics */}
                        <div className={`relative ${isTall ? 'h-64' : 'aspect-video'} bg-stone-950 overflow-hidden flex items-center justify-center group`}>
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className={`w-full h-full ${
                              isTall || photo.fitMode === 'no_crop_scale' ? 'object-contain p-1' : 'object-cover'
                            }`}
                          />

                          {/* Presets and Badges */}
                          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                            <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                              {presetInfo.badge}
                            </span>
                            {isTall && (
                              <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-xs flex items-center gap-1">
                                <BarChart2 className="w-2.5 h-2.5" />
                                <span>إنفوجرافيك كامل (بدون قص)</span>
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
                        </div>

                        {/* Photo Card Details */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                          {editingPhotoId === photo.id ? (
                            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                              />
                              <textarea
                                value={editCaption}
                                rows={2}
                                onChange={(e) => setEditCaption(e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(photo.id)}
                                  className="px-2 py-1 text-[11px] bg-amber-600 text-white rounded cursor-pointer"
                                >
                                  حفظ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPhotoId(null)}
                                  className="px-2 py-1 text-[11px] text-stone-500 cursor-pointer"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-1">
                                  {photo.title}
                                </h4>
                                <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed mt-0.5">
                                  {photo.caption || 'لا يوجد تعليق'}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
                                <span>{photo.photographer || 'تصميم صحفي'}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartEdit(photo);
                                    }}
                                    className="p-1 hover:text-amber-600 transition-colors"
                                    title="تعديل البيانات"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('هل أنت متأكد من حذف هذه الصورة من المكتبة؟')) {
                                        onDeletePhoto(photo.id);
                                      }
                                    }}
                                    className="p-1 hover:text-rose-600 transition-colors"
                                    title="حذف الصورة"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Selection Actions */}
        {onSelectPhoto && !isUploading && (
          <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 flex items-center justify-between">
            <div className="text-xs text-stone-500">
              {selectedPhoto ? (
                <span className="text-stone-900 dark:text-stone-100 font-bold">
                  الصورة المحددة: {selectedPhoto.title} ({selectedPhoto.width} × {selectedPhoto.height} px)
                </span>
              ) : (
                <span>الرجاء النقر على صورة لاختيارها</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!selectedPhoto}
                onClick={() => {
                  if (selectedPhoto) {
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
                  }
                }}
                className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>تأكيد استخدام الصورة المحددة</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* FULL-SIZE INFOGRAPHIC PREVIEW MODAL */}
      {fullPreviewPhoto && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setFullPreviewPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">{fullPreviewPhoto.title}</span>
                <span className="font-mono text-stone-400 text-[11px]">
                  ({fullPreviewPhoto.width} × {fullPreviewPhoto.height} px)
                </span>
              </div>
              <button
                onClick={() => setFullPreviewPhoto(null)}
                className="p-1 rounded text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-stone-950">
              <img
                src={fullPreviewPhoto.url}
                alt={fullPreviewPhoto.title}
                className="max-w-full h-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
