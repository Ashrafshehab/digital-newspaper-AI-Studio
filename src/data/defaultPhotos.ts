import { PhotoLibraryItem } from '../types/newspaper';

// Imported local assets
import heroImg from '../assets/images/hero_investigation_1790383838081.jpg';
import techImg from '../assets/images/tech_ai_arabic_1790383850276.jpg';
import campusImg from '../assets/images/campus_graduation_1790383861514.jpg';
import cultureImg from '../assets/images/culture_heritage_1790383871057.jpg';

export const INITIAL_PHOTO_LIBRARY: PhotoLibraryItem[] = [
  {
    id: 'photo-001',
    title: 'قاعة الأخبار واستوديو الإنتاج الرقمي',
    url: heroImg,
    caption: 'طلاب قسم الصحافة بالجامعة الحديثة MTI أثناء تدريب عملي داخل غرفة الأخبار الرقمية.',
    photographer: 'عدسة: المركز الإعلامي MTI',
    preset: 'topic_landscape',
    width: 1200,
    height: 675,
    uploadedAt: '2026/09/20',
    fileSizeKB: 245
  },
  {
    id: 'photo-002',
    title: 'خوارزميات الذكاء الاصطناعي وصحافة المستقبل',
    url: techImg,
    caption: 'ورشة عمل حول تدقيق الأخبار ومكافحة التضليل باستخدام النماذج اللغوية المتطورة.',
    photographer: 'أرشيف قسم تكنولوجيا الصحافة',
    preset: 'topic_landscape',
    width: 1200,
    height: 675,
    uploadedAt: '2026/09/21',
    fileSizeKB: 280
  },
  {
    id: 'photo-003',
    title: 'مبنى كلية الإعلام بالحرم الجامعي',
    url: campusImg,
    caption: 'أروقة الجامعة الحديثة للتكنولوجيا والمعلومات MTI مع انطلاق الفصل الدراسي.',
    photographer: 'تصوير: سارة المنصوري',
    preset: 'topic_landscape',
    width: 1200,
    height: 675,
    uploadedAt: '2026/09/22',
    fileSizeKB: 310
  },
  {
    id: 'photo-004',
    title: 'المخطوطات العربية والتراث الرقمي',
    url: cultureImg,
    caption: 'معرض رقمنة المخطوطات والوثائق التاريخية برعاية كلية الإعلام.',
    photographer: 'عدسة: يوسف البنا',
    preset: 'topic_landscape',
    width: 1200,
    height: 675,
    uploadedAt: '2026/09/23',
    fileSizeKB: 260
  },
  {
    id: 'photo-avatar-admin',
    title: 'صورة شخصية - مدير النظام (Admin)',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80',
    caption: 'صورة رسمية لمدير النظام ومشرف البنية التقنية بصحيفة MUDigital.',
    photographer: 'استوديو الهوية الرقمية',
    preset: 'profile_square',
    width: 400,
    height: 400,
    uploadedAt: '2026/09/15',
    fileSizeKB: 42
  },
  {
    id: 'photo-avatar-editor',
    title: 'صورة شخصية - محرر طالب',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
    caption: 'صورة رسمية لمحرر مسودات الأخبار والتحقيقات الاستقصائية.',
    photographer: 'شؤون الطلاب',
    preset: 'profile_square',
    width: 400,
    height: 400,
    uploadedAt: '2026/09/16',
    fileSizeKB: 48
  },
  {
    id: 'photo-avatar-dean',
    title: 'صورة شخصية - عميد ورئيس التحرير',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
    caption: 'صورة رسمية للأستاذ الدكتور رئيس التحرير والمشرف الأكاديمي العام.',
    photographer: 'المكتب الإعلامي للعمادة',
    preset: 'profile_square',
    width: 400,
    height: 400,
    uploadedAt: '2026/09/17',
    fileSizeKB: 55
  },
  {
    id: 'photo-standard-meeting',
    title: 'اجتماع هيئة التحرير والتخطيط الفصلي',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&h=750&q=80',
    caption: 'اجتماع تنسيقي لمناقشة خطة التغطيات الاستقصائية وصحافة الحلول.',
    photographer: 'هيئة التحرير',
    preset: 'standard_photo',
    width: 1000,
    height: 750,
    uploadedAt: '2026/09/18',
    fileSizeKB: 180
  }
];
