import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  User,
  KeyRound,
  ShieldAlert,
  ArrowLeft,
  UserPlus,
  Mail,
  Copy,
  Check,
  Sparkles,
  Link2,
  FileBadge
} from 'lucide-react';
import { EditorialUser, EditorialRole } from '../types/newspaper';
import { EDITORIAL_USERS } from '../data/mockArticles';

interface EditorialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: EditorialUser) => void;
  onRegisterUser?: (user: EditorialUser) => void;
  editorialUsers?: EditorialUser[];
  initialMode?: 'login' | 'register';
}

export const EditorialLoginModal: React.FC<EditorialLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterUser,
  editorialUsers = EDITORIAL_USERS,
  initialMode = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<EditorialRole>('student_editor');
  const [regStudentId, setRegStudentId] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  // Copy direct link state
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setActiveTab(initialMode);
    setErrorMessage('');
    setRegSuccessMessage('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleCopyEditorialLink = () => {
    const origin = window.location.origin;
    const directUrl = `${origin}/editorial`;
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    const matched = editorialUsers.find(
      (u) => u.username.toLowerCase() === trimmedUser && u.password === trimmedPass
    );

    if (matched) {
      onLoginSuccess(matched);
      onClose();
    } else {
      setErrorMessage('اسم المستخدم أو كلمة السر غير صحيحة. يرجى التأكد أو اختيار حساب تجريبي من القائمة أدناه.');
    }
  };

  const handleQuickLogin = (user: EditorialUser) => {
    setUsername(user.username);
    setPassword(user.password || '123');
    onLoginSuccess(user);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUsername = regUsername.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('يرجى كتابة اسم مستخدم بالإنجليزية لا يقل عن 3 أحرف.');
      return;
    }

    if (editorialUsers.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setErrorMessage('اسم المستخدم هذا محجوز بالفعل لمحرر آخر، يرجى اختيار اسم مستخدم مختلف.');
      return;
    }

    if (!regPassword || regPassword.length < 3) {
      setErrorMessage('يرجى إدخال كلمة سر لا تقل عن 3 أحرف.');
      return;
    }

    if (!regName.trim()) {
      setErrorMessage('يرجى إدخال الاسم الكامل للصحفي أو المحرر.');
      return;
    }

    const roleTitles: Record<EditorialRole, string> = {
      admin: 'مشرف نظام (Admin)',
      editor_in_chief: 'رئيس التحرير',
      managing_editor: 'مدير التحرير',
      section_head: 'رئيس قسم التحرير',
      proofreader: 'مدقق لغوي ومراجع',
      student_editor: 'محرر صحفي طلابي'
    };

    const newUser: EditorialUser = {
      id: `user-${Date.now()}`,
      username: cleanUsername,
      password: regPassword,
      name: regName.trim(),
      role: regRole,
      roleTitleAr: roleTitles[regRole] || 'محرر صحفي',
      email: regEmail.trim() || `${cleanUsername}@mti.edu.eg`,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`,
      bio: regBio.trim() || 'عضو هيئة التحرير بصحيفة MUDigital الرقمية.',
      studentId: regStudentId.trim() || undefined,
      department: 'الصحافة والنشر الرقمي',
      canPublish: regRole === 'managing_editor' || regRole === 'editor_in_chief' || regRole === 'admin',
      canManageCategories: regRole === 'admin',
      canManageUsers: regRole === 'admin',
      joinedDate: '2026-03-01'
    };

    if (onRegisterUser) {
      onRegisterUser(newUser);
    }

    setRegSuccessMessage('تم إنشاء حساب المحرر بنجاح! جاري الدخول للوحة التحكم...');
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="bg-[#FBF9F5] dark:bg-[#121316] w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 transition-colors my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-headline">
                بوابة التحرير الرقمي - MUDigital
              </h2>
              <p className="text-[11px] text-stone-500">
                المسار المخصص لفريق وهيئة التحرير لإدارة ونشر المحتوى
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct Link Share Pill */}
        <div className="bg-amber-50 dark:bg-stone-900/90 border-b border-amber-200/60 dark:border-stone-800 px-5 py-2.5 flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Link2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-stone-500">الرابط المباشر للبوابة:</span>
            <code className="bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 text-amber-700 dark:text-amber-300 font-bold dir-ltr">
              /editorial
            </code>
            <span className="text-stone-400">أو</span>
            <code className="bg-white dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold dir-ltr">
              #editorial
            </code>
          </div>

          <button
            type="button"
            onClick={handleCopyEditorialLink}
            className="flex items-center gap-1 text-[11px] font-medium text-amber-800 dark:text-amber-300 hover:text-amber-950 bg-amber-100/80 dark:bg-amber-950/60 hover:bg-amber-200 px-2.5 py-1 rounded transition-colors cursor-pointer"
            title="نسخ الرابط المباشر لمشاركته مع المحررين"
          >
            {copiedLink ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>نسخ الرابط</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/40 dark:bg-stone-900/40 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>تسجيل دخول المحرر</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>تسجيل محرر جديد (عضوية جديدة)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4 font-body max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          {regSuccessMessage && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{regSuccessMessage}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <>
              {/* Workflow policy notification */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>دورة النشر الأكاديمية:</strong> يمر التقرير بمراحل التدقيق (المحرر، رئيس القسم، المدقق اللغوي، مدير التحرير).
                </span>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    اسم المستخدم (Username)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="مثال: admin أو editor أو salah"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600 dir-ltr text-right"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    كلمة السر
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="أدخل كلمة السر..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600 dir-ltr text-right"
                    />
                    <KeyRound className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>دخول لوحة التحكم والتحرير</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Quick Demo Login Switcher */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <span>حسابات تجريبية سريعة لتقييم المراحل (كلمة السر: 123):</span>
                </div>

                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto">
                  {editorialUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleQuickLogin(user)}
                      type="button"
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-stone-100 dark:bg-stone-800/60 hover:bg-stone-200/80 dark:hover:bg-stone-800 transition-colors text-right cursor-pointer border border-transparent hover:border-stone-300 dark:hover:border-stone-700"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div>
                          <span className="text-xs font-bold block text-stone-900 dark:text-stone-100">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {user.roleTitleAr}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/50 px-1.5 py-0.5 rounded dir-ltr">
                        {user.username}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Registration Tab */
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                <p>
                  <strong>تسجيل عضو جديد في هيئة التحرير:</strong> يمكنك تسجيل بياناتك الحقيقية للبدء في كتابة المقالات، وتوثيق اسمك وصورتك في الترويسة وبطاقة كاتب المقال.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  الاسم الكامل ثلاثي أو ثنائي *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد عبد الله محمود"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    اسم المستخدم بالإنجليزية (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ahmed_ali"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600 dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    كلمة المرور *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="كلمة مرور للدخول"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600 dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    الرتبة الصحفية / الدور التحريري
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as EditorialRole)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600 cursor-pointer"
                  >
                    <option value="student_editor">محرر صحفي طلابي (صياغة وإرسال للتدقيق)</option>
                    <option value="section_head">رئيس قسم التحرير (مراجعة أولى)</option>
                    <option value="proofreader">مدقق ومراجع لغوي (تدقيق نحوي وصحفي)</option>
                    <option value="managing_editor">مدير التحرير (صلاحية النشر والجدولة)</option>
                    <option value="editor_in_chief">رئيس التحرير (صلاحيات شاملة)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="name@mti.edu.eg"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600 dir-ltr text-right"
                    />
                    <Mail className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    كود الطالب / رقم القيد (اختياري)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="مثال: 20220194"
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600 dir-ltr text-right"
                    />
                    <FileBadge className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    نبذة تعريفية سريعة (Bio)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: طالب بقسم الصحافة مهتم بالتحقيقات"
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>إتمام التسجيل والدخول المباشر إلى لوحة التحرير</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
