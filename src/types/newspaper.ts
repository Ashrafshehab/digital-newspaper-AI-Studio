export type ArticleWorkflowStatus =
  | 'draft'
  | 'pending_review'
  | 'Pending Review'
  | 'pending_section_head'
  | 'pending_proofreading'
  | 'pending_managing_editor'
  | 'published'
  | 'returned_for_revision';

export interface WorkflowLog {
  id: string;
  stageName: string;
  actorName: string;
  actorRole: string;
  action: 'submit' | 'approve' | 'revise' | 'publish' | 'review';
  timestamp: string;
  notes?: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorRole?: string;
  date: string;
  text: string;
  likes: number;
}

export type FactCheckVerdict =
  | 'verified'          // حقائق مؤكدة وموثقة (100% Verified)
  | 'official_source'   // مستند إلى مصادر رسمية معتمدة
  | 'investigative'     // تحقيق استقصائي مدعوم بالوثائق
  | 'expert_reviewed'   // مراجع من خبراء وأكاديميين
  | 'in_progress';      // التدقيق جارٍ

export interface VerificationSource {
  id: string;
  title: string;
  type: 'official_document' | 'interview' | 'field_data' | 'academic_study' | 'press_release';
  typeLabelAr?: string;
  url?: string;
  notes?: string;
}

export interface FactCheckInfo {
  verdict: FactCheckVerdict;
  verdictLabelAr: string;
  checkedBy: string;
  checkedAt: string;
  transparencyScore: number; // e.g. 98
  methodologySummary: string;
  sourcesList: VerificationSource[];
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string[];
  pullQuote?: string;
  category: string;
  categoryId: string;
  author: {
    name: string;
    role: string;
    studentId?: string;
    avatar: string;
    email?: string;
    bio?: string;
  };
  publishedAt: string;
  readTimeMinutes: number;
  image: string;
  imageCaption?: string;
  isLead?: boolean;
  isBreaking?: boolean;
  isEditorPick?: boolean;
  trendingRank?: number;
  views: number;
  likes: number;
  tags: string[];
  comments: Comment[];
  audioDuration?: string;
  status: ArticleWorkflowStatus;
  workflowLogs?: WorkflowLog[];
  editorialNotes?: string;
  lastEditedAt?: string;
  correctionNotice?: string;
  factCheck?: FactCheckInfo;
  mediaType?: 'article' | 'infographic' | 'video' | 'podcast' | 'photo_story';
  imageDisplayMode?: 'cover' | 'contain' | 'infographic_vertical' | 'natural';
  videoUrl?: string;
  podcastUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface GraduationProjectInfo {
  university: string;
  faculty: string;
  department: string;
  academicYear: string;
  projectTitle: string;
  supervisor: string;
  teamMembers: Array<{
    name: string;
    role: string;
    code: string;
  }>;
  objectives: string[];
  summary: string;
}

export type EditorialRole =
  | 'admin'
  | 'student_editor'
  | 'section_head'
  | 'proofreader'
  | 'managing_editor'
  | 'editor_in_chief';

export interface EditorialUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: EditorialRole;
  roleTitleAr: string;
  avatar: string;
  email?: string;
  bio?: string;
  studentId?: string;
  department?: string;
  canPublish: boolean;
  canManageCategories?: boolean;
  canManageUsers?: boolean;
  joinedDate?: string;
}

export type PhotoPresetType =
  | 'topic_landscape'
  | 'infographic_vertical'
  | 'infographic_horizontal'
  | 'original_no_crop'
  | 'story_vertical'
  | 'profile_square'
  | 'banner_wide'
  | 'standard_photo';

export type PhotoCategoryGroup = 'all' | 'topic' | 'profile' | 'infographic';

export type PhotoFitMode = 'no_crop_scale' | 'contain_letterbox' | 'crop_cover';

export interface PhotoPresetConfig {
  id: PhotoPresetType;
  label: string;
  recommendedWidth: number;
  recommendedHeight: number;
  aspectRatio: string;
  usageDescription: string;
  badge: string;
  isVertical?: boolean;
  orientation?: 'vertical' | 'horizontal' | 'square';
  group: 'topic' | 'profile' | 'infographic';
  defaultFitMode?: PhotoFitMode;
}

export interface PhotoLibraryItem {
  id: string;
  title: string;
  url: string;
  caption: string;
  photographer?: string;
  preset: PhotoPresetType;
  fitMode?: PhotoFitMode;
  width: number;
  height: number;
  uploadedAt: string;
  fileSizeKB?: number;
  originalWidth?: number;
  originalHeight?: number;
  isInfographic?: boolean;
  orientation?: 'vertical' | 'horizontal' | 'square';
  scalePercentage?: number;
}

