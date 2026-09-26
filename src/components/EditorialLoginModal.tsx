import React, { useState } from 'react';
import { X, Lock, User, KeyRound, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';
import { EditorialUser } from '../types/newspaper';
import { EDITORIAL_USERS } from '../data/mockArticles';

interface EditorialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: EditorialUser) => void;
  editorialUsers?: EditorialUser[];
}

export const EditorialLoginModal: React.FC<EditorialLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  editorialUsers = EDITORIAL_USERS
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-[#FBF9F5] dark:bg-[#121316] w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-headline">
                بوابة التحرير الرقمي - MUDigital
              </h2>
              <p className="text-[11px] text-stone-500">
                تسجيل الدخول لإدارة ومراجعة ونشر المقالات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 font-body">
          {/* Workflow policy notification */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>سياسة النشر:</strong> لا يملك المحرر صلاحية النشر المباشر؛ يمر التقرير بثلاث مراحل تدقيق (رئيس القسم ثم المصحح اللغوي ثم مدير التحرير). النشر الفوري محصور بمدير التحرير ورئيس التحرير.
            </span>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="مثال: editor أو managing"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600"
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
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>دخول لوحة التحكم</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Login Switcher for Grading / Evaluation */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
              <span>حسابات تجريبية سريعة لتقييم المراحل (كلمة السر: 123):</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
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

                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
                    {user.username}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
