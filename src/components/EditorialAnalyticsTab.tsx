import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Eye,
  Award,
  Users,
  PieChart as PieIcon,
  Filter,
  CheckCircle2,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { Article, EditorialUser } from '../types/newspaper';

interface EditorialAnalyticsTabProps {
  articles: Article[];
  editorialUsers: EditorialUser[];
}

// Elegant color palette for charts
const CATEGORY_COLORS = [
  '#d97706', // amber-600
  '#2563eb', // blue-600
  '#059669', // emerald-600
  '#9333ea', // purple-600
  '#dc2626', // red-600
  '#0891b2', // cyan-600
  '#ea580c', // orange-600
  '#4f46e5'  // indigo-600
];

export const EditorialAnalyticsTab: React.FC<EditorialAnalyticsTabProps> = ({
  articles,
  editorialUsers
}) => {
  const [filterMode, setFilterMode] = useState<'published_only' | 'all_articles'>('published_only');
  const [tableSortBy, setTableSortBy] = useState<'views' | 'articles' | 'name'>('views');

  // Filter articles based on mode
  const targetArticles = useMemo(() => {
    if (filterMode === 'published_only') {
      return articles.filter((a) => a.status === 'published');
    }
    return articles;
  }, [articles, filterMode]);

  // Aggregate stats per editor
  const editorStats = useMemo(() => {
    // Build map starting with registered editorial users
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        role: string;
        avatar: string;
        publishedCount: number;
        draftCount: number;
        totalCount: number;
        totalViews: number;
        totalLikes: number;
        articlesList: Article[];
        topArticle?: Article;
      }
    >();

    // Seed with registered users
    editorialUsers.forEach((u) => {
      map.set(u.name.trim(), {
        id: u.id,
        name: u.name.trim(),
        role: u.roleTitleAr || 'محرر صحفي',
        avatar: u.avatar,
        publishedCount: 0,
        draftCount: 0,
        totalCount: 0,
        totalViews: 0,
        totalLikes: 0,
        articlesList: []
      });
    });

    // Process all articles
    articles.forEach((art) => {
      const authorName = (art.author.name || '').trim();
      if (!authorName) return;

      // Find best match in map
      let entry = map.get(authorName);
      if (!entry) {
        // Try loose matching (e.g. first and last name)
        for (const [key, val] of map.entries()) {
          if (authorName.includes(key) || key.includes(authorName)) {
            entry = val;
            break;
          }
        }
      }

      if (!entry) {
        // Create new entry for this author
        entry = {
          id: `author-${authorName}`,
          name: authorName,
          role: art.author.role || 'محرر ومساهم',
          avatar: art.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
          publishedCount: 0,
          draftCount: 0,
          totalCount: 0,
          totalViews: 0,
          totalLikes: 0,
          articlesList: []
        };
        map.set(authorName, entry);
      }

      entry.totalCount += 1;
      if (art.status === 'published') {
        entry.publishedCount += 1;
        entry.totalViews += art.views || 0;
        entry.totalLikes += art.likes || 0;
      } else {
        entry.draftCount += 1;
      }
      entry.articlesList.push(art);

      // Track top article
      if (!entry.topArticle || (art.views || 0) > (entry.topArticle.views || 0)) {
        entry.topArticle = art;
      }
    });

    return Array.from(map.values());
  }, [articles, editorialUsers]);

  // Overall Totals
  const overallTotals = useMemo(() => {
    const totalPublished = articles.filter((a) => a.status === 'published').length;
    const totalViews = articles.reduce((sum, a) => sum + (a.status === 'published' ? (a.views || 0) : 0), 0);
    const avgViews = totalPublished > 0 ? Math.round(totalViews / totalPublished) : 0;

    // Top editor by views
    const sortedByViews = [...editorStats].sort((a, b) => b.totalViews - a.totalViews);
    const topEditorByViews = sortedByViews.length > 0 && sortedByViews[0].totalViews > 0 ? sortedByViews[0] : null;

    // Top editor by published articles
    const sortedByArticles = [...editorStats].sort((a, b) => b.publishedCount - a.publishedCount);
    const topEditorByArticles = sortedByArticles.length > 0 && sortedByArticles[0].publishedCount > 0 ? sortedByArticles[0] : null;

    return {
      totalPublished,
      totalViews,
      avgViews,
      topEditorByViews,
      topEditorByArticles
    };
  }, [articles, editorStats]);

  // Data for Chart 1: Articles Published per Editor
  const articlesChartData = useMemo(() => {
    return editorStats
      .map((e) => ({
        name: e.name.length > 14 ? `${e.name.slice(0, 13)}..` : e.name,
        fullName: e.name,
        'المقالات المنشورة': e.publishedCount,
        'المسودات وقيد التدقيق': e.draftCount,
        'إجمالي المقالات': e.totalCount
      }))
      .filter((e) => e['إجمالي المقالات'] > 0)
      .sort((a, b) => b['المقالات المنشورة'] - a['المقالات المنشورة']);
  }, [editorStats]);

  // Data for Chart 2: Total Views per Editor
  const viewsChartData = useMemo(() => {
    return editorStats
      .map((e) => ({
        name: e.name.length > 14 ? `${e.name.slice(0, 13)}..` : e.name,
        fullName: e.name,
        'عدد المشاهدات': e.totalViews
      }))
      .filter((e) => e['عدد المشاهدات'] > 0)
      .sort((a, b) => b['عدد المشاهدات'] - a['عدد المشاهدات']);
  }, [editorStats]);

  // Data for Chart 3: Category Distribution
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    targetArticles.forEach((art) => {
      const cat = art.category || 'أخرى';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [targetArticles]);

  // Sorted list for table
  const sortedEditorStats = useMemo(() => {
    const list = [...editorStats].filter((e) => e.totalCount > 0);
    if (tableSortBy === 'views') {
      return list.sort((a, b) => b.totalViews - a.totalViews);
    }
    if (tableSortBy === 'articles') {
      return list.sort((a, b) => b.publishedCount - a.publishedCount);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [editorStats, tableSortBy]);

  return (
    <div className="space-y-6 animate-fadeIn font-body">
      {/* 1. Header Banner & Filter */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-l from-amber-900/10 via-amber-800/5 to-transparent border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-600 text-white shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold font-headline text-stone-950 dark:text-white">
              لوحة الإحصائيات والأداء التحريري
            </h3>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            مؤشرات دقيقة لأداء هيئة التحرير، عدد المقالات المنشورة لكل كاتب، ومجموع القراءات والمشاهدات المحققة.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-stone-900 p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs">
          <Filter className="w-3.5 h-3.5 text-stone-400 mr-1" />
          <button
            onClick={() => setFilterMode('published_only')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
              filterMode === 'published_only'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            المقالات المنشورة فقط
          </button>
          <button
            onClick={() => setFilterMode('all_articles')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
              filterMode === 'all_articles'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            جميع المواد (شاملة المسودات)
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold">إجمالي المشاهدات للمقالات</span>
            <Eye className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-headline text-stone-950 dark:text-white">
            {overallTotals.totalViews.toLocaleString('ar-EG')}
          </div>
          <p className="text-[11px] text-stone-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>تفاعل قراء الصحيفة الرقمية</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold">المقالات المنشورة المعتمدة</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-headline text-stone-950 dark:text-white">
            {overallTotals.totalPublished} <span className="text-xs font-normal text-stone-500">مقالاً</span>
          </div>
          <p className="text-[11px] text-stone-500">
            من إجمالي {articles.length} مادة صحفية ومسودة
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold">متوسط القراءات للمقال الواحد</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-headline text-stone-950 dark:text-white">
            {overallTotals.avgViews.toLocaleString('ar-EG')} <span className="text-xs font-normal text-stone-500">مشاهدة</span>
          </div>
          <p className="text-[11px] text-stone-500">
            معدل القراءة لكل مادة منشورة
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold">المحرر الأعلى قراءةً</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          {overallTotals.topEditorByViews ? (
            <div>
              <div className="text-base font-bold font-headline text-stone-950 dark:text-white line-clamp-1">
                {overallTotals.topEditorByViews.name}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {overallTotals.topEditorByViews.totalViews.toLocaleString('ar-EG')} مشاهدة ({overallTotals.topEditorByViews.publishedCount} مقال)
              </p>
            </div>
          ) : (
            <div className="text-sm text-stone-400">لا توجد بيانات</div>
          )}
        </div>
      </div>

      {/* 3. Recharts Section: Side-by-Side Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Articles Published per Editor */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold font-headline text-stone-950 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <span>عدد المقالات لكل محرر</span>
              </h4>
              <p className="text-[11px] text-stone-500">
                مقارنة إنتاجية أعضاء هيئة التحرير من المقالات المنشورة
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              Recharts Bar
            </span>
          </div>

          <div className="w-full h-72" dir="ltr">
            {articlesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={articlesChartData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#888' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#888' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(24, 24, 27, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #3f3f46',
                      color: '#fff',
                      fontSize: '12px',
                      direction: 'rtl'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Bar
                    dataKey="المقالات المنشورة"
                    fill="#d97706"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                  {filterMode === 'all_articles' && (
                    <Bar
                      dataKey="المسودات وقيد التدقيق"
                      fill="#94a3b8"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                لا توجد مقالات منشورة بعد
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Total Views per Editor */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold font-headline text-stone-950 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>إجمالي المشاهدات لمقالات كل محرر</span>
              </h4>
              <p className="text-[11px] text-stone-500">
                مجموع القراءات التي حققتها مقالات كل كاتب
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              Recharts Bar
            </span>
          </div>

          <div className="w-full h-72" dir="ltr">
            {viewsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={viewsChartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#888' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#888' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(24, 24, 27, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #3f3f46',
                      color: '#fff',
                      fontSize: '12px',
                      direction: 'rtl'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}
                    formatter={(val: any) => [`${Number(val).toLocaleString('ar-EG')} قراءة`, 'المشاهدات']}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Bar
                    dataKey="عدد المشاهدات"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                لا توجد قراءات مسجلة بعد
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Chart 3: Category Distribution Donut */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold font-headline text-stone-950 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-600" />
              <span>التوزيع الموضوعي للمقالات حسب الأقسام الصحفية</span>
            </h4>
            <p className="text-[11px] text-stone-500">
              توازن التغطيات الصحفية بين التحقيقات، التكنولوجيا، نبض الجامعة، والثقافة
            </p>
          </div>
          <span className="text-xs text-stone-500">
            إجمالي الأقسام المغطاة: <strong>{categoryChartData.length}</strong>
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-around gap-6 pt-2">
          <div className="w-full md:w-1/2 h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {categoryChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(24, 24, 27, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #3f3f46',
                    color: '#fff',
                    fontSize: '12px',
                    direction: 'rtl'
                  }}
                  formatter={(value: any) => [`${value} مقال`, 'العدد']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown legend list */}
          <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {categoryChartData.map((cat, idx) => {
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              const pct = targetArticles.length > 0
                ? Math.round((cat.value / targetArticles.length) * 100)
                : 0;

              return (
                <div
                  key={cat.name}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="font-bold text-stone-950 dark:text-white">{cat.value}</span>
                    <span className="text-stone-400">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Detailed Editors Performance Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-sm font-bold font-headline text-stone-950 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span>جدول التفاصيل التحريرية الشاملة للمحررين ({sortedEditorStats.length})</span>
          </h4>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              <span>ترتيب حسب:</span>
            </span>
            <button
              onClick={() => setTableSortBy('views')}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                tableSortBy === 'views'
                  ? 'bg-amber-600 text-white border-amber-600 font-bold'
                  : 'border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              الأعلى مشاهدة
            </button>
            <button
              onClick={() => setTableSortBy('articles')}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                tableSortBy === 'articles'
                  ? 'bg-amber-600 text-white border-amber-600 font-bold'
                  : 'border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              الأكثر نشراً
            </button>
            <button
              onClick={() => setTableSortBy('name')}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                tableSortBy === 'name'
                  ? 'bg-amber-600 text-white border-amber-600 font-bold'
                  : 'border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              الاسم أبجدياً
            </button>
          </div>
        </div>

        <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-900 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-100 dark:bg-stone-850 text-stone-700 dark:text-stone-300 border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="p-3.5 font-bold">المحرر / الكاتب</th>
                  <th className="p-3.5 font-bold">الرتبة التحريرية</th>
                  <th className="p-3.5 font-bold text-center">المقالات المنشورة</th>
                  <th className="p-3.5 font-bold text-center">المسودات</th>
                  <th className="p-3.5 font-bold text-center">مجموع المشاهدات</th>
                  <th className="p-3.5 font-bold text-center">متوسط المشاهدات</th>
                  <th className="p-3.5 font-bold">المقال الأكثر قراءة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-body">
                {sortedEditorStats.map((editor) => {
                  const avg = editor.publishedCount > 0
                    ? Math.round(editor.totalViews / editor.publishedCount)
                    : 0;

                  return (
                    <tr
                      key={editor.id}
                      className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={editor.avatar}
                            alt={editor.name}
                            className="w-9 h-9 rounded-full object-cover border-2 border-stone-200 dark:border-stone-700"
                          />
                          <div>
                            <span className="font-bold text-stone-950 dark:text-white block">
                              {editor.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-stone-600 dark:text-stone-400">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-medium">
                          {editor.role}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-bold text-amber-700 dark:text-amber-400 text-sm">
                        {editor.publishedCount}
                      </td>

                      <td className="p-3.5 text-center text-stone-400 text-xs">
                        {editor.draftCount}
                      </td>

                      <td className="p-3.5 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {editor.totalViews.toLocaleString('ar-EG')}
                      </td>

                      <td className="p-3.5 text-center font-mono text-stone-600 dark:text-stone-400">
                        {avg.toLocaleString('ar-EG')}
                      </td>

                      <td className="p-3.5 text-stone-700 dark:text-stone-300 max-w-xs">
                        {editor.topArticle ? (
                          <div className="space-y-0.5">
                            <span className="line-clamp-1 font-semibold text-stone-900 dark:text-stone-100">
                              {editor.topArticle.title}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              ({(editor.topArticle.views || 0).toLocaleString('ar-EG')} قراءة)
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
