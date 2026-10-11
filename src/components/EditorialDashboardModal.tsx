import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Send,
  UserCheck,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  History,
  Lock,
  Eye,
  Settings,
  Edit2,
  Trash2,
  Save,
  Users,
  ShieldAlert,
  UserPlus,
  Mail,
  User,
  KeyRound,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  Upload,
  Info,
  Check,
  AlertTriangle,
  FolderOpen,
  BarChart3,
  BarChart2,
  Smartphone,
  Monitor,
  Globe,
  Share2,
  Film,
  Play
} from 'lucide-react';
import {
  Article,
  ArticleWorkflowStatus,
  EditorialUser,
  WorkflowLog,
  Category,
  EditorialRole,
  PhotoLibraryItem,
  PhotoPresetType,
  PhotoCategoryGroup,
  FactCheckInfo,
  FactCheckVerdict,
  SocialMediaAccounts
} from '../types/newspaper';
import { PhotoLibraryModal, PhotoSelectionResult } from './PhotoLibraryModal';
import { PHOTO_PRESETS, optimizeAndResizeImage } from '../utils/imageOptimizer';
import { EditorialAnalyticsTab } from './EditorialAnalyticsTab';
import { RichTextToolbar } from './RichTextToolbar';
import { RichTextEditor } from './RichTextEditor';
import { FormattedArticleContent, articleContentToHtml, htmlToArticleParagraphs } from '../utils/formattedContent';
import { WhatsAppIcon, XTwitterIcon, FacebookIcon, TelegramIcon } from './ArticleShareButtons';
import { VideoPlayer } from './VideoPlayer';

// Generated images for new articles
import heroImg from '../assets/images/hero_investigation_1790383838081.jpg';
import techImg from '../assets/images/tech_ai_arabic_1790383850276.jpg';
import campusImg from '../assets/images/campus_graduation_1790383861514.jpg';
import cultureImg from '../assets/images/culture_heritage_1790383871057.jpg';

interface EditorialDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: EditorialUser;
  onLogout: () => void;
  articles: Article[];
  onUpdateArticleWorkflow: (
    articleId: string,
    newStatus: ArticleWorkflowStatus,
    log: WorkflowLog
  ) => void;
  onAddNewArticle: (article: Article) => void;
  onUpdateArticle?: (articleId: string, updatedFields: Partial<Article>) => void;
  onViewArticlePreview: (article: Article) => void;
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
  editorialUsers: EditorialUser[];
  onAddUser: (user: EditorialUser) => void;
  onUpdateUser: (userId: string, updatedData: Partial<EditorialUser>) => void;
  onDeleteUser: (userId: string) => void;
  // Photo Library Props
  photoLibrary: PhotoLibraryItem[];
  onAddPhoto: (photo: PhotoLibraryItem) => void;
  onUpdatePhoto: (id: string, updated: Partial<PhotoLibraryItem>) => void;
  onDeletePhoto: (id: string) => void;
  // Social Media Accounts Props
  socialAccounts?: SocialMediaAccounts;
  onUpdateSocialAccounts?: (accounts: SocialMediaAccounts) => void;
  initialTab?: 'queue' | 'compose' | 'categories' | 'users' | 'profile' | 'photos' | 'stats' | 'social_accounts';
}

export const EditorialDashboardModal: React.FC<EditorialDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  articles,
  onUpdateArticleWorkflow,
  onAddNewArticle,
  onUpdateArticle,
  onViewArticlePreview,
  categories,
  onUpdateCategories,
  editorialUsers,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  photoLibrary,
  onAddPhoto,
  onUpdatePhoto,
  onDeletePhoto,
  socialAccounts,
  onUpdateSocialAccounts,
  initialTab = 'queue'
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'compose' | 'categories' | 'users' | 'profile' | 'photos' | 'stats' | 'social_accounts'>(initialTab);

  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedArticleIdForAction, setSelectedArticleIdForAction] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  // Social Media Accounts & Auto-Publish Tab State
  const [socialFacebook, setSocialFacebook] = useState(socialAccounts?.facebook || '');
  const [socialTwitter, setSocialTwitter] = useState(socialAccounts?.twitter || '');
  const [socialWhatsapp, setSocialWhatsapp] = useState(socialAccounts?.whatsapp || '');
  const [socialTelegram, setSocialTelegram] = useState(socialAccounts?.telegram || '');
  const [socialInstagram, setSocialInstagram] = useState(socialAccounts?.instagram || '');
  const [socialYoutube, setSocialYoutube] = useState(socialAccounts?.youtube || '');
  const [autoPublishEnabled, setAutoPublishEnabled] = useState(socialAccounts?.autoPublishEnabled ?? true);
  const [autoFacebook, setAutoFacebook] = useState(socialAccounts?.autoPublishPlatforms?.facebook ?? true);
  const [autoTwitter, setAutoTwitter] = useState(socialAccounts?.autoPublishPlatforms?.twitter ?? true);
  const [autoTelegram, setAutoTelegram] = useState(socialAccounts?.autoPublishPlatforms?.telegram ?? true);
  const [autoWhatsapp, setAutoWhatsapp] = useState(socialAccounts?.autoPublishPlatforms?.whatsapp ?? true);
  const [autoWebhookUrl, setAutoWebhookUrl] = useState(socialAccounts?.autoPublishWebhookUrl || '');
  const [socialSavedSuccess, setSocialSavedSuccess] = useState(false);
  const [testPublishing, setTestPublishing] = useState(false);
  const [testPublishSuccess, setTestPublishSuccess] = useState(false);

  useEffect(() => {
    if (socialAccounts) {
      setSocialFacebook(socialAccounts.facebook || '');
      setSocialTwitter(socialAccounts.twitter || '');
      setSocialWhatsapp(socialAccounts.whatsapp || '');
      setSocialTelegram(socialAccounts.telegram || '');
      setSocialInstagram(socialAccounts.instagram || '');
      setSocialYoutube(socialAccounts.youtube || '');
      setAutoPublishEnabled(socialAccounts.autoPublishEnabled ?? true);
      setAutoFacebook(socialAccounts.autoPublishPlatforms?.facebook ?? true);
      setAutoTwitter(socialAccounts.autoPublishPlatforms?.twitter ?? true);
      setAutoTelegram(socialAccounts.autoPublishPlatforms?.telegram ?? true);
      setAutoWhatsapp(socialAccounts.autoPublishPlatforms?.whatsapp ?? true);
      setAutoWebhookUrl(socialAccounts.autoPublishWebhookUrl || '');
    }
  }, [socialAccounts]);

  // Internal In-Dashboard Article Inspector (Fixes preview obscuring everything)
  const [inspectingArticle, setInspectingArticle] = useState<Article | null>(null);

  // Form state for composing
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('تقارير وتحقيقات');
  const [categoryId, setCategoryId] = useState<string>('investigations');
  const [excerpt, setExcerpt] = useState('');
  const [contentRaw, setContentRaw] = useState('');
  const [pullQuote, setPullQuote] = useState('');
  const [selectedImage, setSelectedImage] = useState(heroImg);
  const [imageCaption, setImageCaption] = useState('طلاب قسم الصحافة بالجامعة الحديثة MTI أثناء تدريب عملي داخل غرفة الأخبار الرقمية.');
  const [tagsRaw, setTagsRaw] = useState('جامعة, تحقيق, تقرير ميداني');

  // Compose Author Customization State
  const [composeAuthorMode, setComposeAuthorMode] = useState<'current_user' | 'registered' | 'guest'>('current_user');
  const [composeSelectedUserId, setComposeSelectedUserId] = useState<string>(currentUser.id);
  const [composeGuestName, setComposeGuestName] = useState('');
  const [composeGuestRole, setComposeGuestRole] = useState('كاتب ضيف ومساهم');
  const [composeGuestAvatar, setComposeGuestAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80');
  const [composeTargetStatus, setComposeTargetStatus] = useState<'pending_review' | 'pending_section_head'>('pending_review');

  const [composeMediaType, setComposeMediaType] = useState<Article['mediaType']>('article');
  const [composeImageDisplayMode, setComposeImageDisplayMode] = useState<Article['imageDisplayMode']>('cover');
  const [composeVideoUrl, setComposeVideoUrl] = useState('');
  const [composeVideoSourceType, setComposeVideoSourceType] = useState<'upload' | 'youtube' | 'direct_url'>('youtube');
  const [composeVideoDuration, setComposeVideoDuration] = useState('');
  const composeContentRef = useRef<HTMLTextAreaElement | null>(null);

  // Inspecting Article Inline Edit Mode
  const [isEditingInspected, setIsEditingInspected] = useState(false);
  const [inspectedTitle, setInspectedTitle] = useState('');
  const [inspectedSubtitle, setInspectedSubtitle] = useState('');
  const [inspectedCategory, setInspectedCategory] = useState('');
  const [inspectedCategoryId, setInspectedCategoryId] = useState('');
  const [inspectedAuthorName, setInspectedAuthorName] = useState('');
  const [inspectedAuthorRole, setInspectedAuthorRole] = useState('');
  const [inspectedAuthorAvatar, setInspectedAuthorAvatar] = useState('');
  const [inspectedExcerpt, setInspectedExcerpt] = useState('');
  const [inspectedContent, setInspectedContent] = useState('');
  const [inspectedPullQuote, setInspectedPullQuote] = useState('');
  const [inspectedImage, setInspectedImage] = useState('');
  const [inspectedImageCaption, setInspectedImageCaption] = useState('');
  const [inspectedMediaType, setInspectedMediaType] = useState<Article['mediaType']>('article');
  const [inspectedImageDisplayMode, setInspectedImageDisplayMode] = useState<Article['imageDisplayMode']>('cover');
  const [inspectedVideoUrl, setInspectedVideoUrl] = useState('');
  const [inspectedVideoSourceType, setInspectedVideoSourceType] = useState<'upload' | 'youtube' | 'direct_url'>('youtube');
  const [inspectedVideoDuration, setInspectedVideoDuration] = useState('');
  const [inspectorSuccessMsg, setInspectorSuccessMsg] = useState('');
  const inspectedContentRef = useRef<HTMLTextAreaElement | null>(null);

  // Photo Selector Modal Sub-states
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [photoPickerTarget, setPhotoPickerTarget] = useState<'article' | 'profile' | 'new_user' | 'edit_user' | 'compose_author' | 'inspected_author' | 'inspected_article'>('article');
  const [photoPickerGroup, setPhotoPickerGroup] = useState<PhotoCategoryGroup>('all');
  const [photoPickerOrientation, setPhotoPickerOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [dashboardPhotoFilter, setDashboardPhotoFilter] = useState<PhotoCategoryGroup>('all');

  // Categories editing state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingCatDesc, setEditingCatDesc] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // User management state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123');
  const [newUserRole, setNewUserRole] = useState<EditorialRole>('student_editor');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDept, setNewUserDept] = useState('قسم الصحافة الرقمية - كلية الإعلام MTI');
  const [newUserBio, setNewUserBio] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80');
  const [newUserCanPublish, setNewUserCanPublish] = useState(false);
  const [newUserCanManageCategories, setNewUserCanManageCategories] = useState(false);
  const [newUserCanManageUsers, setNewUserCanManageUsers] = useState(false);

  // Edit user state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('123');
  const [editUserRole, setEditUserRole] = useState<EditorialRole>('student_editor');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserDept, setEditUserDept] = useState('');
  const [editUserBio, setEditUserBio] = useState('');
  const [editUserAvatar, setEditUserAvatar] = useState('');
  const [editUserCanPublish, setEditUserCanPublish] = useState(false);
  const [editUserCanManageCategories, setEditUserCanManageCategories] = useState(false);
  const [editUserCanManageUsers, setEditUserCanManageUsers] = useState(false);
  const [userFeedbackMsg, setUserFeedbackMsg] = useState('');
  const [editUserPhotoSuccess, setEditUserPhotoSuccess] = useState('');
  const [newUserPhotoSuccess, setNewUserPhotoSuccess] = useState('');
  const [myProfilePhotoSuccess, setMyProfilePhotoSuccess] = useState('');
  const editUserFileInputRef = useRef<HTMLInputElement>(null);
  const newUserFileInputRef = useRef<HTMLInputElement>(null);
  const myProfileFileInputRef = useRef<HTMLInputElement>(null);
  const usersTabRef = useRef<HTMLDivElement>(null);

  // Profile update state for current user (Allows Admin to replace "م. أحمد خالد" with their own real name & password)
  const [myName, setMyName] = useState(currentUser.name || '');
  const [myUsername, setMyUsername] = useState(currentUser.username || '');
  const [myPassword, setMyPassword] = useState(currentUser.password || '123');
  const [myBio, setMyBio] = useState(currentUser.bio || '');
  const [myEmail, setMyEmail] = useState(currentUser.email || '');
  const [myAvatar, setMyAvatar] = useState(currentUser.avatar || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Sync state if currentUser changes
  useEffect(() => {
    setMyName(currentUser.name || '');
    setMyUsername(currentUser.username || '');
    setMyPassword(currentUser.password || '123');
    setMyBio(currentUser.bio || '');
    setMyEmail(currentUser.email || '');
    setMyAvatar(currentUser.avatar || '');
  }, [currentUser]);

  if (!isOpen) return null;

  const canManageCategories = currentUser.role === 'admin' || currentUser.canManageCategories;
  const canManageUsers = currentUser.role === 'admin' || currentUser.canManageUsers;

  const filteredArticles = articles.filter((art) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending_review') {
      return art.status === 'pending_review' || art.status === 'Pending Review';
    }
    return art.status === filterStatus;
  });

  const getStatusBadge = (status: ArticleWorkflowStatus) => {
    switch (status) {
      case 'published':
        return {
          label: 'منشور بالصحيفة',
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
        };
      case 'pending_review':
      case 'Pending Review':
        return {
          label: 'قيد المراجعة (Pending Review)',
          color: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-400 dark:border-amber-700'
        };
      case 'pending_section_head':
        return {
          label: 'المرحلة 1: مراجعة رئيس القسم',
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800'
        };
      case 'pending_proofreading':
        return {
          label: 'المرحلة 2: التدقيق اللغوي',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800'
        };
      case 'pending_managing_editor':
        return {
          label: 'المرحلة 3: إجازة مدير التحرير',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800'
        };
      case 'returned_for_revision':
        return {
          label: 'معاد للمحرر للتعديل',
          color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800'
        };
      default:
        return {
          label: 'مسودة',
          color: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-300'
        };
    }
  };

  // Workflow Handlers
  const handleMoveToPendingReview = (article: Article) => {
    const log: WorkflowLog = {
      id: `log-${Date.now()}`,
      stageName: 'قيد المراجعة (Pending Review)',
      actorName: currentUser.name,
      actorRole: currentUser.roleTitleAr,
      action: 'review',
      timestamp: 'الآن',
      notes: actionNotes.trim() || 'تم وضع المقال في حالة قيد المراجعة (Pending Review) لإجراء الفحص والتدقيق الأولي قبل إرساله للأدمن للموافقة النهائية.'
    };
    onUpdateArticleWorkflow(article.id, 'pending_review', log);
    setActionNotes('');
    setSelectedArticleIdForAction(null);
    if (inspectingArticle && inspectingArticle.id === article.id) {
      setInspectingArticle({
        ...inspectingArticle,
        status: 'pending_review',
        workflowLogs: [...(inspectingArticle.workflowLogs || []), log]
      });
    }
  };

  const handleSendToAdminForApproval = (article: Article) => {
    const log: WorkflowLog = {
      id: `log-${Date.now()}`,
      stageName: 'إرسال للأدمن للموافقة النهائية',
      actorName: currentUser.name,
      actorRole: currentUser.roleTitleAr,
      action: 'submit',
      timestamp: 'الآن',
      notes: actionNotes.trim() || 'تم الانتهاء من المراجعة والتدقيق الأولي للمقال وإحالته للأدمن وهيئة التحرير العليا للموافقة النهائية والنشر.'
    };
    onUpdateArticleWorkflow(article.id, 'pending_managing_editor', log);
    setActionNotes('');
    setSelectedArticleIdForAction(null);
    if (inspectingArticle && inspectingArticle.id === article.id) {
      setInspectingArticle({
        ...inspectingArticle,
        status: 'pending_managing_editor',
        workflowLogs: [...(inspectingArticle.workflowLogs || []), log]
      });
    }
  };

  const handleSectionHeadApprove = (article: Article) => {
    const log: WorkflowLog = {
      id: `log-${Date.now()}`,
      stageName: 'المرحلة 1: رئيس القسم',
      actorName: currentUser.name,
      actorRole: currentUser.roleTitleAr,
      action: 'approve',
      timestamp: 'الآن',
      notes: actionNotes.trim() || 'تم فحص التحقيق واعتماد الفكرة والزاوية الصحفية، وإحالته للتصحيح اللغوي.'
    };
    onUpdateArticleWorkflow(article.id, 'pending_proofreading', log);
    setActionNotes('');
    setSelectedArticleIdForAction(null);
    setInspectingArticle(null);
  };

  const handleProofreaderApprove = (article: Article) => {
    const log: WorkflowLog = {
      id: `log-${Date.now()}`,
      stageName: 'المرحلة 2: المصحح اللغوي',
      actorName: currentUser.name,
      actorRole: currentUser.roleTitleAr,
      action: 'approve',
      timestamp: 'الآن',
      notes: actionNotes.trim() || 'تمت مراجعة السلامة النحوية والأسلوبية وخلو النص من علامات التشكيل غير الضرورية.'
    };
    onUpdateArticleWorkflow(article.id, 'pending_managing_editor', log);
    setActionNotes('');
    setSelectedArticleIdForAction(null);
    setInspectingArticle(null);
  };

  const handlePublishFinal = (article: Article) => {
    if (!currentUser.canPublish) {
      alert('عذرا، صلاحية النشر النهائي بالصحيفة محصورة في مدير التحرير ورئيس التحرير والمدير العام فقط.');
      return;
    }
    const log: WorkflowLog = {
      id: `log-${Date.now()}`,
      stageName: 'المرحلة 3: إجازة النشر النهائي',
      actorName: currentUser.name,
      actorRole: currentUser.roleTitleAr,
      action: 'publish',
      timestamp: 'الآن',
      notes: actionNotes.trim() || 'تمت إجازة النشر النهائي للمقال وتثبيته في صدارة الصحيفة الرقمية.'
    };
    onUpdateArticleWorkflow(article.id, 'published', log);
    setActionNotes('');
    setSelectedArticleIdForAction(null);
    setInspectingArticle(null);
  };

  const handleReturnForRevision = (article: Article) => {
    if (!actionNotes.trim()) {
      alert('يرجى كتابة ملاحظات التوجيه للمحرر لمعرفة ما يجب تعديله.');
      return;
    }
    const log: WorkflowLog = {
      id: `log-${Date.now()}`,
      stageName: `إعادة للتعديل (${currentUser.roleTitleAr})`,
      actorName: currentUser.name,
      actorRole: currentUser.roleTitleAr,
      action: 'revise',
      timestamp: 'الآن',
      notes: actionNotes.trim()
    };
    onUpdateArticleWorkflow(article.id, 'returned_for_revision', log);
    setActionNotes('');
    setSelectedArticleIdForAction(null);
    setInspectingArticle(null);
  };

  // Start inspecting article and prep inline edit states
  const handleStartInspectArticle = (article: Article) => {
    setInspectingArticle(article);
    setIsEditingInspected(false);
    setInspectorSuccessMsg('');
    setInspectedTitle(article.title);
    setInspectedSubtitle(article.subtitle || '');
    setInspectedCategory(article.category);
    setInspectedCategoryId(article.categoryId);
    setInspectedAuthorName(article.author?.name || '');
    setInspectedAuthorRole(article.author?.role || '');
    setInspectedAuthorAvatar(article.author?.avatar || '');
    setInspectedExcerpt(article.excerpt || '');
    setInspectedContent(article.content ? articleContentToHtml(article.content) : '');
    setInspectedPullQuote(article.pullQuote || '');
    setInspectedImage(article.image || '');
    setInspectedImageCaption(article.imageCaption || '');
    setInspectedMediaType(article.mediaType || 'article');
    setInspectedImageDisplayMode(article.imageDisplayMode || 'cover');
    setInspectedVideoUrl(article.videoUrl || '');
    setInspectedVideoSourceType(article.videoSourceType || 'youtube');
    setInspectedVideoDuration(article.videoDuration || '');
  };

  // Save changes made in Inspector (including Author, Title, Excerpt, Content)
  const handleSaveInspectedArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingArticle) return;

    const paragraphs = htmlToArticleParagraphs(inspectedContent);

    const updatedFields: Partial<Article> = {
      title: inspectedTitle.trim(),
      subtitle: inspectedSubtitle.trim() || undefined,
      category: inspectedCategory,
      categoryId: inspectedCategoryId as any,
      author: {
        name: inspectedAuthorName.trim() || inspectingArticle.author.name,
        role: inspectedAuthorRole.trim() || inspectingArticle.author.role,
        avatar: inspectedAuthorAvatar.trim() || inspectingArticle.author.avatar,
        studentId: inspectingArticle.author.studentId
      },
      excerpt: inspectedExcerpt.trim(),
      content: paragraphs.length > 0 ? paragraphs : [inspectedContent.trim()],
      pullQuote: inspectedPullQuote.trim() || undefined,
      image: inspectedImage,
      imageCaption: inspectedImageCaption.trim() || undefined,
      mediaType: inspectedMediaType,
      imageDisplayMode: inspectedImageDisplayMode,
      videoUrl: inspectedMediaType === 'video' ? inspectedVideoUrl.trim() || undefined : undefined,
      videoSourceType: inspectedMediaType === 'video' ? inspectedVideoSourceType : undefined,
      videoDuration: inspectedMediaType === 'video' ? inspectedVideoDuration.trim() || undefined : undefined
    };

    if (onUpdateArticle) {
      onUpdateArticle(inspectingArticle.id, updatedFields);
    }

    setInspectingArticle({
      ...inspectingArticle,
      ...updatedFields
    });

    setInspectorSuccessMsg('تم حفظ وتحديث بيانات المقال والكاتب بنجاح!');
    setTimeout(() => {
      setInspectorSuccessMsg('');
      setIsEditingInspected(false);
    }, 1800);
  };

  // Create Article
  const handleCreateArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !contentRaw.trim()) {
      alert('يرجى إكمال الحقول الإلزامية.');
      return;
    }

    const paragraphs = htmlToArticleParagraphs(contentRaw);

    const tags = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Resolve Author based on composeAuthorMode
    let finalAuthorName = currentUser.name;
    let finalAuthorRole = currentUser.roleTitleAr;
    let finalAuthorAvatar = currentUser.avatar;
    let finalStudentId: string | undefined = currentUser.role === 'student_editor' ? 'ST-20220412' : undefined;

    if (composeAuthorMode === 'registered') {
      const selectedUser = editorialUsers.find((u) => u.id === composeSelectedUserId);
      if (selectedUser) {
        finalAuthorName = selectedUser.name;
        finalAuthorRole = selectedUser.roleTitleAr;
        finalAuthorAvatar = selectedUser.avatar;
        finalStudentId = selectedUser.role === 'student_editor' ? 'ST-20220412' : undefined;
      }
    } else if (composeAuthorMode === 'guest') {
      finalAuthorName = composeGuestName.trim() || 'كاتب ضيف';
      finalAuthorRole = composeGuestRole.trim() || 'كاتب ومساهم صحفي';
      finalAuthorAvatar = composeGuestAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80';
      finalStudentId = undefined;
    }

    const newArticle: Article = {
      id: `art-wf-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      excerpt: excerpt.trim(),
      content: paragraphs.length > 0 ? paragraphs : [contentRaw.trim()],
      pullQuote: pullQuote.trim() || undefined,
      category,
      categoryId,
      author: {
        name: finalAuthorName,
        role: finalAuthorRole,
        studentId: finalStudentId,
        avatar: finalAuthorAvatar
      },
      publishedAt: composeTargetStatus === 'pending_review' ? 'قيد المراجعة (Pending Review)' : 'مرحلة الاعتماد',
      readTimeMinutes: Math.max(2, Math.round(contentRaw.length / 500)),
      image: selectedImage,
      imageCaption: imageCaption.trim() || 'صورة صحفية معتمدة بصحيفة MUDigital.',
      mediaType: composeMediaType,
      imageDisplayMode: composeImageDisplayMode,
      videoUrl: composeMediaType === 'video' ? composeVideoUrl.trim() || undefined : undefined,
      videoSourceType: composeMediaType === 'video' ? composeVideoSourceType : undefined,
      videoDuration: composeMediaType === 'video' ? composeVideoDuration.trim() || undefined : undefined,
      views: 0,
      likes: 0,
      tags: tags.length > 0 ? tags : ['تحقيق', 'جامعة'],
      status: composeTargetStatus,
      workflowLogs: [
        {
          id: `log-${Date.now()}`,
          stageName: composeTargetStatus === 'pending_review' ? 'قيد المراجعة (Pending Review)' : 'مرحلة المحرر',
          actorName: currentUser.name,
          actorRole: currentUser.roleTitleAr,
          action: composeTargetStatus === 'pending_review' ? 'review' : 'submit',
          timestamp: 'الآن',
          notes: composeTargetStatus === 'pending_review'
            ? 'تم حفظ المقال في حالة قيد المراجعة (Pending Review) لإجراء التدقيق والفحص قبل إرساله للأدمن للموافقة النهائية.'
            : 'تم تقديم مسودة التقرير، وهي الآن بانتظار فحص واعتماد رئيس القسم (المرحلة 1).'
        }
      ],
      comments: []
    };

    onAddNewArticle(newArticle);
    setActiveTab('queue');
    setFilterStatus(composeTargetStatus);

    setTitle('');
    setSubtitle('');
    setExcerpt('');
    setContentRaw('');
    setPullQuote('');
    setComposeGuestName('');
    setComposeVideoUrl('');
    setComposeVideoDuration('');
    setComposeVideoSourceType('youtube');
  };

  // Direct Avatar Upload from Local Device to Photo Library and User Profile
  const handleDirectAvatarUpload = async (
    file: File,
    editorName: string,
    onSuccessUrl: (url: string) => void,
    setSuccessMsg: (msg: string) => void
  ) => {
    try {
      const result = await optimizeAndResizeImage(file, 400, 400, {
        fitMode: 'crop_cover',
        quality: 0.82
      });

      const newPhoto: PhotoLibraryItem = {
        id: `photo-user-${Date.now()}`,
        title: `صورة المحرر: ${editorName.trim() || 'عضو هيئة التحرير'}`,
        url: result.dataUrl,
        caption: `صورة شخصية معتمدة للمحرر ${editorName.trim() || 'الصحفي'} (400 × 400 مربعة)`,
        photographer: 'قسم الصور - MUDigital',
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
      onSuccessUrl(result.dataUrl);
      setSuccessMsg('تم رفع الصورة بنجاح وحفظها في مكتبة الصور وتعيينها للمحرر!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء معالجة أبعاد الصورة');
    }
  };

  // Add User Handler
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsername.trim()) return;

    const roleTitles: Record<EditorialRole, string> = {
      admin: 'مشرف نظام (Admin) - إدارة التبويب والمحررين',
      student_editor: 'محرر طالب (كاتب مسودات)',
      section_head: 'رئيس قسم (المرحلة 1)',
      proofreader: 'مصحح لغوي (المرحلة 2)',
      managing_editor: 'مدير تحرير (المرحلة 3 - صلاحية النشر)',
      editor_in_chief: 'رئيس تحرير (صلاحية النشر والإدارة)'
    };

    const newUser: EditorialUser = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      username: newUserUsername.trim().toLowerCase(),
      password: newUserPassword.trim() || '123',
      role: newUserRole,
      roleTitleAr: roleTitles[newUserRole],
      avatar: newUserAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
      email: newUserEmail.trim() || `${newUserUsername.trim().toLowerCase()}@mti.edu.eg`,
      department: newUserDept.trim() || 'قسم الصحافة الرقمية - كلية الإعلام MTI',
      bio: newUserBio.trim() || 'محرر وعضو هيئة التحرير بصحيفة MUDigital الرقمية.',
      joinedDate: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
      canPublish: newUserRole === 'managing_editor' || newUserRole === 'editor_in_chief' || newUserRole === 'admin' || newUserCanPublish,
      canManageCategories: newUserRole === 'admin' || newUserCanManageCategories,
      canManageUsers: newUserRole === 'admin' || newUserCanManageUsers
    };

    onAddUser(newUser);
    setIsAddingUser(false);
    setNewUserName('');
    setNewUserUsername('');
    setNewUserPassword('123');
    setNewUserEmail('');
    setNewUserBio('');
    setNewUserPhotoSuccess('');
    setUserFeedbackMsg(`تم إنشاء حساب المحرر الجديد: "${newUser.name}" بنجاح!`);
    setTimeout(() => setUserFeedbackMsg(''), 6000);
    usersTabRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save Categories
  const handleSaveCategoryEdit = (id: string) => {
    if (!editingCatName.trim()) return;
    const updated = categories.map((cat) =>
      cat.id === id ? { ...cat, name: editingCatName.trim(), description: editingCatDesc.trim() } : cat
    );
    onUpdateCategories(updated);
    setEditingCatId(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      alert('يجب الإبقاء على قسم واحد على الأقل في الصحيفة.');
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذا الباب الصحفي؟')) {
      onUpdateCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCatName.trim();
    if (!trimmedName) return;

    if (categories.some((c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
      alert('هذا القسم موجود بالفعل في شريط الأقسام الصحفية.');
      return;
    }

    const slug = `cat-${Date.now()}`;
    const newCat: Category = {
      id: slug,
      slug,
      name: trimmedName,
      description: newCatDesc.trim() || 'قسم صحفي معتمد'
    };
    onUpdateCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatDesc('');
  };

  // My Profile Save (Allows Admin to replace "م. أحمد خالد" with their own real identity)
  const handleSaveMyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedName = myName.trim() || currentUser.name;
    const updatedUsername = myUsername.trim().toLowerCase() || currentUser.username;
    const updatedPassword = myPassword.trim() || currentUser.password;
    const updatedEmail = myEmail.trim() || currentUser.email;
    const updatedBio = myBio.trim() || currentUser.bio;
    const updatedAvatar = myAvatar.trim() || currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80';

    onUpdateUser(currentUser.id, {
      name: updatedName,
      username: updatedUsername,
      password: updatedPassword,
      email: updatedEmail,
      bio: updatedBio,
      avatar: updatedAvatar
    });

    setProfileSuccessMsg('تم حفظ وتحديث بيانات حسابك وصورتك الشخصية كمدير عام بنجاح في كامل الصحيفة!');
    setTimeout(() => setProfileSuccessMsg(''), 5500);
  };

  // User Edit Handlers
  const handleStartEditUser = (user: EditorialUser) => {
    setEditingUserId(user.id);
    setIsAddingUser(false);
    setEditUserName(user.name);
    setEditUserUsername(user.username);
    setEditUserPassword(user.password || '123');
    setEditUserRole(user.role);
    setEditUserEmail(user.email || '');
    setEditUserDept(user.department || 'قسم الصحافة الرقمية - كلية الإعلام MTI');
    setEditUserBio(user.bio || '');
    setEditUserAvatar(user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80');
    setEditUserCanPublish(Boolean(user.canPublish));
    setEditUserCanManageCategories(Boolean(user.canManageCategories));
    setEditUserCanManageUsers(Boolean(user.canManageUsers));
    setEditUserPhotoSuccess('');
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !editUserName.trim() || !editUserUsername.trim()) return;

    const roleTitles: Record<EditorialRole, string> = {
      admin: 'مشرف نظام (Admin) - إدارة التبويب والمحررين',
      student_editor: 'محرر طالب (كاتب مسودات)',
      section_head: 'رئيس قسم (المرحلة 1)',
      proofreader: 'مصحح لغوي (المرحلة 2)',
      managing_editor: 'مدير تحرير (المرحلة 3 - صلاحية النشر)',
      editor_in_chief: 'رئيس تحرير (صلاحية النشر والإدارة)'
    };

    const finalAvatar = editUserAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80';

    const updatedData: Partial<EditorialUser> = {
      name: editUserName.trim(),
      username: editUserUsername.trim().toLowerCase(),
      password: editUserPassword.trim() || '123',
      role: editUserRole,
      roleTitleAr: roleTitles[editUserRole] || 'محرر صحفي',
      email: editUserEmail.trim(),
      department: editUserDept.trim() || 'قسم الصحافة الرقمية - كلية الإعلام MTI',
      bio: editUserBio.trim(),
      avatar: finalAvatar,
      canPublish: editUserRole === 'managing_editor' || editUserRole === 'editor_in_chief' || editUserRole === 'admin' || editUserCanPublish,
      canManageCategories: editUserRole === 'admin' || editUserCanManageCategories,
      canManageUsers: editUserRole === 'admin' || editUserCanManageUsers
    };

    onUpdateUser(editingUserId, updatedData);
    setEditingUserId(null);
    setEditUserPhotoSuccess('');
    setUserFeedbackMsg(`تم حفظ وتحديث بيانات وصورة وصلاحيات المحرر: "${updatedData.name}" بنجاح!`);
    setTimeout(() => setUserFeedbackMsg(''), 6500);
    usersTabRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Photo Picker Selection callback
  const handlePhotoPicked = (result: PhotoSelectionResult) => {
    const isInfographic =
      result.isInfographic === true ||
      result.preset === 'infographic_vertical' ||
      result.preset === 'infographic_horizontal' ||
      result.preset === 'original_no_crop' ||
      result.preset === 'story_vertical' ||
      result.fitMode === 'no_crop_scale' ||
      (result.height && result.width && result.height > result.width * 1.15);

    if (photoPickerTarget === 'article') {
      setSelectedImage(result.url);
      if (result.caption) {
        setImageCaption(result.caption);
      }
      if (isInfographic) {
        setComposeMediaType('infographic');
        setComposeImageDisplayMode('infographic_vertical');
      } else if (result.preset === 'standard_photo' || result.preset === 'topic_landscape') {
        if (composeMediaType === 'infographic') {
          setComposeMediaType('article');
          setComposeImageDisplayMode('cover');
        }
      }
    } else if (photoPickerTarget === 'profile') {
      setMyAvatar(result.url);
      setMyProfilePhotoSuccess('تم اختيار الصورة الشخصية بنجاح!');
      setTimeout(() => setMyProfilePhotoSuccess(''), 4000);
    } else if (photoPickerTarget === 'new_user') {
      setNewUserAvatar(result.url);
      setNewUserPhotoSuccess('تم اختيار صورة المحرر بنجاح!');
      setTimeout(() => setNewUserPhotoSuccess(''), 4000);
    } else if (photoPickerTarget === 'edit_user') {
      setEditUserAvatar(result.url);
      setEditUserPhotoSuccess('تم اختيار صورة المحرر بنجاح!');
      setTimeout(() => setEditUserPhotoSuccess(''), 4000);
    } else if (photoPickerTarget === 'compose_author') {
      setComposeGuestAvatar(result.url);
    } else if (photoPickerTarget === 'inspected_author') {
      setInspectedAuthorAvatar(result.url);
    } else if (photoPickerTarget === 'inspected_article') {
      setInspectedImage(result.url);
      if (result.caption) {
        setInspectedImageCaption(result.caption);
      }
      if (isInfographic) {
        setInspectedMediaType('infographic');
        setInspectedImageDisplayMode('infographic_vertical');
      } else if (result.preset === 'standard_photo' || result.preset === 'topic_landscape') {
        if (inspectedMediaType === 'infographic') {
          setInspectedMediaType('article');
          setInspectedImageDisplayMode('cover');
        }
      }
    }
    setIsPhotoPickerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="bg-[#FBF9F5] dark:bg-[#121316] w-full max-w-5xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col max-h-[92vh] my-auto transition-colors font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Top Bar */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-600 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-950 dark:text-white">
                  {currentUser.name}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                  {currentUser.roleTitleAr}
                </span>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setInspectingArticle(null);
                    }}
                    className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>(تعديل اسمك وبياناتك)</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {currentUser.canPublish ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>صلاحية النشر النهائي بالصحيفة مفعلة</span>
                  </span>
                ) : (
                  <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>محرر/مدقق: يلزم المرور بـ 3 مراحل حتى اعتماد مدير التحرير للنشر</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="تسجيل الخروج والتبديل لحساب آخر"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تبديل الحساب</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="إغلاق لوحة التحكم"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Editorial Workflow Progress Ribbon */}
        <div className="bg-stone-200/50 dark:bg-stone-950/40 px-6 py-2.5 border-b border-stone-200 dark:border-stone-800 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-stone-700 dark:text-stone-300">
              دورة التدقيق الصحفي الإلزامية:
            </span>
            <div className="flex items-center gap-2 sm:gap-4 text-[11px]">
              <span className="flex items-center gap-1 font-medium text-amber-800 dark:text-amber-300">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>رئيس القسم</span>
              </span>
              <span className="text-stone-400">←</span>
              <span className="flex items-center gap-1 font-medium text-blue-800 dark:text-blue-300">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>المصحح اللغوي</span>
              </span>
              <span className="text-stone-400">←</span>
              <span className="flex items-center gap-1 font-medium text-purple-800 dark:text-purple-300">
                <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>مدير التحرير (إجازة النشر)</span>
              </span>
              <span className="text-stone-400">←</span>
              <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>النشر بالصحيفة</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between px-6 border-b border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/40">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('queue');
                setInspectingArticle(null);
              }}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'queue' && !inspectingArticle
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                  : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              جدول المقالات وسير النشر ({articles.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('compose');
                setInspectingArticle(null);
              }}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'compose'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                  : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>كتابة مقال / مسودة جديدة</span>
            </button>

            {canManageUsers && (
              <button
                onClick={() => {
                  setActiveTab('users');
                  setInspectingArticle(null);
                }}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-500/10'
                    : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-amber-600" />
                <span>إدارة المحررين والصلاحيات ({editorialUsers.length})</span>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">
                  مشرف النظام
                </span>
              </button>
            )}

            {canManageCategories && (
              <button
                onClick={() => {
                  setActiveTab('categories');
                  setInspectingArticle(null);
                }}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-500/10'
                    : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-amber-600" />
                <span>إدارة الأبواب الصحفية</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('photos');
                setInspectingArticle(null);
              }}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'photos'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                  : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span>مكتبة الصور والوسائط ({photoLibrary.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('stats');
                setInspectingArticle(null);
              }}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                  : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              <span>الإحصائيات والأداء</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('social_accounts');
                setInspectingArticle(null);
              }}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'social_accounts'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              <span>صفحات وقنوات MUDigital الرسمية</span>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">
                الروابط
              </span>
              {socialAccounts?.autoPublishEnabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="النشر الآلي مفعل" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
                setInspectingArticle(null);
              }}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                  : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>تعديل بياناتي والاسم ({currentUser.role === 'admin' ? 'بيانات Admin' : 'بروفايلي'})</span>
            </button>
          </div>

          {activeTab === 'queue' && !inspectingArticle && (
            <div className="flex items-center gap-1 py-2 overflow-x-auto">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'pending_review', label: 'قيد المراجعة (Pending Review)' },
                { id: 'pending_section_head', label: 'مرحلة 1: رئيس القسم' },
                { id: 'pending_proofreading', label: 'مرحلة 2: التدقيق اللغوي' },
                { id: 'pending_managing_editor', label: 'مرحلة 3: مدير التحرير' },
                { id: 'published', label: 'المنشور بالصحيفة' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    filterStatus === f.id
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Body Content per Tab */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* IN-DASHBOARD ARTICLE INSPECTOR / PREVIEW */}
          {inspectingArticle ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                <button
                  onClick={() => setInspectingArticle(null)}
                  className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة لقائمة المقالات وسير النشر</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">الحالة الراهنة:</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded border font-semibold ${
                      getStatusBadge(inspectingArticle.status).color
                    }`}
                  >
                    {getStatusBadge(inspectingArticle.status).label}
                  </span>

                  <button
                    onClick={() => {
                      if (!isEditingInspected) {
                        handleStartInspectArticle(inspectingArticle);
                        setIsEditingInspected(true);
                      } else {
                        setIsEditingInspected(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border border-amber-500 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isEditingInspected ? 'عرض مسودة المقال' : '✏️ تعديل بيانات المقال واسم الكاتب'}</span>
                  </button>
                </div>
              </div>

              {/* Inspector Success Alert */}
              {inspectorSuccessMsg && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl border border-emerald-300 dark:border-emerald-800 font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{inspectorSuccessMsg}</span>
                </div>
              )}

              {/* Review & Action Bar directly inside the inspector */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>إجراءات التدقيق والاعتماد التحريري المباشر:</span>
                </div>

                <textarea
                  rows={2}
                  placeholder="اكتب ملاحظات التدقيق أو التوجيه للمحرر..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />

                {(inspectingArticle.status === 'pending_review' || inspectingArticle.status === 'Pending Review') && (
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>حالة المقال: قيد المراجعة والتدقيق الأولي (Pending Review).</strong> يمكنك تصحيح وتعديل المقال أو اسم الكاتب، ثم إرساله للأدمن للاعتماد النهائي.
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => handleReturnForRevision(inspectingArticle)}
                    className="px-3 py-1.5 text-xs text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded border border-rose-300 dark:border-rose-800 transition-colors cursor-pointer"
                  >
                    إعادة المقال للمحرر للتعديل
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Allow moving to Pending Review if in draft, returned, or pending section head */}
                    {inspectingArticle.status !== 'pending_review' && inspectingArticle.status !== 'Pending Review' && inspectingArticle.status !== 'published' && (
                      <button
                        onClick={() => handleMoveToPendingReview(inspectingArticle)}
                        className="px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 rounded border border-amber-400 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="وضع المقال في حالة Pending Review للمراجعة الأولية قبل إرساله للأدمن"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>وضع في قيد المراجعة (Pending Review)</span>
                      </button>
                    )}

                    {/* If in Pending Review, allow sending to admin for final approval */}
                    {(inspectingArticle.status === 'pending_review' || inspectingArticle.status === 'Pending Review') && (
                      <button
                        onClick={() => handleSendToAdminForApproval(inspectingArticle)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال للأدمن للموافقة النهائية</span>
                      </button>
                    )}

                    {inspectingArticle.status === 'pending_section_head' && (
                      <button
                        onClick={() => handleSectionHeadApprove(inspectingArticle)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors cursor-pointer"
                      >
                        اعتماد وإحالة للتصحيح اللغوي (المرحلة 2)
                      </button>
                    )}

                    {inspectingArticle.status === 'pending_proofreading' && (
                      <button
                        onClick={() => handleProofreaderApprove(inspectingArticle)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer"
                      >
                        إجازة لغويا وإحالة لمدير التحرير (المرحلة 3)
                      </button>
                    )}

                    {currentUser.canPublish && (
                      <button
                        onClick={() => handlePublishFinal(inspectingArticle)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>نشر المقال بالصحيفة الآن (صلاحية النشر الكامل)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Conditional Display: Inline Edit Form vs Reading View */}
              {isEditingInspected ? (
                <form onSubmit={handleSaveInspectedArticle} className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold text-stone-950 dark:text-white flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-amber-600" />
                        <span>تعديل بيانات المقال واسم الكاتب المسند إليه</span>
                      </h3>
                      <p className="text-xs text-stone-500">
                        يمكنك هنا تحديد أو تغيير اسم الكاتب واختيار أي محرر من الهيئة أو كاتب خارجي/ضيف، وتعديل نص المقال وعنوانه.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditingInspected(false)}
                      className="px-3 py-1 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                    >
                      إلغاء التعديل
                    </button>
                  </div>

                  {/* Author Selection and Customization Box */}
                  <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-amber-600" />
                        <span>بيانات كاتب المقال (محرر مسجل أو كاتب ضيف / خارجي):</span>
                      </label>

                      {editorialUsers && editorialUsers.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-stone-500 whitespace-nowrap">اختيار سريع:</span>
                          <select
                            onChange={(e) => {
                              const selected = editorialUsers.find((u) => u.name === e.target.value);
                              if (selected) {
                                setInspectedAuthorName(selected.name);
                                setInspectedAuthorRole(selected.roleTitleAr);
                                setInspectedAuthorAvatar(selected.avatar);
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
                          placeholder="اسم الكاتب (مثال: د. مجدي يعقوب، كاتب ضيف...)"
                          value={inspectedAuthorName}
                          onChange={(e) => setInspectedAuthorName(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          صفة / تخصص الكاتب
                        </label>
                        <input
                          type="text"
                          placeholder="مثال: كاتب رأي، أستاذ جامعي، مراسل صحفي..."
                          value={inspectedAuthorRole}
                          onChange={(e) => setInspectedAuthorRole(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    {/* Author Avatar Preview & Selector */}
                    <div className="pt-2 border-t border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-center gap-3">
                      <img
                        src={inspectedAuthorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80'}
                        alt={inspectedAuthorName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-600 shadow-sm shrink-0 bg-stone-200"
                      />
                      <div className="flex-1 w-full space-y-1">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="رابط صورة الكاتب الشخصية..."
                            value={inspectedAuthorAvatar}
                            onChange={(e) => setInspectedAuthorAvatar(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoPickerTarget('inspected_author');
                              setIsPhotoPickerOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            <Camera className="w-3.5 h-3.5 text-amber-600" />
                            <span>مكتبة الصور (400 × 400)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      عنوان المقال الصحفي *
                    </label>
                    <input
                      type="text"
                      required
                      value={inspectedTitle}
                      onChange={(e) => setInspectedTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold font-headline rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      العنوان الفرعي
                    </label>
                    <input
                      type="text"
                      value={inspectedSubtitle}
                      onChange={(e) => setInspectedSubtitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      القسم الصحفي *
                    </label>
                    <select
                      value={inspectedCategory}
                      onChange={(e) => {
                        setInspectedCategory(e.target.value);
                        const found = categories.find((c) => c.name === e.target.value);
                        if (found) setInspectedCategoryId(found.id);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      المقدمة أو الملخص الصحفي (Excerpt) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={inspectedExcerpt}
                      onChange={(e) => setInspectedExcerpt(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  {/* Body Prose Content */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                        متن المقال والفقرات الكاملة *
                      </label>
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        محرر مرئي حي: تظهر التعديلات فوراً مع فواصل الأسطر
                      </span>
                    </div>

                    <RichTextEditor
                      value={inspectedContent}
                      onChange={setInspectedContent}
                      placeholder="متن المقال الكامل..."
                      minHeight="220px"
                    />
                  </div>

                  {/* Pull Quote */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      الاقتباس البارز (Pull Quote)
                    </label>
                    <input
                      type="text"
                      value={inspectedPullQuote}
                      onChange={(e) => setInspectedPullQuote(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  {/* Image */}
                  <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-amber-600" />
                        <span>الصورة الصحفية للمقال</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPickerTarget('inspected_article');
                          setIsPhotoPickerOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-stone-200 dark:bg-stone-800 rounded hover:bg-stone-300 dark:hover:bg-stone-700 cursor-pointer"
                      >
                        اختيار من مكتبة الصور
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <img src={inspectedImage} alt="Article preview" className="w-24 h-14 object-cover rounded-lg border border-stone-300 dark:border-stone-700" />
                      <input
                        type="url"
                        value={inspectedImage}
                        onChange={(e) => setInspectedImage(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                  </div>

                  {/* Media Type Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                      نوع ونمط المادة الصحفية:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectedMediaType('article')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          inspectedMediaType === 'article'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        مقال صحفي تقليدي
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectedMediaType('infographic')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          inspectedMediaType === 'infographic'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        إنفوجرافيك طولي/عريض
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectedMediaType('video')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          inspectedMediaType === 'video'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>تقرير مصور وفيديو</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectedMediaType('podcast')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          inspectedMediaType === 'podcast'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        بودكاست صوتي
                      </button>
                    </div>
                  </div>

                  {/* Dedicated Video Configuration Panel for Inspected Article */}
                  {inspectedMediaType === 'video' && (
                    <div className="p-4 rounded-xl border-2 border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-rose-200 dark:border-rose-900/50">
                        <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                          <Film className="w-4 h-4" />
                          <span>إعدادات التقرير المصور ورفع الفيديو (Video Journalism)</span>
                        </span>
                        <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-mono">
                          MP4 / WebM / YouTube
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                            رابط الفيديو (YouTube أو رابط MP4 مباشر):
                          </label>
                          <input
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=... أو https://.../video.mp4"
                            value={inspectedVideoUrl}
                            onChange={(e) => {
                              setInspectedVideoUrl(e.target.value);
                              if (e.target.value.includes('youtu')) {
                                setInspectedVideoSourceType('youtube');
                              } else {
                                setInspectedVideoSourceType('direct_url');
                              }
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                            dir="ltr"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                            مدة التقرير المصور (مثال: 04:15):
                          </label>
                          <input
                            type="text"
                            placeholder="04:15"
                            value={inspectedVideoDuration}
                            onChange={(e) => setInspectedVideoDuration(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {/* Direct File Upload Option */}
                      <div className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs text-stone-600 dark:text-stone-300 space-y-0.5 text-right w-full sm:w-auto">
                          <span className="font-bold block text-stone-900 dark:text-stone-100">
                            أو ارفع ملف فيديو محلي من جهازك مباشرة:
                          </span>
                          <span className="text-[11px] text-stone-500 block">
                            يدعم ملفات MP4 و WebM (يتم تجهيزها للمشغل المدمج فوراً مع استخراج المدة الزمنية تلقائياً)
                          </span>
                        </div>

                        <label className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 shadow-xs">
                          <Film className="w-3.5 h-3.5" />
                          <span>اختيار ملف فيديو من الجهاز</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const blobUrl = URL.createObjectURL(file);
                                setInspectedVideoUrl(blobUrl);
                                setInspectedVideoSourceType('upload');
                                const tempVideo = document.createElement('video');
                                tempVideo.src = blobUrl;
                                tempVideo.onloadedmetadata = () => {
                                  const minutes = Math.floor(tempVideo.duration / 60);
                                  const seconds = Math.floor(tempVideo.duration % 60);
                                  setInspectedVideoDuration(
                                    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                                  );
                                };
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Live Video Preview Box */}
                      {inspectedVideoUrl && (
                        <div className="p-3 rounded-xl bg-stone-950 border border-rose-500/30 space-y-2">
                          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-stone-800">
                            <span className="font-bold flex items-center gap-1.5 text-rose-400">
                              <Film className="w-3.5 h-3.5" />
                              <span>معاينة حية للتقرير المصور المعدل:</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setInspectedVideoUrl('');
                                setInspectedVideoDuration('');
                              }}
                              className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                            >
                              ✕ حذف ملف الفيديو
                            </button>
                          </div>
                          <div className="max-w-md mx-auto rounded-lg overflow-hidden border border-stone-800 bg-black">
                            <VideoPlayer
                              src={inspectedVideoUrl}
                              poster={inspectedImage}
                              title={inspectedTitle || 'معاينة التقرير المصور'}
                              duration={inspectedVideoDuration}
                              sourceType={inspectedVideoSourceType}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save button */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingInspected(false)}
                      className="px-4 py-2 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ واعتماد تعديلات المقال والكاتب</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Full Article Content */
                <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                    <span className="font-bold text-stone-800 dark:text-stone-200">{inspectingArticle.category}</span>
                    <span>·</span>
                    <span>الكاتب: {inspectingArticle.author.name}</span>
                    <span>·</span>
                    <span>{inspectingArticle.publishedAt}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold font-headline text-stone-950 dark:text-white leading-tight">
                    {inspectingArticle.title}
                  </h1>

                  {inspectingArticle.subtitle && (
                    <p className="text-base text-stone-600 dark:text-stone-400 mt-2 font-body">
                      {inspectingArticle.subtitle}
                    </p>
                  )}

                  {inspectingArticle.factCheck && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>شارة تدقيق الحقائق:</strong> {inspectingArticle.factCheck.verdictLabelAr} — مدقق بواسطة {inspectingArticle.factCheck.checkedBy} ({inspectingArticle.factCheck.checkedAt})
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded text-[11px] shrink-0">
                        {inspectingArticle.factCheck.transparencyScore}% موثوقية
                      </span>
                    </div>
                  )}
                </div>

                {inspectingArticle.image && (
                  <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-950 flex flex-col">
                    {inspectingArticle.mediaType === 'video' || inspectingArticle.videoUrl ? (
                      <div className="p-2 sm:p-4 bg-black">
                        <VideoPlayer
                          src={inspectingArticle.videoUrl}
                          poster={inspectingArticle.image}
                          title={inspectingArticle.title}
                          duration={inspectingArticle.videoDuration}
                          sourceType={inspectingArticle.videoSourceType}
                        />
                      </div>
                    ) : inspectingArticle.mediaType === 'infographic' || inspectingArticle.imageDisplayMode === 'infographic_vertical' ? (
                      <div className="p-2 sm:p-4 flex flex-col items-center">
                        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-xs">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <BarChart2 className="w-4 h-4 text-emerald-500" />
                            <span>إنفوجرافيك كامل (بدون قص)</span>
                          </span>
                          <span className="text-[10px] text-stone-400">
                            يتم عرضه بكامل تفاصيله الطبيعية
                          </span>
                        </div>
                        <img
                          src={inspectingArticle.image}
                          alt={inspectingArticle.title}
                          className="max-w-full h-auto max-h-[600px] object-contain mx-auto rounded"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <img
                        src={inspectingArticle.image}
                        alt={inspectingArticle.title}
                        className="w-full max-h-80 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {inspectingArticle.imageCaption && (
                      <p className="p-2.5 text-xs text-stone-500 bg-stone-50 dark:bg-stone-850 border-t border-stone-200 dark:border-stone-800">
                        {inspectingArticle.imageCaption}
                      </p>
                    )}
                  </div>
                )}

                {inspectingArticle.pullQuote && (
                  <blockquote className="p-4 rounded-xl border-r-4 border-amber-600 bg-stone-100/70 dark:bg-stone-800/50 text-sm font-semibold italic text-stone-800 dark:text-stone-200">
                    "{inspectingArticle.pullQuote}"
                  </blockquote>
                )}

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-stone-800 dark:text-stone-200 font-body">
                  {inspectingArticle.content.map((p, idx) => (
                    <FormattedArticleContent key={idx} paragraph={p} />
                  ))}
                </div>

                {/* Workflow Logs History */}
                {inspectingArticle.workflowLogs && inspectingArticle.workflowLogs.length > 0 && (
                  <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-amber-600" />
                      <span>سجل دورة الاعتماد والملاحظات التحريرية:</span>
                    </h4>
                    <div className="space-y-2">
                      {inspectingArticle.workflowLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-lg bg-stone-50 dark:bg-stone-850 text-xs border border-stone-200 dark:border-stone-800"
                        >
                          <div className="flex items-center justify-between font-semibold mb-1">
                            <span className="text-amber-800 dark:text-amber-300">
                              {log.stageName} · {log.actorName}
                            </span>
                            <span className="text-[11px] text-stone-400">{log.timestamp}</span>
                          </div>
                          {log.notes && (
                            <p className="text-stone-600 dark:text-stone-300 text-[11px] mt-0.5">
                              {log.notes}
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
          ) : activeTab === 'queue' ? (
            /* TAB 1: ARTICLES QUEUE */
            <div className="space-y-3">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  لا توجد مقالات مطابقة لهذا المرشح حاليا.
                </div>
              ) : (
                filteredArticles.map((article) => {
                  const badge = getStatusBadge(article.status);
                  const isSelectedForAction = selectedArticleIdForAction === article.id;

                  return (
                    <div
                      key={article.id}
                      className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 hover:border-amber-600/50 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                              {article.category}
                            </span>
                            <span className="text-stone-300 dark:text-stone-700">·</span>
                            <span className="text-[11px] text-stone-500">
                              الكاتب: {article.author.name} ({article.author.role})
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold font-headline text-stone-900 dark:text-stone-100">
                            {article.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[11px] px-2.5 py-1 rounded border font-semibold ${badge.color}`}
                          >
                            {badge.label}
                          </span>

                          <button
                            onClick={() => handleStartInspectArticle(article)}
                            className="px-2.5 py-1 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded border border-stone-300 dark:border-stone-700 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة المقال</span>
                          </button>

                          <button
                            onClick={() => onViewArticlePreview(article)}
                            className="px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded border border-amber-300 dark:border-amber-800 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="فتح المقال في القارئ مع إمكانية التصحيح الفوري"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>فتح وتصحيح في القارئ</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Quick Action Box */}
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-stone-500">
                          {article.workflowLogs && article.workflowLogs.length > 0
                            ? `آخر إجراء: ${article.workflowLogs[article.workflowLogs.length - 1].stageName} - ${article.workflowLogs[article.workflowLogs.length - 1].actorName}`
                            : 'بانتظار بدء دورة التدقيق'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setSelectedArticleIdForAction(
                                isSelectedForAction ? null : article.id
                              )
                            }
                            className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-medium cursor-pointer"
                          >
                            {isSelectedForAction ? 'إلغاء إجراء التدقيق' : 'اتخاذ إجراء تدقيق سريع ↓'}
                          </button>
                        </div>
                      </div>

                      {isSelectedForAction && (
                        <div className="mt-3 p-3 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2 animate-fadeIn">
                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                            ملاحظات التوجيه أو الاعتماد:
                          </label>
                          <textarea
                            rows={2}
                            placeholder="اكتب ملاحظاتك للمحرر أو للمرحلة التالية..."
                            value={actionNotes}
                            onChange={(e) => setActionNotes(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900"
                          />

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <button
                              onClick={() => handleReturnForRevision(article)}
                              className="px-3 py-1 text-xs text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded border border-rose-300 dark:border-rose-800 cursor-pointer"
                            >
                              إعادة للمحرر للتعديل
                            </button>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* Move to Pending Review */}
                              {article.status !== 'pending_review' && article.status !== 'Pending Review' && article.status !== 'published' && (
                                <button
                                  onClick={() => handleMoveToPendingReview(article)}
                                  className="px-2.5 py-1 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 rounded border border-amber-400 cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="نقل المقال لحالة المراجعة الأولية للمحررين"
                                >
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>وضع في Pending Review</span>
                                </button>
                              )}

                              {/* Send to Admin if in Pending Review */}
                              {(article.status === 'pending_review' || article.status === 'Pending Review') && (
                                <button
                                  onClick={() => handleSendToAdminForApproval(article)}
                                  className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded cursor-pointer flex items-center gap-1 shadow-sm"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>إرسال للأدمن للموافقة النهائية</span>
                                </button>
                              )}

                              {article.status === 'pending_section_head' && (
                                <button
                                  onClick={() => handleSectionHeadApprove(article)}
                                  className="px-3 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded cursor-pointer"
                                >
                                  اعتماد رئيس القسم (إحالة للتصحيح اللغوي)
                                </button>
                              )}

                              {article.status === 'pending_proofreading' && (
                                <button
                                  onClick={() => handleProofreaderApprove(article)}
                                  className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded cursor-pointer"
                                >
                                  إجازة لغوياً (إحالة لمدير التحرير)
                                </button>
                              )}

                              {currentUser.canPublish && (
                                <button
                                  onClick={() => handlePublishFinal(article)}
                                  className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded cursor-pointer flex items-center gap-1 shadow-sm"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>نشر المقال بالصحيفة الآن</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : activeTab === 'compose' ? (
            /* TAB 2: COMPOSE ARTICLE */
            <form onSubmit={handleCreateArticleSubmit} className="space-y-4 max-w-3xl mx-auto">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                <strong>تنبيه للمحرر:</strong> عند تقديم المقال لن ينشر مباشرة على الموقع، بل سيمر تلقائيا بالمرحلة الأولى (مراجعة رئيس القسم)، ثم التصحيح اللغوي، قبل إجازته من مدير التحرير.
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  عنوان التقرير الصحفي *
                </label>
                <input
                  type="text"
                  required
                  placeholder="عنوان رصين بدون تشكيل..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-headline font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  العنوان الفرعي أو التمهيدي
                </label>
                <input
                  type="text"
                  placeholder="موجز يوضح زاوية التناول الصحفي..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    القسم الصحفي *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      const mapping: Record<string, string> = {
                        'تقارير وتحقيقات': 'investigations',
                        'تحقيقات واستقصاء': 'investigations',
                        'وسائط وملتيميديا': 'multimedia',
                        'نبض الجامعة': 'campus',
                        'تقنية وذكاء اصطناعي': 'technology',
                        'ثقافة ومجتمع': 'culture',
                        'أقلام ورأي': 'opinion',
                        'ريادة واقتصاد': 'economy',
                        'رياضة جامعية': 'sports'
                      };
                      setCategoryId(mapping[e.target.value] || 'investigations');
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    هوية كاتب المقال *
                  </label>
                  <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setComposeAuthorMode('current_user')}
                      className={`flex-1 py-1 px-1.5 rounded-md font-semibold text-[11px] transition-all cursor-pointer truncate ${
                        composeAuthorMode === 'current_user'
                          ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-xs'
                          : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      أنا ({currentUser.name})
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposeAuthorMode('registered')}
                      className={`flex-1 py-1 px-1.5 rounded-md font-semibold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                        composeAuthorMode === 'registered'
                          ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-xs'
                          : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      محرر مسجل
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposeAuthorMode('guest')}
                      className={`flex-1 py-1 px-1.5 rounded-md font-semibold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                        composeAuthorMode === 'guest'
                          ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-xs'
                          : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      كاتب ضيف / خارجي
                    </button>
                  </div>
                </div>
              </div>

              {/* Conditional Author Details in Compose Tab */}
              {composeAuthorMode === 'registered' && (
                <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-2 animate-fadeIn">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    اختر المحرر من هيئة التحرير المسجلين:
                  </label>
                  <select
                    value={composeSelectedUserId}
                    onChange={(e) => setComposeSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium cursor-pointer"
                  >
                    {editorialUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.roleTitleAr} ({u.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {composeAuthorMode === 'guest' && (
                <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-3 animate-fadeIn">
                  <span className="block text-xs font-bold text-amber-900 dark:text-amber-200">
                    بيانات الكاتب الضيف أو المراسل الخارجي (الذي لا يملك حساباً):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        اسم الكاتب *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: د. إبراهيم الفقي، مروة هشام، باحث زائر..."
                        value={composeGuestName}
                        onChange={(e) => setComposeGuestName(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        صفة / تخصص الكاتب
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: كاتب رأي، أستاذ جامعي، مراسل ميداني..."
                        value={composeGuestRole}
                        onChange={(e) => setComposeGuestRole(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={composeGuestAvatar}
                      alt="Guest avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-600 shrink-0"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="url"
                        placeholder="رابط صورة الكاتب الشخصية..."
                        value={composeGuestAvatar}
                        onChange={(e) => setComposeGuestAvatar(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPickerTarget('compose_author');
                          setIsPhotoPickerOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-lg cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-600" />
                        <span>مكتبة الصور</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  المقدمة أو الملخص الصحفي (Excerpt) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="موجز صحفي مركز..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    متن التحقيق الصحفي الكامل *
                  </label>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    محرر مرئي حي: تظهر الكلمة عريضة أو ملونة فوراً مع تباعد الفقرات
                  </span>
                </div>

                <RichTextEditor
                  value={contentRaw}
                  onChange={setContentRaw}
                  placeholder="ابدأ بكتابة نص التحقيق الصحفي الكامل هنا... ظلل أي كلمة أو عنوان جانبي لتطبيق Bold أو اللون أو العنوان فوراً بشكل مرئي بدون أكواد وبفواصل واضحة."
                  minHeight="220px"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  اقتباس بارز من المقال (Pull Quote)
                </label>
                <input
                  type="text"
                  placeholder="اقتباس يبرز فكرة المقال..."
                  value={pullQuote}
                  onChange={(e) => setPullQuote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Media Type Selector */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850/60 space-y-2">
                <label className="block text-xs font-bold text-stone-900 dark:text-stone-100">
                  نوع المادة الصحفية (Media Format):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setComposeMediaType('article')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      composeMediaType === 'article'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    مقال صحفي تقليدي
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposeMediaType('video')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      composeMediaType === 'video'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    تقرير مصور / فيديو
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposeMediaType('infographic')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      composeMediaType === 'infographic'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    إنفوجرافيك كامل
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposeMediaType('podcast')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      composeMediaType === 'podcast'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    بودكاست صوتي
                  </button>
                </div>
              </div>

              {/* Dedicated Video Configuration Panel for Compose */}
              {composeMediaType === 'video' && (
                <div className="p-4 rounded-xl border-2 border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-200 dark:border-rose-900/50">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                      <Film className="w-4 h-4" />
                      <span>إعدادات التقرير المصور ورفع الفيديو (Video Journalism)</span>
                    </span>
                    <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-mono">
                      MP4 / WebM / YouTube
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                        رابط الفيديو (YouTube أو رابط MP4 مباشر):
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=... أو https://.../video.mp4"
                        value={composeVideoUrl}
                        onChange={(e) => {
                          setComposeVideoUrl(e.target.value);
                          if (e.target.value.includes('youtu')) {
                            setComposeVideoSourceType('youtube');
                          } else {
                            setComposeVideoSourceType('direct_url');
                          }
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                        مدة التقرير المصور (مثال: 04:15):
                      </label>
                      <input
                        type="text"
                        placeholder="04:15"
                        value={composeVideoDuration}
                        onChange={(e) => setComposeVideoDuration(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Direct File Upload Option */}
                  <div className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-stone-600 dark:text-stone-300 space-y-0.5 text-right w-full sm:w-auto">
                      <span className="font-bold block text-stone-900 dark:text-stone-100">
                        أو ارفع ملف فيديو محلي من جهازك مباشرة:
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        يدعم ملفات MP4 و WebM (يتم تجهيزها للمشغل المدمج فوراً مع استخراج المدة الزمنية تلقائياً)
                      </span>
                    </div>

                    <label className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 shadow-xs">
                      <Film className="w-3.5 h-3.5" />
                      <span>اختيار ملف فيديو من الجهاز</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const blobUrl = URL.createObjectURL(file);
                            setComposeVideoUrl(blobUrl);
                            setComposeVideoSourceType('upload');
                            // Extract duration
                            const tempVideo = document.createElement('video');
                            tempVideo.src = blobUrl;
                            tempVideo.onloadedmetadata = () => {
                              const minutes = Math.floor(tempVideo.duration / 60);
                              const seconds = Math.floor(tempVideo.duration % 60);
                              setComposeVideoDuration(
                                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                              );
                            };
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Live Video Preview Box */}
                  {composeVideoUrl && (
                    <div className="p-3 rounded-xl bg-stone-950 border border-rose-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-stone-800">
                        <span className="font-bold flex items-center gap-1.5 text-rose-400">
                          <Film className="w-3.5 h-3.5" />
                          <span>معاينة حية للتقرير المصور قبل الحفظ:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setComposeVideoUrl('');
                            setComposeVideoDuration('');
                          }}
                          className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          ✕ حذف ملف الفيديو
                        </button>
                      </div>
                      <div className="max-w-md mx-auto rounded-lg overflow-hidden border border-stone-800 bg-black">
                        <VideoPlayer
                          src={composeVideoUrl}
                          poster={selectedImage}
                          title={title || 'معاينة التقرير المصور'}
                          duration={composeVideoDuration}
                          sourceType={composeVideoSourceType}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ENHANCED IMAGE & CAPTION SECTION WITH PHOTO LIBRARY */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>
                      {composeMediaType === 'video'
                        ? 'صورة غلاف التقرير المصور (Video Poster)'
                        : composeMediaType === 'infographic'
                        ? 'صورة الإنفوجرافيك (طولي / عريض كامل بدون قص)'
                        : 'الصورة الصحفية المصاحبة للموضوع'}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPickerTarget('article');
                      setIsPhotoPickerOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>اختيار أو رفع من مكتبة الصور الصحفية</span>
                  </button>
                </div>

                {/* Approved Dimensions Alert */}
                <div className="p-2.5 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">تنبيه مقاسات القالب للصور الموضوعية:</span> يجب أن تكون صورة المقال بنسبة <strong>16:9</strong> وبمقاس معتمد <strong>1200 × 675 بكسل</strong>. عند رفعك لأي صورة من جهازك، يقوم النظام بضبطها واقتصاصها تلقائياً بدون أي تشويه.
                  </div>
                </div>

                {/* Selected Image Display */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <div className={`relative w-full sm:w-48 ${composeMediaType === 'infographic' ? 'h-48' : 'aspect-video'} rounded-lg overflow-hidden bg-stone-950 shrink-0 flex items-center justify-center p-1`}>
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className={`w-full h-full ${composeMediaType === 'infographic' ? 'object-contain' : 'object-cover'}`}
                    />
                    <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                      {composeMediaType === 'infographic' ? 'إنفوجرافيك كامل (بدون قص)' : '1200 × 675 px'}
                    </span>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        تعليق الصورة الصحفي (Image Caption) *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="اكتب تعليقاً يوضح سياق الصورة ومصدرها الصحفي..."
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 leading-relaxed"
                      />
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        يظهر هذا التعليق أسفل الصورة في بطاقة الخبر وداخل القارئ السريع.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-stone-500">
                  اختر وجهة حفظ التقرير: يمكنك وضعه في <strong>قيد المراجعة (Pending Review)</strong> للتدقيق قبل إرساله للأدمن، أو إرساله مباشرة لدورة التدقيق.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    onClick={() => setComposeTargetStatus('pending_review')}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-950 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 border border-amber-400 rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>حفظ في قيد المراجعة (Pending Review)</span>
                  </button>

                  <button
                    type="submit"
                    onClick={() => setComposeTargetStatus('pending_section_head')}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال مباشر لرئيس القسم / الأدمن</span>
                  </button>
                </div>
              </div>
            </form>
          ) : activeTab === 'photos' ? (
            /* TAB 3: PHOTO LIBRARY FULL EMBEDDED MANAGEMENT */
            <div className="space-y-4 animate-fadeIn">
              {/* Header Box */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold font-headline text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>مكتبة الصور والوسائط الصحفية والإنفوجرافيك</span>
                  </h4>
                  <p className="text-xs text-amber-900 dark:text-amber-300">
                    ارفع صور المقالات، صور البروفايل، أو الإنفوجرافيك الطولي والعريض مع المحافظة على كامل الأبعاد بدون قص.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setPhotoPickerGroup('topic');
                      setPhotoPickerTarget('article');
                      setIsPhotoPickerOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>رفع صورة موضوعية (16:9)</span>
                  </button>

                  <button
                    onClick={() => {
                      setPhotoPickerGroup('profile');
                      setPhotoPickerTarget('profile');
                      setIsPhotoPickerOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>رفع صورة شخصية (1:1)</span>
                  </button>

                  <button
                    onClick={() => {
                      setPhotoPickerGroup('infographic');
                      setPhotoPickerTarget('article');
                      setIsPhotoPickerOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>رفع إنفوجرافيك بدون قص</span>
                  </button>
                </div>
              </div>

              {/* Three Dedicated Sections Guidelines Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                
                {/* 1. Topic Photos Section Card */}
                <div className="p-3.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                        <span>الصور الموضوعية (للمقالات والتحقيقات):</span>
                      </span>
                      <span className="font-mono text-amber-600 text-[10px] bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded font-bold">
                        1200 × 675 px (16:9)
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      المقاس المعتمد لكافة التقارير والأخبار والتحقيقات الصحفية لتجنب قص أطراف الصورة على مختلف الشاشات.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPhotoPickerGroup('topic');
                      setPhotoPickerTarget('article');
                      setIsPhotoPickerOpen(true);
                    }}
                    className="w-full text-center py-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                  >
                    + رفع صورة موضوعية
                  </button>
                </div>

                {/* 2. Profile Photos Section Card */}
                <div className="p-3.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                      <span className="flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-amber-600" />
                        <span>الصور الشخصية (لهيئة التحرير والبروفايل):</span>
                      </span>
                      <span className="font-mono text-amber-600 text-[10px] bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded font-bold">
                        400 × 400 px (1:1)
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      يتم ضبط صور المحررين بنسبة مربعة متناسقة ليتم عرضها بنقاء دائري في بروفايل الكاتب وبطاقات التحرير.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPhotoPickerGroup('profile');
                      setPhotoPickerTarget('profile');
                      setIsPhotoPickerOpen(true);
                    }}
                    className="w-full text-center py-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                  >
                    + رفع صورة شخصية
                  </button>
                </div>

                {/* 3. Infographic & Charts Section Card with Explicit Description */}
                <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-950 dark:text-emerald-100">
                      <span className="flex items-center gap-1">
                        <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>قسم صور الإنفوجرافيك والمخططات:</span>
                      </span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-300 text-[10px] bg-white dark:bg-emerald-900/80 px-1.5 py-0.5 rounded font-bold border border-emerald-300 dark:border-emerald-700">
                        رأسي / عريض (0% قص)
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      هذا القسم مخصص لصور الإنفوجرافيك والرسوم البيانية والصور التي يتم استخدام حجمها الطبيعي أو تصغيرها بدون قص، مع إتاحة خيارات وضع الصورة عريضاً أو رأسياً، وقائمة خيارات بمقاسات مختلفة يختار المحرر من بينها المقاس الذي يريده للصورة دون أي اقتطاع.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPhotoPickerGroup('infographic');
                      setPhotoPickerTarget('article');
                      setIsPhotoPickerOpen(true);
                    }}
                    className="w-full text-center py-1.5 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    + رفع إنفوجرافيك / صورة بدون قص
                  </button>
                </div>

              </div>

              {/* Photo Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <button
                  onClick={() => setDashboardPhotoFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    dashboardPhotoFilter === 'all'
                      ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                      : 'bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  الكل ({photoLibrary.length})
                </button>
                <button
                  onClick={() => setDashboardPhotoFilter('topic')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    dashboardPhotoFilter === 'topic'
                      ? 'bg-amber-700 text-white dark:bg-amber-600'
                      : 'bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>الصور الموضوعية (للمقالات والتحقيقات)</span>
                </button>
                <button
                  onClick={() => setDashboardPhotoFilter('profile')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    dashboardPhotoFilter === 'profile'
                      ? 'bg-amber-700 text-white dark:bg-amber-600'
                      : 'bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>الصور الشخصية (لهيئة التحرير)</span>
                </button>
                <button
                  onClick={() => setDashboardPhotoFilter('infographic')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    dashboardPhotoFilter === 'infographic'
                      ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>قسم صور الإنفوجرافيك والمخططات (بدون قص)</span>
                </button>
              </div>

              {/* Photo Library Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photoLibrary
                  .filter((photo) => {
                    if (dashboardPhotoFilter === 'topic') {
                      return photo.preset === 'topic_landscape' || photo.preset === 'standard_photo' || photo.preset === 'banner_wide';
                    }
                    if (dashboardPhotoFilter === 'profile') {
                      return photo.preset === 'profile_square';
                    }
                    if (dashboardPhotoFilter === 'infographic') {
                      return (
                        photo.isInfographic === true ||
                        photo.preset === 'infographic_vertical' ||
                        photo.preset === 'infographic_horizontal' ||
                        photo.preset === 'original_no_crop' ||
                        photo.preset === 'story_vertical' ||
                        photo.fitMode === 'no_crop_scale' ||
                        photo.height > photo.width * 1.15
                      );
                    }
                    return true;
                  })
                  .map((photo) => {
                    const isTall =
                      photo.preset === 'infographic_vertical' ||
                      photo.isInfographic ||
                      photo.fitMode === 'no_crop_scale' ||
                      photo.height > photo.width;

                    return (
                      <div
                        key={photo.id}
                        className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow"
                      >
                        <div className={`relative ${isTall ? 'h-64' : 'aspect-video'} bg-stone-950`}>
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className={`w-full h-full ${isTall || photo.fitMode === 'no_crop_scale' ? 'object-contain p-1' : 'object-cover'}`}
                          />
                          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                            {photo.width} × {photo.height} px
                          </span>
                          {isTall && (
                            <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded font-bold shadow-xs">
                              إنفوجرافيك كامل (بدون قص)
                            </span>
                          )}
                        </div>

                        <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                              {photo.title}
                            </h5>
                            <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed mt-0.5">
                              {photo.caption || 'لا يوجد تعليق'}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
                            <span>{photo.photographer || 'تصميم صحفي'}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedImage(photo.url);
                                  if (photo.caption) setImageCaption(photo.caption);
                                  setActiveTab('compose');
                                }}
                                className="text-amber-700 dark:text-amber-400 hover:underline font-bold cursor-pointer"
                              >
                                استخدام للمقال ←
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
                                    onDeletePhoto(photo.id);
                                  }
                                }}
                                className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : activeTab === 'categories' ? (
            /* TAB 4: CATEGORY MANAGEMENT (ADMIN ONLY) */
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                <strong>صلاحية Admin:</strong> يمكنك هنا إعادة تسمية الأبواب الصحفية الحالية، تعديل أوصافها، إضافة أقسام جديدة للصحيفة، أو حذف أي باب. تنعكس التعديلات فورا في كافة صفحات الصحيفة.
              </div>

              <form onSubmit={handleAddNewCategory} className="p-4 rounded-xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-3">
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-amber-600" />
                  <span>إضافة باب صحفي جديد للصحيفة</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      اسم القسم أو الباب الجديد *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: حوارات خاصة، قضايا البيئة..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      وصف الباب الصحفي
                    </label>
                    <input
                      type="text"
                      placeholder="موجز عن نوع التغطيات المنشورة في هذا الباب..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded transition-colors cursor-pointer"
                  >
                    إضافة الباب للصحيفة
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  الأبواب الصحفية الحالية المعتمدة ({categories.length}):
                </h4>
                <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900">
                  {categories.map((cat) => {
                    const isEditing = editingCatId === cat.id;

                    return (
                      <div key={cat.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {isEditing ? (
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={editingCatName}
                              onChange={(e) => setEditingCatName(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border border-amber-600 bg-amber-50/50 dark:bg-stone-800 font-bold"
                            />
                            <input
                              type="text"
                              value={editingCatDesc}
                              onChange={(e) => setEditingCatDesc(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                            />
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-950 dark:text-white">
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                ({cat.slug})
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500">
                              {cat.description}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 shrink-0">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveCategoryEdit(cat.id)}
                                className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded flex items-center gap-1 cursor-pointer"
                              >
                                <Save className="w-3 h-3" />
                                <span>حفظ</span>
                              </button>
                              <button
                                onClick={() => setEditingCatId(null)}
                                className="px-2 py-1 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded cursor-pointer"
                              >
                                إلغاء
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setEditingCatName(cat.name);
                                  setEditingCatDesc(cat.description);
                                }}
                                className="p-1 text-stone-500 hover:text-amber-600 rounded transition-colors cursor-pointer"
                                title="تعديل الاسم أو الوصف"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {cat.id !== 'all' && (
                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                  title="حذف هذا الباب"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : activeTab === 'users' ? (
            /* TAB 5: EDITORIAL USERS & PERMISSIONS MANAGEMENT */
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div>
                    <strong>صلاحية Admin:</strong> إدارة أعضاء هيئة التحرير، إنشاء حسابات جديدة للطلاب وتحديد صلاحيات النشر وتعديل بيانات وصور المحررين.
                  </div>
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <span>💡 لتعديل بيانات أو صورة أي محرر: اضغط على زر <strong>«تعديل بيانات وصورة المحرر»</strong> البارز بجوار اسمه في القائمة أدناه.</span>
                  </div>
                </div>
                {!isAddingUser && (
                  <button
                    onClick={() => setIsAddingUser(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>إضافة محرر جديد</span>
                  </button>
                )}
              </div>

              {/* Add User Form */}
              {isAddingUser && (
                <form onSubmit={handleCreateUser} className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-800 shadow-md space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                    <h4 className="text-sm font-bold font-headline text-stone-950 dark:text-white flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-amber-600" />
                      <span>بيانات المحرر الجديد والصلاحيات الممنوحة</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingUser(false)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        الاسم الكامل للمحرر *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: ياسمين عبد الرحمن"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        اسم المستخدم لتسجيل الدخول (Username) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: yasmin"
                        value={newUserUsername}
                        onChange={(e) => setNewUserUsername(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        كلمة السر *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="كلمة السر..."
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        الدور التحريري *
                      </label>
                      <select
                        value={newUserRole}
                        onChange={(e) => {
                          const r = e.target.value as EditorialRole;
                          setNewUserRole(r);
                          if (r === 'managing_editor' || r === 'editor_in_chief' || r === 'admin') {
                            setNewUserCanPublish(true);
                          }
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      >
                        <option value="student_editor">محرر طالب (كاتب مسودات)</option>
                        <option value="section_head">رئيس قسم (المرحلة 1)</option>
                        <option value="proofreader">مصحح لغوي (المرحلة 2)</option>
                        <option value="managing_editor">مدير تحرير (المرحلة 3 - صلاحية النشر)</option>
                        <option value="editor_in_chief">رئيس تحرير (صلاحية النشر والإدارة)</option>
                        <option value="admin">مشرف نظام (Admin)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        placeholder="yasmin@mti.edu.eg"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        القسم أو الكلية
                      </label>
                      <input
                        type="text"
                        value={newUserDept}
                        onChange={(e) => setNewUserDept(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                  </div>

                  {/* Avatar Picker for New User */}
                  <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        صورة المحرر الشخصية (400 × 400 مربعة):
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={newUserFileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleDirectAvatarUpload(file, newUserName, (url) => setNewUserAvatar(url), setNewUserPhotoSuccess);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => newUserFileInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>رفع من الجهاز</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPickerTarget('new_user');
                            setIsPhotoPickerOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 rounded-lg flex items-center gap-1 cursor-pointer border border-stone-300 dark:border-stone-700"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                          <span>من مكتبة الصور</span>
                        </button>
                      </div>
                    </div>

                    {newUserPhotoSuccess && (
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 font-bold">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{newUserPhotoSuccess}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <img src={newUserAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80'} alt="New user" className="w-12 h-12 rounded-full object-cover border-2 border-amber-600 shrink-0 bg-stone-200" />
                      <input
                        type="url"
                        value={newUserAvatar}
                        onChange={(e) => setNewUserAvatar(e.target.value)}
                        placeholder="أو الصق رابط صورة خارجي..."
                        className="flex-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      النبذة التعريفية (Bio)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="نبذة مختصرة عن اهتماماته الصحفية..."
                      value={newUserBio}
                      onChange={(e) => setNewUserBio(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>

                  {/* Granular Permissions */}
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                    <span className="block text-[11px] font-bold text-stone-800 dark:text-stone-200 mb-2">
                      الصلاحيات الخاصة الممنوحة بواسطة Admin:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800">
                        <input
                          type="checkbox"
                          checked={newUserCanPublish}
                          onChange={(e) => setNewUserCanPublish(e.target.checked)}
                          className="rounded text-amber-600"
                        />
                        <div>
                          <span className="font-bold block text-[11px]">صلاحية النشر المباشر</span>
                          <span className="text-[10px] text-stone-400">إجازة المقالات للنشر النهائي</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800">
                        <input
                          type="checkbox"
                          checked={newUserCanManageCategories}
                          onChange={(e) => setNewUserCanManageCategories(e.target.checked)}
                          className="rounded text-amber-600"
                        />
                        <div>
                          <span className="font-bold block text-[11px]">إدارة الأبواب الصحفية</span>
                          <span className="text-[10px] text-stone-400">تعديل وحذف الأقسام</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800">
                        <input
                          type="checkbox"
                          checked={newUserCanManageUsers}
                          onChange={(e) => setNewUserCanManageUsers(e.target.checked)}
                          className="rounded text-amber-600"
                        />
                        <div>
                          <span className="font-bold block text-[11px]">صلاحية تعديل وإدارة المحررين</span>
                          <span className="text-[10px] text-stone-400">تعديل بيانات وصور وصلاحيات المحررين</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => setIsAddingUser(false)}
                      className="px-4 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
                    >
                      إنشاء حساب المحرر واعتماده
                    </button>
                  </div>
                </form>
              )}

              {/* Feedback Success Message */}
              {userFeedbackMsg && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl border border-emerald-300 dark:border-emerald-800 font-bold flex items-center gap-2 animate-fadeIn shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{userFeedbackMsg}</span>
                </div>
              )}

              {/* Users List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  قائمة هيئة التحرير والمحررين المسجلين ({editorialUsers.length}):
                </h4>
                <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
                  {editorialUsers.map((user) => {
                    const isEditingThisUser = editingUserId === user.id;

                    if (isEditingThisUser) {
                      return (
                        /* INLINE USER EDIT FORM */
                        <form
                          key={user.id}
                          onSubmit={handleSaveUserEdit}
                          className="p-5 bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-600/70 dark:border-amber-600/60 rounded-xl space-y-4 animate-fadeIn"
                        >
                          <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-900/60 pb-3">
                            <h4 className="text-sm font-bold font-headline text-stone-950 dark:text-white flex items-center gap-2">
                              <Edit2 className="w-4 h-4 text-amber-600" />
                              <span>تعديل بيانات وصلاحيات المحرر: {user.name}</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => setEditingUserId(null)}
                              className="text-stone-400 hover:text-stone-600 p-1"
                              title="إلغاء التعديل"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                                الاسم الكامل للمحرر *
                              </label>
                              <input
                                type="text"
                                required
                                value={editUserName}
                                onChange={(e) => setEditUserName(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                                اسم المستخدم لتسجيل الدخول (Username) *
                              </label>
                              <input
                                type="text"
                                required
                                value={editUserUsername}
                                onChange={(e) => setEditUserUsername(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                                كلمة السر *
                              </label>
                              <input
                                type="text"
                                required
                                value={editUserPassword}
                                onChange={(e) => setEditUserPassword(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                                الدور التحريري *
                              </label>
                              <select
                                value={editUserRole}
                                onChange={(e) => {
                                  const r = e.target.value as EditorialRole;
                                  setEditUserRole(r);
                                  if (r === 'managing_editor' || r === 'editor_in_chief' || r === 'admin') {
                                    setEditUserCanPublish(true);
                                  }
                                }}
                                className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                              >
                                <option value="student_editor">محرر طالب (كاتب مسودات)</option>
                                <option value="section_head">رئيس قسم (المرحلة 1)</option>
                                <option value="proofreader">مصحح لغوي (المرحلة 2)</option>
                                <option value="managing_editor">مدير تحرير (المرحلة 3 - صلاحية النشر)</option>
                                <option value="editor_in_chief">رئيس تحرير (صلاحية النشر والإدارة)</option>
                                <option value="admin">مشرف نظام (Admin)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                                البريد الإلكتروني
                              </label>
                              <input
                                type="email"
                                value={editUserEmail}
                                onChange={(e) => setEditUserEmail(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                                القسم أو الكلية
                              </label>
                              <input
                                type="text"
                                value={editUserDept}
                                onChange={(e) => setEditUserDept(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                              />
                            </div>
                          </div>

                          {/* Avatar Picker for User */}
                          <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                صورة المحرر الشخصية (400 × 400 مربعة):
                              </span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  ref={editUserFileInputRef}
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleDirectAvatarUpload(file, editUserName, (url) => setEditUserAvatar(url), setEditUserPhotoSuccess);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => editUserFileInputRef.current?.click()}
                                  className="px-2.5 py-1 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>رفع من الجهاز</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPhotoPickerTarget('edit_user');
                                    setIsPhotoPickerOpen(true);
                                  }}
                                  className="px-2.5 py-1 text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-lg flex items-center gap-1 cursor-pointer border border-stone-300 dark:border-stone-700"
                                >
                                  <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                                  <span>من مكتبة الصور</span>
                                </button>
                              </div>
                            </div>

                            {editUserPhotoSuccess && (
                              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 font-bold">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{editUserPhotoSuccess}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <img src={editUserAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80'} alt="User Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-amber-600 shrink-0 bg-stone-200" />
                              <input
                                type="url"
                                value={editUserAvatar}
                                onChange={(e) => setEditUserAvatar(e.target.value)}
                                placeholder="أو الصق رابط صورة مخصص..."
                                className="flex-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                              النبذة التعريفية (Bio)
                            </label>
                            <textarea
                              rows={2}
                              value={editUserBio}
                              onChange={(e) => setEditUserBio(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                            />
                          </div>

                          {/* Granular Permissions */}
                          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                            <span className="block text-[11px] font-bold text-stone-800 dark:text-stone-200 mb-2">
                              الصلاحيات الخاصة الممنوحة بواسطة Admin:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 cursor-pointer bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800">
                                <input
                                  type="checkbox"
                                  checked={editUserCanPublish}
                                  onChange={(e) => setEditUserCanPublish(e.target.checked)}
                                  className="rounded text-amber-600"
                                />
                                <div>
                                  <span className="font-bold block text-[11px]">صلاحية النشر المباشر</span>
                                  <span className="text-[10px] text-stone-400">إجازة المقالات للنشر النهائي</span>
                                </div>
                              </label>

                              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 cursor-pointer bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800">
                                <input
                                  type="checkbox"
                                  checked={editUserCanManageCategories}
                                  onChange={(e) => setEditUserCanManageCategories(e.target.checked)}
                                  className="rounded text-amber-600"
                                />
                                <div>
                                  <span className="font-bold block text-[11px]">إدارة الأبواب الصحفية</span>
                                  <span className="text-[10px] text-stone-400">تعديل وحذف الأقسام</span>
                                </div>
                              </label>

                              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 cursor-pointer bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800">
                                <input
                                  type="checkbox"
                                  checked={editUserCanManageUsers}
                                  onChange={(e) => setEditUserCanManageUsers(e.target.checked)}
                                  className="rounded text-amber-600"
                                />
                                <div>
                                  <span className="font-bold block text-[11px]">صلاحية تعديل وإدارة المحررين</span>
                                  <span className="text-[10px] text-stone-400">تعديل بيانات وصور وصلاحيات المحررين</span>
                                </div>
                              </label>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                            <button
                              type="button"
                              onClick={() => setEditingUserId(null)}
                              className="px-4 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 rounded cursor-pointer"
                            >
                              إلغاء
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>حفظ واعتماد التعديلات للمحرر</span>
                            </button>
                          </div>
                        </form>
                      );
                    }

                    return (
                      <div key={user.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-stone-300 dark:border-stone-700 shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-stone-950 dark:text-white">
                                {user.name}
                              </span>
                              <span className="text-[10px] font-mono bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-600 dark:text-stone-300">
                                @{user.username}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                                {user.roleTitleAr}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                              {user.email && <span>{user.email}</span>}
                              <span>·</span>
                              <span>{user.department}</span>
                            </div>

                            {/* Permissions indicators */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                              {user.canPublish && (
                                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                                  ✓ صلاحية النشر
                                </span>
                              )}
                              {user.canManageCategories && (
                                <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                                  ✓ إدارة الأبواب
                                </span>
                              )}
                              {user.canManageUsers && (
                                <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded font-medium">
                                  ✓ تعديل وإدارة المحررين
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleStartEditUser(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-100 hover:text-white hover:bg-amber-700 bg-amber-100 dark:bg-amber-950/80 rounded-lg border border-amber-300 dark:border-amber-700 transition-all cursor-pointer shadow-xs"
                            title="تعديل بيانات وصورة وصلاحيات المحرر"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                            <span>تعديل بيانات وصورة المحرر</span>
                          </button>

                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف حساب المحرر: ${user.name}؟`)) {
                                  onDeleteUser(user.id);
                                }
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                              title="حذف المحرر من الهيئة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : activeTab === 'stats' ? (
            /* TAB 6: EDITORIAL ANALYTICS & RECHARTS */
            <EditorialAnalyticsTab
              articles={articles}
              editorialUsers={editorialUsers}
            />
          ) : (
            /* TAB 7: EDIT MY PROFILE (ADMIN OR CURRENT USER) */
            <form onSubmit={handleSaveMyProfile} className="space-y-4 max-w-2xl mx-auto animate-fadeIn">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <strong>تعديل هويتك وبياناتك الشخصية:</strong>
                <p>
                  بصفتك مدير النظام أو عضواً في هيئة التحرير، يمكنك هنا كتابة اسمك الحقيقي، وتعيين اسم المستخدم وكلمة السر وبريدك المهني ونبذتك ليتم اعتمادها في كامل الصحيفة.
                </p>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg border border-emerald-300 dark:border-emerald-800 font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    اسمك الكامل الحقيقي *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="اكتب اسمك الكامل هنا..."
                    value={myName}
                    onChange={(e) => setMyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    اسم المستخدم للدخول (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin أو اسمك بالإنجليزية..."
                    value={myUsername}
                    onChange={(e) => setMyUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    كلمة السر الجديدة الخاصة بك *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ضع كلمة السر الخاصة بك..."
                    value={myPassword}
                    onChange={(e) => setMyPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    البريد الإلكتروني المهني
                  </label>
                  <input
                    type="email"
                    required
                    value={myEmail}
                    onChange={(e) => setMyEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                  />
                </div>
              </div>

              {/* Avatar Chooser & Photo Library Connection */}
              <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>الصورة الشخصية للبروفايل</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={myProfileFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleDirectAvatarUpload(file, myName, (url) => setMyAvatar(url), setMyProfilePhotoSuccess);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => myProfileFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع من الجهاز</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPickerTarget('profile');
                        setIsPhotoPickerOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer border border-stone-300 dark:border-stone-700 shadow-2xs"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                      <span>من مكتبة الصور</span>
                    </button>
                  </div>
                </div>

                {myProfilePhotoSuccess && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 font-bold animate-fadeIn">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{myProfilePhotoSuccess}</span>
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>تنبيه مقاس الصورة الشخصية: <strong>400 × 400 بكسل (1:1 مربعة)</strong> لتحميل فائق السرعة وجودة نقية.</span>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={myAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80'}
                    alt="My avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-600 shadow-md shrink-0 bg-stone-200"
                  />
                  <div className="flex-1">
                    <input
                      type="url"
                      placeholder="أو الصق رابط صورة مخصص..."
                      value={myAvatar}
                      onChange={(e) => setMyAvatar(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  النبذة التعريفية (Bio)
                </label>
                <textarea
                  rows={3}
                  placeholder="اكتب نبذة عنك، مجالك الصحفي، ومسؤولياتك في إدارة الصحيفة الرقمية..."
                  value={myBio}
                  onChange={(e) => setMyBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>حفظ واعتماد بياناتي كمدير للنظام</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 8: DEDICATED SECTION FOR MUDIGITAL OFFICIAL CHANNELS & SETTINGS */}
          {activeTab === 'social_accounts' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn py-2">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold font-headline text-stone-900 dark:text-white">
                        إدارة صفحات وقنوات صحيفة MUDigital الرسمية
                      </h3>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                        قسم مخصص
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      تحديد وتعديل عناوين صفحات وقنوات MUDigital الرسمية الأربعة التي تظهر أسفل كل مادة صحفية منشورة وتذييل الجريدة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-stone-500 font-mono">
                    {[socialFacebook, socialTwitter, socialWhatsapp, socialTelegram].filter(Boolean).length} من 4 قنوات مفعلة
                  </span>
                </div>
              </div>

              {/* Feedback Notifications */}
              {socialSavedSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-bold flex items-center gap-2 animate-fadeIn shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تم حفظ وتحديث عناوين صفحات وقنوات MUDigital الرسمية بنجاح! تم تطبيق التغييرات فوراً على قارئ المواد وتذييل الصحيفة.</span>
                </div>
              )}

              {/* DEDICATED SECTION: OFFICIAL MUDIGITAL CHANNELS AND PAGES */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onUpdateSocialAccounts) {
                    onUpdateSocialAccounts({
                      facebook: socialFacebook.trim(),
                      twitter: socialTwitter.trim(),
                      whatsapp: socialWhatsapp.trim(),
                      telegram: socialTelegram.trim(),
                      instagram: socialInstagram.trim(),
                      youtube: socialYoutube.trim(),
                      autoPublishEnabled,
                      autoPublishPlatforms: {
                        facebook: autoFacebook,
                        twitter: autoTwitter,
                        telegram: autoTelegram,
                        whatsapp: autoWhatsapp
                      },
                      autoPublishWebhookUrl: autoWebhookUrl.trim(),
                      autoPublishLogs: socialAccounts?.autoPublishLogs || []
                    });
                  }
                  setSocialSavedSuccess(true);
                  setTimeout(() => setSocialSavedSuccess(false), 4500);
                }}
                className="space-y-5 bg-white dark:bg-stone-900/70 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs"
              >
                <div className="border-b border-stone-200 dark:border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 font-headline">
                      <Globe className="w-4 h-4 text-amber-600" />
                      <span>عناوين صفحات وقنوات صحيفة MUDigital الرسمية (4 منصات رئيسية)</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-1">
                      هذه العناوين تظهر للجمهور أسفل كل مادة صحفية في شريط "صفحات وقنوات صحيفة MUDigital الرسمية" وفي تذييل الموقع.
                    </p>
                  </div>
                  <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2.5 py-1 rounded-md font-mono self-start sm:self-auto">
                    4 Official Channels
                  </span>
                </div>

                {/* The 4 Official Channels Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Facebook Page */}
                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 space-y-2 hover:border-blue-300 dark:hover:border-blue-900/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
                          <FacebookIcon className="w-3.5 h-3.5" />
                        </div>
                        <span>صفحة فيسبوك الرسمية (Facebook)</span>
                      </label>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${socialFacebook ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'}`}>
                        {socialFacebook ? 'مربوط وجاهز' : 'بانتظار الرابط'}
                      </span>
                    </div>

                    <input
                      type="url"
                      placeholder="https://facebook.com/mudigital.news"
                      value={socialFacebook}
                      onChange={(e) => setSocialFacebook(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 dir-ltr text-left font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-stone-400 text-[10px]">رابط الصفحة المباشر</span>
                      {socialFacebook && (
                        <a
                          href={socialFacebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1877F2] font-semibold hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>تجربة فتح الرابط</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 2. Twitter / X Account */}
                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 space-y-2 hover:border-stone-400 dark:hover:border-stone-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-stone-900/10 dark:bg-stone-100/10 flex items-center justify-center text-stone-900 dark:text-white">
                          <XTwitterIcon className="w-3.5 h-3.5" />
                        </div>
                        <span>حساب منصة X الرسمي (Twitter)</span>
                      </label>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${socialTwitter ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'}`}>
                        {socialTwitter ? 'مربوط وجاهز' : 'بانتظار الرابط'}
                      </span>
                    </div>

                    <input
                      type="url"
                      placeholder="https://x.com/mudigital_news"
                      value={socialTwitter}
                      onChange={(e) => setSocialTwitter(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 dir-ltr text-left font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-stone-400 text-[10px]">حساب المنصة الرسمي</span>
                      {socialTwitter && (
                        <a
                          href={socialTwitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-800 dark:text-stone-200 font-semibold hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>تجربة فتح الرابط</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 3. WhatsApp Channel */}
                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 space-y-2 hover:border-emerald-300 dark:hover:border-emerald-900/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                        </div>
                        <span>قناة واتساب الرسمية (WhatsApp)</span>
                      </label>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${socialWhatsapp ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'}`}>
                        {socialWhatsapp ? 'مربوط وجاهز' : 'بانتظار الرابط'}
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="https://whatsapp.com/channel/... أو +201000000000"
                      value={socialWhatsapp}
                      onChange={(e) => setSocialWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 dir-ltr text-left font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-stone-400 text-[10px]">يدعم رابط القناة أو الرقم المباشر</span>
                      {socialWhatsapp && (
                        <a
                          href={socialWhatsapp.startsWith('http') ? socialWhatsapp : `https://wa.me/${socialWhatsapp.replace(/\+/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#25D366] font-semibold hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>تجربة فتح الرابط</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 4. Telegram Channel */}
                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 space-y-2 hover:border-sky-300 dark:hover:border-sky-900/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-[#229ED9]/10 flex items-center justify-center text-[#229ED9]">
                          <TelegramIcon className="w-3.5 h-3.5" />
                        </div>
                        <span>قناة تليجرام الرسمية (Telegram)</span>
                      </label>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${socialTelegram ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'}`}>
                        {socialTelegram ? 'مربوط وجاهز' : 'بانتظار الرابط'}
                      </span>
                    </div>

                    <input
                      type="url"
                      placeholder="https://t.me/mudigital_news"
                      value={socialTelegram}
                      onChange={(e) => setSocialTelegram(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 dir-ltr text-left font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-stone-400 text-[10px]">رابط القناة الإخبارية الرسمي</span>
                      {socialTelegram && (
                        <a
                          href={socialTelegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#229ED9] font-semibold hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>تجربة فتح الرابط</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* LIVE PREVIEW OF IN-ARTICLE OFFICIAL CHANNELS BAR */}
                <div className="p-4 rounded-xl bg-stone-100/80 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <span>معاينة حية لشكل ظهور القنوات أسفل المواد الصحفية للقراء:</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">Live Article Bar Preview</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200/80 dark:border-stone-800">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">صفحات وقنوات صحيفة MUDigital الرسمية:</span>
                      {socialFacebook && (
                        <span className="text-[#1877F2] font-medium inline-flex items-center gap-1">
                          <FacebookIcon className="w-3 h-3" />
                          <span>صفحة فيسبوك الرسمية</span>
                        </span>
                      )}
                      {socialTwitter && (
                        <>
                          {socialFacebook && <span>·</span>}
                          <span className="text-stone-900 dark:text-stone-100 font-medium inline-flex items-center gap-1">
                            <XTwitterIcon className="w-3 h-3" />
                            <span>حساب منصة X الرسمي</span>
                          </span>
                        </>
                      )}
                      {socialWhatsapp && (
                        <>
                          {(socialFacebook || socialTwitter) && <span>·</span>}
                          <span className="text-[#25D366] font-medium inline-flex items-center gap-1">
                            <WhatsAppIcon className="w-3 h-3" />
                            <span>قناة واتساب الرسمية</span>
                          </span>
                        </>
                      )}
                      {socialTelegram && (
                        <>
                          {(socialFacebook || socialTwitter || socialWhatsapp) && <span>·</span>}
                          <span className="text-[#229ED9] font-medium inline-flex items-center gap-1">
                            <TelegramIcon className="w-3 h-3" />
                            <span>قناة تليجرام الرسمية</span>
                          </span>
                        </>
                      )}
                      {!socialFacebook && !socialTwitter && !socialWhatsapp && !socialTelegram && (
                        <span className="text-stone-400 italic text-[11px]">
                          لم يتم إدخال أي روابط بعد. أدخل الروابط أعلاه لمشاهدة المعاينة الفورية هنا.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Save Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-stone-500">
                    يتم الحفظ والتطبيق الفوري على كافة أنحاء الموقع ومقالات الصحيفة.
                  </span>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ وتثبيت عناوين صفحات وقنوات MUDigital الرسمية</span>
                  </button>
                </div>
              </form>

              {/* AUTOMATION ENGINE SETTINGS CARD (SECONDARY) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-50 via-stone-100/50 to-transparent dark:from-stone-900/80 dark:via-stone-900/40 dark:to-transparent border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h4 className="text-sm font-bold text-stone-900 dark:text-white font-headline">
                        خاصية النشر الآلي المباشر (Automated Cross-Posting)
                      </h4>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      عند إجازة أي مقال أو تقرير للنشر النهائي (Published)، يتم آلياً إرسال ملخص المقال، العنوان، الرابط المباشر، وصورة الغلاف إلى منصات الصحيفة المحددة أدناه.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoPublishEnabled}
                        onChange={(e) => setAutoPublishEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      <span className="mr-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                        {autoPublishEnabled ? 'مفعل' : 'معطل'}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setTestPublishing(true);
                        setTestPublishSuccess(false);
                        setTimeout(() => {
                          setTestPublishing(false);
                          setTestPublishSuccess(true);
                          setTimeout(() => setTestPublishSuccess(false), 4500);
                        }, 1200);
                      }}
                      disabled={testPublishing}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      title="تجربة النشر الآلي لخبر تجريبي على المنصات المختارة"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{testPublishing ? 'جارٍ البث...' : 'اختبار البث التجريبي'}</span>
                    </button>
                  </div>
                </div>

                {testPublishSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-bold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>نجح اختبار البث الآلي! تم تجهيز ومحاكاة إرسال بطاقة الخبر مع الصورة والملخص إلى المنصات المحددة بنجاح.</span>
                  </div>
                )}

                {/* Platforms selection checkboxes */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                  <span className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-2.5">
                    المنصات المستهدفة بالنشر الآلي فور اعتماد النشر:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                    {/* Facebook Auto */}
                    <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${autoFacebook ? 'bg-white dark:bg-stone-900 border-[#1877F2]/60 shadow-xs' : 'bg-stone-100/60 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-70'}`}>
                      <input
                        type="checkbox"
                        checked={autoFacebook}
                        onChange={(e) => setAutoFacebook(e.target.checked)}
                        className="rounded text-[#1877F2]"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] shrink-0" />
                      <div>
                        <span className="font-bold block text-[11px]">فيسبوك</span>
                        <span className="text-[10px] text-stone-400">صفحة الصحيفة</span>
                      </div>
                    </label>

                    {/* Twitter / X Auto */}
                    <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${autoTwitter ? 'bg-white dark:bg-stone-900 border-stone-900 dark:border-stone-400 shadow-xs' : 'bg-stone-100/60 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-70'}`}>
                      <input
                        type="checkbox"
                        checked={autoTwitter}
                        onChange={(e) => setAutoTwitter(e.target.checked)}
                        className="rounded text-black"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white shrink-0" />
                      <div>
                        <span className="font-bold block text-[11px]">منصة X</span>
                        <span className="text-[10px] text-stone-400">تغريدة فورية</span>
                      </div>
                    </label>

                    {/* Telegram Channel Auto */}
                    <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${autoTelegram ? 'bg-white dark:bg-stone-900 border-[#229ED9]/60 shadow-xs' : 'bg-stone-100/60 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-70'}`}>
                      <input
                        type="checkbox"
                        checked={autoTelegram}
                        onChange={(e) => setAutoTelegram(e.target.checked)}
                        className="rounded text-[#229ED9]"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#229ED9] shrink-0" />
                      <div>
                        <span className="font-bold block text-[11px]">تليجرام</span>
                        <span className="text-[10px] text-stone-400">قناة الأخبار</span>
                      </div>
                    </label>

                    {/* WhatsApp Channel Auto */}
                    <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${autoWhatsapp ? 'bg-white dark:bg-stone-900 border-[#25D366]/60 shadow-xs' : 'bg-stone-100/60 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-70'}`}>
                      <input
                        type="checkbox"
                        checked={autoWhatsapp}
                        onChange={(e) => setAutoWhatsapp(e.target.checked)}
                        className="rounded text-[#25D366]"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] shrink-0" />
                      <div>
                        <span className="font-bold block text-[11px]">واتساب</span>
                        <span className="text-[10px] text-stone-400">قناة البث</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Optional Webhook Integration */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                    رابط الـ Webhook التلقائي للتكامل مع خدمات الأتمتة (Webhook / API URL) - اختياري:
                  </label>
                  <input
                    type="url"
                    placeholder="https://hooks.zapier.com/hooks/catch/... أو https://api.telegram.org/bot..."
                    value={autoWebhookUrl}
                    onChange={(e) => setAutoWebhookUrl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 dir-ltr text-left font-mono"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    يتيح ربط خروج الأخبار المعتمدة مباشرة بأي Webhook خارجي لإرسال تنبيهات تلقائية إلى سيرفرات الكلية أو قنوات تيليجرام وصفحات فيسبوك دون تدخل يدوي.
                  </p>
                </div>
              </div>

              {/* RECENT AUTO-PUBLISHING LOGS */}
              {socialAccounts?.autoPublishLogs && socialAccounts.autoPublishLogs.length > 0 && (
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-amber-600" />
                    <span>سجل النشر الآلي الأخير على المنصات:</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {socialAccounts.autoPublishLogs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="font-bold text-stone-900 dark:text-stone-100 block">{log.articleTitle}</span>
                          <span className="text-[11px] text-stone-500 block">{log.message}</span>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {log.platforms.map((p) => (
                              <span key={p} className="text-[10px] bg-stone-200 dark:bg-stone-700 px-1.5 py-0.2 rounded font-mono">
                                {p === 'facebook' ? 'فيسبوك' : p === 'twitter' ? 'منصة X' : p === 'telegram' ? 'تليجرام' : 'واتساب'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono shrink-0">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* REUSABLE PHOTO PICKER MODAL */}
        <PhotoLibraryModal
          isOpen={isPhotoPickerOpen}
          onClose={() => setIsPhotoPickerOpen(false)}
          photoLibrary={photoLibrary}
          onAddPhoto={onAddPhoto}
          onUpdatePhoto={onUpdatePhoto}
          onDeletePhoto={onDeletePhoto}
          onSelectPhoto={handlePhotoPicked}
          initialGroup={
            photoPickerTarget === 'article' || photoPickerTarget === 'inspected_article'
              ? photoPickerGroup
              : 'profile'
          }
          initialOrientation={photoPickerOrientation}
          initialPresetFilter={
            photoPickerTarget === 'article' || photoPickerTarget === 'inspected_article'
              ? 'all'
              : 'profile_square'
          }
          modalTitle={
            photoPickerTarget === 'article' || photoPickerTarget === 'inspected_article'
              ? photoPickerGroup === 'infographic'
                ? 'قسم صور الإنفوجرافيك والمخططات البيانية (الحجم الطبيعي وبدون قص)'
                : 'اختيار صورة موضوعية أو إنفوجرافيك للمقال (أفقي أو رأسي بدون قص)'
              : photoPickerTarget === 'compose_author' || photoPickerTarget === 'inspected_author'
              ? 'اختيار صورة شخصية لكاتب المقال (400 × 400)'
              : photoPickerTarget === 'edit_user'
              ? `اختيار صورة شخصية للمحرر: ${editUserName || 'المحرر'} (400 × 400)`
              : 'اختيار صورة شخصية للبروفايل (400 × 400)'
          }
        />
      </div>
    </div>
  );
};
