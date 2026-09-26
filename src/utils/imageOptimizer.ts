import { PhotoPresetConfig, PhotoPresetType } from '../types/newspaper';

export const PHOTO_PRESETS: Record<PhotoPresetType, PhotoPresetConfig> = {
  topic_landscape: {
    id: 'topic_landscape',
    label: 'صورة موضوعية للمقال والتحقيق',
    recommendedWidth: 1200,
    recommendedHeight: 675,
    aspectRatio: '16:9',
    usageDescription: 'المقاس المعتمد لغلاف المقالات والتحقيقات الصحفية والقارئ السريع ليملأ الشاشة بدقة عالية دون أي تشويه أو تمدد.',
    badge: '1200 × 675 (16:9)'
  },
  profile_square: {
    id: 'profile_square',
    label: 'صورة شخصية للمحرر / بروفايل',
    recommendedWidth: 400,
    recommendedHeight: 400,
    aspectRatio: '1:1',
    usageDescription: 'المقاس المعتمد للصور الشخصية لهيئة التحرير، بروفايل الكتّاب، والبطاقات التحريرية، ويتم اقتصاصها وتوسيطها بنقاء متناهٍ وخفة تحميل.',
    badge: '400 × 400 (1:1)'
  },
  banner_wide: {
    id: 'banner_wide',
    label: 'بانر عريض / تغطية خاصة',
    recommendedWidth: 1600,
    recommendedHeight: 600,
    aspectRatio: '8:3',
    usageDescription: 'المقاس المعتمد للملفات الصحفية التفاعلية، مشروعات التخرج، والبانرات التحريرية العريضة.',
    badge: '1600 × 600 (8:3)'
  },
  standard_photo: {
    id: 'standard_photo',
    label: 'صورة تحقيق ميداني كلاسيكية',
    recommendedWidth: 1000,
    recommendedHeight: 750,
    aspectRatio: '4:3',
    usageDescription: 'المقاس المعتمد للقطات الميدانية من الحرم الجامعي، مقابلات الشخصيات، والندوات الأكاديمية.',
    badge: '1000 × 750 (4:3)'
  }
};

/**
 * Loads an image from a File or DataURL/URL, crops it with a centered "cover" fit,
 * and scales it exactly to the target preset dimensions (width x height) using an off-screen HTML5 Canvas.
 */
export async function optimizeAndResizeImage(
  source: File | string,
  targetWidth: number,
  targetHeight: number,
  quality: number = 0.88
): Promise<{ dataUrl: string; width: number; height: number; fileSizeKB: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoadedImage = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('فشل إنشاء سياق الرسم في المتصفح'));
          return;
        }

        // Enable high quality image scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Calculate aspect ratios for center-cover cropping
        const sourceAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;

        let sx = 0;
        let sy = 0;
        let sWidth = img.width;
        let sHeight = img.height;

        if (sourceAspect > targetAspect) {
          // Source is wider than target: crop left & right
          sWidth = img.height * targetAspect;
          sx = (img.width - sWidth) / 2;
        } else {
          // Source is taller than target: crop top & bottom
          sHeight = img.width / targetAspect;
          sy = (img.height - sHeight) / 2;
        }

        // Draw cropped and scaled image onto canvas
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

        // Convert to optimized JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Approximate file size in KB from base64 string
        const sizeInBytes = Math.round((dataUrl.length * 3) / 4);
        const fileSizeKB = Math.round(sizeInBytes / 1024);

        resolve({
          dataUrl,
          width: targetWidth,
          height: targetHeight,
          fileSizeKB
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onload = handleLoadedImage;
    img.onerror = (e) => reject(new Error('تعذر تحميل الصورة لمعالجتها'));

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
