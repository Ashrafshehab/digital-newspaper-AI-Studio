import React, { useState, useEffect, useMemo } from 'react';
import { Masthead } from './components/Masthead';
import { BreakingTicker } from './components/BreakingTicker';
import { NavigationCategories } from './components/NavigationCategories';
import { GraduationProjectBanner } from './components/GraduationProjectBanner';
import { LeadHeroSection } from './components/LeadHeroSection';
import { ArticleCard } from './components/ArticleCard';
import { OpinionSection } from './components/OpinionSection';
import { TrendingSidebar } from './components/TrendingSidebar';
import { QuickReaderModal } from './components/QuickReaderModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { SearchModal } from './components/SearchModal';
import { NewspaperFooter } from './components/NewspaperFooter';
import { EditorialLoginModal } from './components/EditorialLoginModal';
import { EditorialDashboardModal } from './components/EditorialDashboardModal';
import { AuthorProfileModal } from './components/AuthorProfileModal';

import {
  INITIAL_ARTICLES,
  CATEGORIES,
  BREAKING_NEWS,
  GRADUATION_PROJECT_INFO,
  OPINION_COLUMNS,
  EDITORIAL_USERS
} from './data/mockArticles';
import { INITIAL_PHOTO_LIBRARY } from './data/defaultPhotos';
import { Article, ArticleWorkflowStatus, EditorialUser, WorkflowLog, Comment, Category, PhotoLibraryItem } from './types/newspaper';

export default function App() {
  // 1. Dark Mode State with HTML Class Sync
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('mudigital_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mudigital_dark_mode', String(darkMode));
  }, [darkMode]);

  // 2. Editorial Users State (Managed by Admin)
  const [editorialUsers, setEditorialUsers] = useState<EditorialUser[]>(() => {
    const saved = localStorage.getItem('mudigital_editorial_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return EDITORIAL_USERS;
      }
    }
    return EDITORIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem('mudigital_editorial_users', JSON.stringify(editorialUsers));
  }, [editorialUsers]);

  // 3. Editorial Authentication State
  const [currentEditorialUser, setCurrentEditorialUser] = useState<EditorialUser | null>(() => {
    const saved = localStorage.getItem('mudigital_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentEditorialUser) {
      localStorage.setItem('mudigital_user', JSON.stringify(currentEditorialUser));
    } else {
      localStorage.removeItem('mudigital_user');
    }
  }, [currentEditorialUser]);

  // 4. Articles State (Stored in LocalStorage for persistence)
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('mudigital_articles');
    if (saved) {
      try {
        const parsed: Article[] = JSON.parse(saved);
        // Ensure category name is updated from old name 'تحقيقات واستقصاء' to 'تقارير وتحقيقات'
        const updatedArticles = parsed.map((a) => {
          if (a.categoryId === 'investigations' || a.category === 'تحقيقات واستقصاء') {
            return { ...a, category: 'تقارير وتحقيقات' };
          }
          return a;
        });
        // Ensure new multimedia articles are merged if missing
        const existingIds = new Set(updatedArticles.map((a) => a.id));
        const missingNew = INITIAL_ARTICLES.filter((a) => !existingIds.has(a.id));
        if (missingNew.length > 0) {
          return [...missingNew, ...updatedArticles];
        }
        return updatedArticles;
      } catch {
        return INITIAL_ARTICLES;
      }
    }
    return INITIAL_ARTICLES;
  });

  useEffect(() => {
    localStorage.setItem('mudigital_articles', JSON.stringify(articles));
  }, [articles]);

  // 5. Categories & Sections State (Managed by Admin)
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('mudigital_categories');
    if (saved) {
      try {
        let parsed: Category[] = JSON.parse(saved);
        // Ensure section name is updated from 'تحقيقات واستقصاء' to 'تقارير وتحقيقات'
        parsed = parsed.map((c) => {
          if (c.id === 'investigations') {
            return {
              ...c,
              name: 'تقارير وتحقيقات',
              description: 'تقارير ميدانية وتحقيقات استقصائية وقصص صحافة البيانات المعمقة'
            };
          }
          return c;
        });
        // Ensure multimedia category is included if missing in previous localStorage
        const hasMultimedia = parsed.some((c) => c.id === 'multimedia');
        if (!hasMultimedia) {
          const multimediaCat = CATEGORIES.find((c) => c.id === 'multimedia');
          if (multimediaCat) {
            return [parsed[0], multimediaCat, ...parsed.slice(1)];
          }
        }
        return parsed;
      } catch {
        return CATEGORIES;
      }
    }
    return CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('mudigital_categories', JSON.stringify(categories));
  }, [categories]);

  // 6. Bookmarks State
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('mudigital_bookmarks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['art-001'];
      }
    }
    return ['art-001'];
  });

  useEffect(() => {
    localStorage.setItem('mudigital_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // 7. Photo Library State
  const [photoLibrary, setPhotoLibrary] = useState<PhotoLibraryItem[]>(() => {
    const saved = localStorage.getItem('mudigital_photo_library');
    if (saved) {
      try {
        const parsed: PhotoLibraryItem[] = JSON.parse(saved);
        // Ensure new preset photos are merged if missing
        const existingIds = new Set(parsed.map((p) => p.id));
        const missing = INITIAL_PHOTO_LIBRARY.filter((p) => !existingIds.has(p.id));
        if (missing.length > 0) {
          return [...missing, ...parsed];
        }
        return parsed;
      } catch {
        return INITIAL_PHOTO_LIBRARY;
      }
    }
    return INITIAL_PHOTO_LIBRARY;
  });

  useEffect(() => {
    localStorage.setItem('mudigital_photo_library', JSON.stringify(photoLibrary));
  }, [photoLibrary]);

  const handleAddPhoto = (newPhoto: PhotoLibraryItem) => {
    setPhotoLibrary((prev) => [newPhoto, ...prev]);
  };

  const handleUpdatePhoto = (id: string, updated: Partial<PhotoLibraryItem>) => {
    setPhotoLibrary((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const handleDeletePhoto = (id: string) => {
    setPhotoLibrary((prev) => prev.filter((p) => p.id !== id));
  };

  // 7. Navigation & Filtering State
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'broadsheet' | 'compact'>('grid');

  // 8. Modals and Drawers State
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGraduationBannerOpen, setIsGraduationBannerOpen] = useState(false);
  const [selectedAuthorForProfile, setSelectedAuthorForProfile] = useState<string | null>(null);

  // Toggle bookmark handler
  const handleToggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const isBookmarked = (id: string) => bookmarks.includes(id);

  // Like article handler
  const handleLikeArticle = (id: string) => {
    setArticles((prev) =>
      prev.map((art) => (art.id === id ? { ...art, likes: art.likes + 1 } : art))
    );
    if (activeArticle && activeArticle.id === id) {
      setActiveArticle((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
    }
  };

  // Add comment handler
  const handleAddComment = (articleId: string, commentData: { authorName: string; text: string }) => {
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      authorName: commentData.authorName,
      authorRole: 'قارئ متابع',
      date: 'الآن',
      text: commentData.text,
      likes: 0
    };

    setArticles((prev) =>
      prev.map((art) =>
        art.id === articleId ? { ...art, comments: [newComment, ...art.comments] } : art
      )
    );

    if (activeArticle && activeArticle.id === articleId) {
      setActiveArticle((prev) =>
        prev ? { ...prev, comments: [newComment, ...prev.comments] } : null
      );
    }
  };

  // Update Article Workflow (Stage 1 -> Stage 2 -> Stage 3 -> Published)
  const handleUpdateArticleWorkflow = (
    articleId: string,
    newStatus: ArticleWorkflowStatus,
    log: WorkflowLog
  ) => {
    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === articleId) {
          const currentLogs = art.workflowLogs || [];
          return {
            ...art,
            status: newStatus,
            workflowLogs: [...currentLogs, log],
            publishedAt: newStatus === 'published' ? 'اليوم - تم النشر حديثا' : art.publishedAt
          };
        }
        return art;
      })
    );

    if (activeArticle && activeArticle.id === articleId) {
      setActiveArticle((prev) =>
        prev ? { ...prev, status: newStatus, publishedAt: newStatus === 'published' ? 'اليوم' : prev.publishedAt } : null
      );
    }
  };

  // Add New Article (Draft created by student editor or reporter)
  const handleAddNewArticle = (newArticle: Article) => {
    setArticles((prev) => [newArticle, ...prev]);
  };

  // Update Article Content / Editorial Correction after publishing
  const handleUpdateArticle = (articleId: string, updatedFields: Partial<Article>) => {
    setArticles((prev) =>
      prev.map((art) => (art.id === articleId ? { ...art, ...updatedFields } : art))
    );
    if (activeArticle && activeArticle.id === articleId) {
      setActiveArticle((prev) => (prev ? { ...prev, ...updatedFields } : null));
    }
  };

  // Admin User Management Handlers
  const handleAddUser = (newUser: EditorialUser) => {
    setEditorialUsers((prev) => [...prev, newUser]);
  };

  const handleUpdateUser = (userId: string, updatedData: Partial<EditorialUser>) => {
    setEditorialUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updatedData } : u))
    );
    if (currentEditorialUser && currentEditorialUser.id === userId) {
      setCurrentEditorialUser((prev) => (prev ? { ...prev, ...updatedData } : null));
    }
  };

  const handleDeleteUser = (userId: string) => {
    setEditorialUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Open article & increase view count
  const handleOpenArticle = (article: Article) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, views: a.views + 1 } : a))
    );
    setActiveArticle({ ...article, views: article.views + 1 });
  };

  // Open opinion column in reader
  const handleOpenOpinion = (op: typeof OPINION_COLUMNS[0]) => {
    const opinionArticle: Article = {
      id: `op-art-${op.id}`,
      title: op.title,
      subtitle: `عمود رأي بقلم: ${op.authorName} (${op.authorTitle})`,
      excerpt: op.quote,
      content: [
        op.quote,
        'إن المسؤولية الأخلاقية والمهنية الملقاة على عاتق كاتب الرأي في العصر الرقمي تقتضي منه تحري الصدق وتقديم التحليل الرصين الهادف إلى بناء الوعي الجمعي المستنير.',
        'وفي ظل التطورات المتلاحقة لوسائل النشر، تتأكد الحاجة لصحافة تحترم عقل المتلقي وتقديم زوايا نظر غير تقليدية تسهم في إثراء النقاش العام وصناعة المستقبل.'
      ],
      pullQuote: op.quote,
      category: 'أقلام ورأي',
      categoryId: 'opinion',
      author: {
        name: op.authorName,
        role: op.authorTitle,
        avatar: op.avatar
      },
      publishedAt: `${op.date} · صحيفة MUDigital`,
      readTimeMinutes: parseInt(op.readTime) || 3,
      image: op.avatar,
      imageCaption: `صورة الكاتب: ${op.authorName}`,
      views: 780,
      likes: 54,
      tags: ['رأي', 'فكر', 'إعلام'],
      status: 'published',
      comments: []
    };
    handleOpenArticle(opinionArticle);
  };

  // ONLY PUBLISHED ARTICLES ARE SHOWN ON THE PUBLIC FRONT PAGE!
  const publishedArticles = useMemo(() => {
    return articles.filter((art) => art.status === 'published');
  }, [articles]);

  // Filtered published articles for public feed
  const filteredArticles = useMemo(() => {
    return publishedArticles.filter((art) => {
      const matchesCategory =
        selectedCategoryId === 'all' || art.categoryId === selectedCategoryId;
      const matchesTag = !selectedTag || art.tags.includes(selectedTag);
      return matchesCategory && matchesTag;
    });
  }, [publishedArticles, selectedCategoryId, selectedTag]);

  // Lead story and secondary stories for front page
  const leadArticle = publishedArticles.find((a) => a.isLead) || publishedArticles[0];
  const secondaryArticles = publishedArticles.filter((a) => a.id !== leadArticle?.id).slice(0, 2);

  // Bookmarked articles list
  const bookmarkedArticlesList = useMemo(() => {
    return articles.filter((a) => bookmarks.includes(a.id));
  }, [articles, bookmarks]);

  // Next / Previous article fast navigation inside modal
  const handleNextArticle = () => {
    if (!activeArticle) return;
    const currentIndex = publishedArticles.findIndex((a) => a.id === activeArticle.id);
    if (currentIndex !== -1 && currentIndex < publishedArticles.length - 1) {
      handleOpenArticle(publishedArticles[currentIndex + 1]);
    }
  };

  const handlePrevArticle = () => {
    if (!activeArticle) return;
    const currentIndex = publishedArticles.findIndex((a) => a.id === activeArticle.id);
    if (currentIndex > 0) {
      handleOpenArticle(publishedArticles[currentIndex - 1]);
    }
  };

  // Breaking ticker click handler
  const handleSelectHeadline = (headline: string) => {
    const matched = articles.find((a) => a.title.includes(headline) || headline.includes(a.title));
    if (matched) {
      handleOpenArticle(matched);
    } else {
      const breakingArticle: Article = {
        id: `breaking-${Date.now()}`,
        title: headline,
        subtitle: 'خبر عاجل صادر عن غرفة الأخبار المركزية بصحيفة MUDigital',
        excerpt: 'متابعة حية للتطورات والمستجدات الجامعية والأكاديمية لحظة بلحظة.',
        content: [
          headline,
          'أفاد مراسلونا بأن التفاصيل المكتملة يجري توثيقها حاليا عبر مصادرنا في الحرم الجامعي، وسنوافيكم بتقرير استقصائي موسع في الساعات القادمة.',
          'تؤكد إدارة التحرير حرصها على تحري الدقة المهنية قبل نشر أي تفاصيل إضافية وفق المعايير الصحفية المعتمدة.'
        ],
        category: 'أخبار عاجلة',
        categoryId: 'campus',
        author: {
          name: 'غرفة الأخبار العاجلة',
          role: 'فريق الرصد الصحفي السريع',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        },
        publishedAt: 'الآن · عاجل',
        readTimeMinutes: 2,
        image: articles[0]?.image || '',
        imageCaption: 'متابعة حية من غرفة تحرير MUDigital',
        views: 450,
        likes: 30,
        tags: ['عاجل', 'نبض الجامعة'],
        status: 'published',
        comments: []
      };
      handleOpenArticle(breakingArticle);
    }
  };

  // Open Editorial Portal Trigger
  const handleOpenEditorialPortal = () => {
    if (currentEditorialUser) {
      setIsDashboardModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0c0d0e] text-stone-900 dark:text-stone-100 flex flex-col font-body transition-colors">
      
      {/* 1. Newspaper Top Masthead */}
      <Masthead
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        bookmarksCount={bookmarks.length}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenEditorialPortal={handleOpenEditorialPortal}
        onOpenGraduationInfo={() => setIsGraduationBannerOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
        loggedInUserRoleTitle={currentEditorialUser ? currentEditorialUser.roleTitleAr.split('(')[0].trim() : undefined}
      />

      {/* 2. Urgent Breaking News Ticker */}
      <BreakingTicker
        items={BREAKING_NEWS}
        onSelectHeadline={handleSelectHeadline}
      />

      {/* 3. Sticky Categories Navigation & Layout Controls */}
      <NavigationCategories
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(id) => {
          setSelectedCategoryId(id);
          setSelectedTag(null);
        }}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        totalArticlesCount={publishedArticles.length}
      />

      {/* 4. Graduation Project Banner (Capstone Showcase) */}
      <GraduationProjectBanner
        info={GRADUATION_PROJECT_INFO}
        isOpenDefault={isGraduationBannerOpen}
      />

      {/* 5. Main Newspaper Editorial Canvas (Showing Approved & Published Articles) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 flex-1 w-full">
        
        {/* Front Page Lead & Opinion (on 'all' category without tag filter) */}
        {selectedCategoryId === 'all' && !selectedTag && leadArticle && (
          <>
            <LeadHeroSection
              leadArticle={leadArticle}
              secondaryArticles={secondaryArticles}
              onOpenArticle={handleOpenArticle}
              onToggleBookmark={handleToggleBookmark}
              isBookmarked={isBookmarked}
              onOpenAuthorProfile={(name) => setSelectedAuthorForProfile(name)}
            />

            <OpinionSection onOpenQuickOpinion={handleOpenOpinion} />
          </>
        )}

        {/* Section Heading & Category Filter Status */}
        <div className="py-6 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 mb-6">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-bold font-headline text-stone-950 dark:text-white">
              {selectedTag
                ? `المقالات والتقارير الموسومة بـ #${selectedTag}`
                : categories.find((c) => c.id === selectedCategoryId)?.name || 'أحدث التقارير'}
            </h2>
            <p className="text-xs text-stone-500 font-body">
              {selectedTag
                ? 'عرض نتائج التصفية بحسب الوسم المختار'
                : categories.find((c) => c.id === selectedCategoryId)?.description || 'تغطية صحفية مستمرة'}
            </p>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            المقالات المعتمدة للنشر: <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{filteredArticles.length}</span>
          </div>
        </div>

        {/* Content Layout: Published Articles Feed + Trending Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8">
            {filteredArticles.length === 0 ? (
              <div className="py-16 text-center text-stone-400 space-y-3 bg-stone-100/60 dark:bg-stone-900/40 rounded-xl p-8 border border-stone-200 dark:border-stone-800">
                <p className="text-base font-bold font-headline">لا توجد مواد صحفية منشورة في هذا القسم حاليا</p>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  يمكن كتابة تقرير جديد عبر لوحة التحكم وسيمر بمراحل التدقيق الثلاث قبل النشر.
                </p>
                <button
                  onClick={handleOpenEditorialPortal}
                  className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded hover:opacity-90 transition-opacity cursor-pointer inline-block"
                >
                  دخول لوحة التحكم بالنشر
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
                    : viewMode === 'broadsheet'
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-6 newspaper-columns'
                    : 'space-y-3'
                }
              >
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    viewMode={viewMode}
                    onOpen={handleOpenArticle}
                    onToggleBookmark={handleToggleBookmark}
                    isBookmarked={isBookmarked(article.id)}
                    onOpenAuthorProfile={(name) => setSelectedAuthorForProfile(name)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <TrendingSidebar
              articles={publishedArticles}
              onOpenArticle={handleOpenArticle}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
            />
          </div>

        </div>

      </main>

      {/* 6. Distraction-Free Quick Reader Modal */}
      <QuickReaderModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
        onToggleBookmark={handleToggleBookmark}
        isBookmarked={activeArticle ? isBookmarked(activeArticle.id) : false}
        onLikeArticle={handleLikeArticle}
        onAddComment={handleAddComment}
        onNextArticle={handleNextArticle}
        onPrevArticle={handlePrevArticle}
        onOpenAuthorProfile={(name) => setSelectedAuthorForProfile(name)}
        currentUser={currentEditorialUser}
        onUpdateArticle={handleUpdateArticle}
        categories={categories}
        editorialUsers={editorialUsers}
        photoLibrary={photoLibrary}
        onAddPhoto={handleAddPhoto}
        onUpdatePhoto={handleUpdatePhoto}
        onDeletePhoto={handleDeletePhoto}
      />

      {/* 7. Password-Protected Editorial Login Modal */}
      <EditorialLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        editorialUsers={editorialUsers}
        onLoginSuccess={(user) => {
          setCurrentEditorialUser(user);
          setIsDashboardModalOpen(true);
        }}
      />

      {/* 8. 3-Stage Editorial Workflow Dashboard Modal */}
      {currentEditorialUser && (
        <EditorialDashboardModal
          isOpen={isDashboardModalOpen}
          onClose={() => setIsDashboardModalOpen(false)}
          currentUser={currentEditorialUser}
          onLogout={() => {
            setCurrentEditorialUser(null);
            setIsDashboardModalOpen(false);
          }}
          articles={articles}
          onUpdateArticleWorkflow={handleUpdateArticleWorkflow}
          onAddNewArticle={handleAddNewArticle}
          onUpdateArticle={handleUpdateArticle}
          onViewArticlePreview={(article) => setActiveArticle(article)}
          categories={categories}
          onUpdateCategories={setCategories}
          editorialUsers={editorialUsers}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          photoLibrary={photoLibrary}
          onAddPhoto={handleAddPhoto}
          onUpdatePhoto={handleUpdatePhoto}
          onDeletePhoto={handleDeletePhoto}
        />
      )}

      {/* 9. Author Profile Modal */}
      {selectedAuthorForProfile && (
        <AuthorProfileModal
          isOpen={selectedAuthorForProfile !== null}
          onClose={() => setSelectedAuthorForProfile(null)}
          authorName={selectedAuthorForProfile}
          articles={publishedArticles}
          editorialUsers={editorialUsers}
          onOpenArticle={(article) => {
            setSelectedAuthorForProfile(null);
            handleOpenArticle(article);
          }}
          currentUser={currentEditorialUser}
          onUpdateUserProfile={handleUpdateUser}
        />
      )}

      {/* 10. Saved Articles Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedArticles={bookmarkedArticlesList}
        onOpenArticle={handleOpenArticle}
        onRemoveBookmark={handleToggleBookmark}
        onClearAll={() => setBookmarks([])}
      />

      {/* 11. Instant Fast Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={publishedArticles}
        onOpenArticle={handleOpenArticle}
      />

      {/* 12. Newspaper Footer */}
      <NewspaperFooter
        info={GRADUATION_PROJECT_INFO}
        onOpenGraduationInfo={() => {
          setIsGraduationBannerOpen(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={(id) => {
          setSelectedCategoryId(id);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onOpenEditorialPortal={handleOpenEditorialPortal}
      />

    </div>
  );
}
