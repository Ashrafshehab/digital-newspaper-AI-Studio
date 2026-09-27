import { PhotoPresetConfig, PhotoPresetType, PhotoFitMode } from '../types/newspaper';

export interface OptimizeOptions {
  fitMode?: PhotoFitMode;
  quality?: number;
  backgroundColor?: string;
  maxDimension?: number;
  scalePercentage?: number;
}

export const PHOTO_PRESETS: Record<PhotoPresetType, PhotoPresetConfig> = {
  // 1. قسم الصور الموضوعية (للمقالات والتقارير والتحقيقات)
  topic_landscape: {
    id: 'topic_landscape',
    label: 'صورة موضوعية أفقية (المقال والتحقيق)',
    recommendedWidth: 1200,
    recommendedHeight: 675,
    aspectRatio: '16:9',
    usageDescription: 'المقاس المعتمد لغلاف المقالات والتقارير والتحقيقات الصحفية والقارئ السريع ليملأ الشاشة بدقة عالية.',
    badge: '1200 × 675 (أفقي 16:9)',
    isVertical: false,
    orientation: 'horizontal',
    group: 'topic',
    defaultFitMode: 'crop_cover'
  },
  standard_photo: {
    id: 'standard_photo',
    label: 'صورة تحقيق ميداني كلاسيكية',
    recommendedWidth: 1000,
    recommendedHeight: 750,
    aspectRatio: '4:3',
    usageDescription: 'المقاس المعتمد للقطات الميدانية من الحرم الجامعي، مقابلات الشخصيات، والندوات الأكاديمية.',
    badge: '1000 × 750 (أفقي 4:3)',
    isVertical: false,
    orientation: 'horizontal',
    group: 'topic',
    defaultFitMode: 'crop_cover'
  },
  banner_wide: {
    id: 'banner_wide',
    label: 'بانر عريض / تغطية تفاعلية خاصة',
    recommendedWidth: 1600,
    recommendedHeight: 600,
    aspectRatio: '8:3 عريض',
    usageDescription: 'المقاس المعتمد للملفات الصحفية التفاعلية، مشروعات التخرج، والبانرات التحريرية العريضة.',
    badge: '1600 × 600 (عريض 8:3)',
    isVertical: false,
    orientation: 'horizontal',
    group: 'topic',
    defaultFitMode: 'crop_cover'
  },

  // 2. قسم الصور الشخصية (لهيئة التحرير والبروفايل)
  profile_square: {
    id: 'profile_square',
    label: 'صورة شخصية للمحرر / بروفايل',
    recommendedWidth: 400,
    recommendedHeight: 400,
    aspectRatio: '1:1',
    usageDescription: 'المقاس المعتمد للصور الشخصية لهيئة التحرير، بروفايل الكتّاب، والبطاقات التحريرية، ويتم اقتصاصها وتوسيطها بنقاء متناهٍ.',
    badge: '400 × 400 (مربع 1:1)',
    isVertical: false,
    orientation: 'square',
    group: 'profile',
    defaultFitMode: 'crop_cover'
  },

  // 3. قسم صور الإنفوجرافيك والمخططات البيانية (حجم طبيعي وتصغير بدون قص)
  infographic_vertical: {
    id: 'infographic_vertical',
    label: 'إنفوجرافيك طولي كامل (بدون أي قص)',
    recommendedWidth: 1080,
    recommendedHeight: 2800,
    aspectRatio: 'رأسي مرن (100% كامل)',
    usageDescription: 'مخصص للإنفوجرافيك الطويل، رسوم البيانات الإحصائية، والمخططات الرأسية، مع المحافظة على كامل الارتفاع والبيانات بنسبة 100% دون أي اقتصاص.',
    badge: 'رأسي: طولي فائق (بدون قص)',
    isVertical: true,
    orientation: 'vertical',
    group: 'infographic',
    defaultFitMode: 'no_crop_scale'
  },
  story_vertical: {
    id: 'story_vertical',
    label: 'إنفوجرافيك / قصة رأسية لشاشات الهواتف',
    recommendedWidth: 1080,
    recommendedHeight: 1350,
    aspectRatio: '4:5 رأسي',
    usageDescription: 'المقاس المعتمد للقصص الرأسية، الإنفوجرافيك المتوسط، والتقارير المصورة لشاشات الهواتف والشبكات الاجتماعية بدون قص.',
    badge: 'رأسي: 1080 × 1350 (4:5)',
    isVertical: true,
    orientation: 'vertical',
    group: 'infographic',
    defaultFitMode: 'no_crop_scale'
  },
  infographic_horizontal: {
    id: 'infographic_horizontal',
    label: 'إنفوجرافيك عريض ومخطط بياني أفقي (بدون أي قص)',
    recommendedWidth: 1920,
    recommendedHeight: 1080,
    aspectRatio: 'أفقي كامل (16:9)',
    usageDescription: 'مخصص للرسوم البيانية العريضة، الخرائط التوضيحية، والجداول الإحصائية الأفقية، مع الحفاظ على كامل التفاصيل بدون قص.',
    badge: 'عريض: 1920 × 1080 (أفقي 16:9)',
    isVertical: false,
    orientation: 'horizontal',
    group: 'infographic',
    defaultFitMode: 'no_crop_scale'
  },
  original_no_crop: {
    id: 'original_no_crop',
    label: 'الحجم الطبيعي 100% أو تصغير متناسب (بدون أي قص)',
    recommendedWidth: 1600,
    recommendedHeight: 2400,
    aspectRatio: 'النسبة الطبيعية 100%',
    usageDescription: 'يقوم باستخدام الحجم الطبيعي للصورة أو تصغيرها مع ضغط ذكي دون اقتطاع أي بكسل من أبعاد الصورة سواء كانت أفقية أو رأسية.',
    badge: 'الحجم الطبيعي (بدون قص)',
    isVertical: false,
    orientation: 'vertical',
    group: 'infographic',
    defaultFitMode: 'no_crop_scale'
  }
};

/**
 * Loads an image from a File or DataURL/URL and processes it with flexible options:
 * - 'no_crop_scale': Preserves 100% of the image, scaling down proportionally if it exceeds bounds (ideal for Infographics & tall images).
 * - 'contain_letterbox': Fits full image into target canvas with letterboxing/margins (0% cropped).
 * - 'crop_cover': Traditional center-cover crop to fill target dimensions.
 */
export async function optimizeAndResizeImage(
  source: File | string,
  targetWidth: number,
  targetHeight: number,
  optionsOrQuality: number | OptimizeOptions = 0.88
): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  fileSizeKB: number;
  cropPercent: number;
  fitMode: PhotoFitMode;
}> {
  const options: OptimizeOptions =
    typeof optionsOrQuality === 'number'
      ? { quality: optionsOrQuality, fitMode: 'crop_cover' }
      : { quality: 0.88, fitMode: 'crop_cover', ...optionsOrQuality };

  const quality = options.quality ?? 0.88;
  const fitMode = options.fitMode ?? 'crop_cover';

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoadedImage = () => {
      try {
        const origW = img.width;
        const origH = img.height;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('فشل إنشاء سياق الرسم في المتصفح'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        let finalWidth = targetWidth;
        let finalHeight = targetHeight;
        let cropPercent = 0;

        if (fitMode === 'no_crop_scale') {
          // Keep natural aspect ratio with ZERO crop.
          // Scale down only if image width or height exceeds maximum thresholds.
          const maxW = targetWidth > 0 ? targetWidth : 1200;
          const maxH = targetHeight > 0 ? targetHeight : 2800;

          let scaleRatio = 1;
          if (options.scalePercentage && options.scalePercentage > 0 && options.scalePercentage <= 100) {
            scaleRatio = options.scalePercentage / 100;
          } else {
            scaleRatio = Math.min(1, maxW / origW, maxH / origH);
          }
          finalWidth = Math.max(1, Math.round(origW * scaleRatio));
          finalHeight = Math.max(1, Math.round(origH * scaleRatio));

          canvas.width = finalWidth;
          canvas.height = finalHeight;

          // Draw full uncropped image
          ctx.drawImage(img, 0, 0, origW, origH, 0, 0, finalWidth, finalHeight);
          cropPercent = 0;
        } else if (fitMode === 'contain_letterbox') {
          // Fit entire image into exact targetWidth x targetHeight box without cropping (letterbox)
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Background fill
          ctx.fillStyle = options.backgroundColor || '#18181b';
          ctx.fillRect(0, 0, targetWidth, targetHeight);

          const scale = Math.min(targetWidth / origW, targetHeight / origH);
          const drawW = Math.round(origW * scale);
          const drawH = Math.round(origH * scale);
          const dx = Math.round((targetWidth - drawW) / 2);
          const dy = Math.round((targetHeight - drawH) / 2);

          ctx.drawImage(img, 0, 0, origW, origH, dx, dy, drawW, drawH);
          cropPercent = 0;
        } else {
          // 'crop_cover': Center-crop to fill target dimensions
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const sourceAspect = origW / origH;
          const targetAspect = targetWidth / targetHeight;

          let sx = 0;
          let sy = 0;
          let sWidth = origW;
          let sHeight = origH;

          if (sourceAspect > targetAspect) {
            // Source is wider than target: crop left & right
            sWidth = origH * targetAspect;
            sx = (origW - sWidth) / 2;
          } else {
            // Source is taller than target: crop top & bottom
            sHeight = origW / targetAspect;
            sy = (origH - sHeight) / 2;
          }

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

          const usedArea = (sWidth * sHeight) / (origW * origH);
          cropPercent = Math.max(0, Math.min(100, Math.round((1 - usedArea) * 100)));
        }

        // Convert to optimized JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Approximate file size in KB from base64 string
        const sizeInBytes = Math.round((dataUrl.length * 3) / 4);
        const fileSizeKB = Math.round(sizeInBytes / 1024);

        resolve({
          dataUrl,
          width: finalWidth,
          height: finalHeight,
          originalWidth: origW,
          originalHeight: origH,
          fileSizeKB,
          cropPercent,
          fitMode
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onload = handleLoadedImage;
    img.onerror = () => reject(new Error('تعذر تحميل الصورة لمعالجتها'));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('تعذر قراءة ملف الصورة'));
        }
      };
      reader.onerror = () => reject(new Error('خطأ أثناء قراءة الملف'));
      reader.readAsDataURL(source);
    }
  });
}
