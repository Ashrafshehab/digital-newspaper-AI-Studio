import React, { useState } from 'react';
import { Share2, Check, MessageCircle, Settings } from 'lucide-react';
import { Article, SocialMediaAccounts } from '../types/newspaper';

// Custom lightweight SVG Icons for Social Platforms
export const WhatsAppIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="none" />
    <path d="M9.5 9.5c.3-.6.6-.6.9-.6h.7c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.4.5c-.2.2-.2.4 0 .6.5.9 1.2 1.6 2.1 2.1.2.2.4.2.6 0l.5-.4c.2-.2.4-.2.7-.1l1.7.7c.3.1.4.3.4.5v.7c0 .3-.1.6-.6.9-.6.4-1.6.4-3.2-.4-1.9-1-3.3-2.5-4.3-4.3-.8-1.6-.8-2.6-.4-3.2z" />
  </svg>
);

export const XTwitterIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const FacebookIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const TelegramIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z" />
  </svg>
);

interface ArticleShareButtonsProps {
  article: Article;
  socialAccounts?: SocialMediaAccounts;
  layout?: 'compact' | 'expanded';
  className?: string;
  onOpenChannelsConfig?: () => void;
}

export const ArticleShareButtons: React.FC<ArticleShareButtonsProps> = ({
  article,
  socialAccounts,
  layout = 'compact',
  className = '',
  onOpenChannelsConfig
}) => {
  const [copied, setCopied] = useState(false);

  // Construct absolute URL for the article (fallback to current origin)
  const articleUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#article-${article.id}`
    : `https://mudigital.news/#article-${article.id}`;

  const shareText = `📰 ${article.title}\nصحيفة MUDigital`;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedText = encodeURIComponent(shareText);

  // Social Sharing Web Intent Links for Readers
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=MUDigital,صحافة_رقمية`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${article.title}\n${articleUrl}`);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenShare = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  if (layout === 'expanded') {
    return (
      <div className={`p-4 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
            <Share2 className="w-4 h-4 text-amber-600" />
            <span>نشر ومشاركة المادة الصحفية:</span>
          </div>
          <span className="text-[11px] text-stone-400">انقر للمشاركة المباشرة</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={(e) => handleOpenShare(e, whatsappUrl)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-xs hover:scale-102 cursor-pointer"
            title="مشاركة الخبر عبر واتساب"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white" />
            <span>واتساب (WhatsApp)</span>
          </button>

          {/* Twitter / X */}
          <button
            type="button"
            onClick={(e) => handleOpenShare(e, twitterUrl)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs hover:scale-102 cursor-pointer border border-stone-700"
            title="مشاركة الخبر على منصة إكس (تويتر)"
          >
            <XTwitterIcon className="w-4 h-4" />
            <span>منصة X (تويتر)</span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={(e) => handleOpenShare(e, facebookUrl)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all shadow-xs hover:scale-102 cursor-pointer"
            title="مشاركة الخبر على فيسبوك"
          >
            <FacebookIcon className="w-4 h-4" />
            <span>فيسبوك (Facebook)</span>
          </button>

          {/* Telegram */}
          <button
            type="button"
            onClick={(e) => handleOpenShare(e, telegramUrl)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#229ED9] hover:bg-[#1e8ec3] text-white text-xs font-bold transition-all shadow-xs hover:scale-102 cursor-pointer"
            title="مشاركة الخبر عبر تليجرام"
          >
            <TelegramIcon className="w-4 h-4" />
            <span>تليجرام (Telegram)</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
            title="نسخ رابط الخبر الحصري"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
            <span>{copied ? 'تم نسخ الرابط!' : 'نسخ الرابط'}</span>
          </button>
        </div>

        {/* Official Social Profile Links (if provided in dashboard or if editor shortcut is present) */}
        {((socialAccounts && (socialAccounts.facebook || socialAccounts.twitter || socialAccounts.whatsapp || socialAccounts.telegram)) || onOpenChannelsConfig) && (
          <div className="pt-2.5 border-t border-stone-200/70 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-stone-700 dark:text-stone-300">صفحات وقنوات صحيفة MUDigital الرسمية:</span>
              {socialAccounts?.facebook && (
                <a
                  href={socialAccounts.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[#1877F2] hover:underline font-medium inline-flex items-center gap-1"
                  title="صفحة صحيفة MUDigital على فيسبوك"
                >
                  <FacebookIcon className="w-3 h-3" />
                  <span>صفحة فيسبوك الرسمية</span>
                </a>
              )}
              {socialAccounts?.twitter && (
                <>
                  <span>·</span>
                  <a
                    href={socialAccounts.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-stone-800 dark:text-stone-200 hover:underline font-medium inline-flex items-center gap-1"
                    title="حساب صحيفة MUDigital على منصة X"
                  >
                    <XTwitterIcon className="w-3 h-3" />
                    <span>حساب منصة X الرسمي</span>
                  </a>
                </>
              )}
              {socialAccounts?.whatsapp && (
                <>
                  <span>·</span>
                  <a
                    href={socialAccounts.whatsapp.startsWith('http') ? socialAccounts.whatsapp : `https://wa.me/${socialAccounts.whatsapp.replace(/\+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#25D366] hover:underline font-medium inline-flex items-center gap-1"
                    title="قناة صحيفة MUDigital على واتساب"
                  >
                    <WhatsAppIcon className="w-3 h-3" />
                    <span>قناة واتساب الرسمية</span>
                  </a>
                </>
              )}
              {socialAccounts?.telegram && (
                <>
                  <span>·</span>
                  <a
                    href={socialAccounts.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#229ED9] hover:underline font-medium inline-flex items-center gap-1"
                    title="قناة صحيفة MUDigital على تليجرام"
                  >
                    <TelegramIcon className="w-3 h-3" />
                    <span>قناة تليجرام الرسمية</span>
                  </a>
                </>
              )}
            </div>

            {onOpenChannelsConfig && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChannelsConfig();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 hover:underline cursor-pointer bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/60 shrink-0"
                title="تعديل عناوين صفحات وقنوات MUDigital في لوحة التحكم"
              >
                <Settings className="w-3 h-3 text-amber-600" />
                <span>إدارة الروابط في لوحة التحكم</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Compact layout: small sleek pill buttons under cards
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`flex items-center gap-1.5 py-1 ${className}`}
    >
      <span className="text-[11px] text-stone-400 font-medium ml-1">مشاركة:</span>

      {/* WhatsApp */}
      <button
        type="button"
        onClick={(e) => handleOpenShare(e, whatsappUrl)}
        className="p-1.5 rounded-full text-stone-500 hover:text-white hover:bg-[#25D366] bg-stone-100 dark:bg-stone-800 hover:shadow-xs transition-all cursor-pointer"
        title="مشاركة عبر واتساب"
        aria-label="مشاركة عبر واتساب"
      >
        <WhatsAppIcon className="w-3.5 h-3.5" />
      </button>

      {/* Twitter / X */}
      <button
        type="button"
        onClick={(e) => handleOpenShare(e, twitterUrl)}
        className="p-1.5 rounded-full text-stone-500 hover:text-white hover:bg-black bg-stone-100 dark:bg-stone-800 hover:shadow-xs transition-all cursor-pointer"
        title="مشاركة عبر منصة X (تويتر)"
        aria-label="مشاركة عبر منصة X (تويتر)"
      >
        <XTwitterIcon className="w-3.5 h-3.5" />
      </button>

      {/* Facebook */}
      <button
        type="button"
        onClick={(e) => handleOpenShare(e, facebookUrl)}
        className="p-1.5 rounded-full text-stone-500 hover:text-white hover:bg-[#1877F2] bg-stone-100 dark:bg-stone-800 hover:shadow-xs transition-all cursor-pointer"
        title="مشاركة عبر فيسبوك"
        aria-label="مشاركة عبر فيسبوك"
      >
        <FacebookIcon className="w-3.5 h-3.5" />
      </button>

      {/* Telegram */}
      <button
        type="button"
        onClick={(e) => handleOpenShare(e, telegramUrl)}
        className="p-1.5 rounded-full text-stone-500 hover:text-white hover:bg-[#229ED9] bg-stone-100 dark:bg-stone-800 hover:shadow-xs transition-all cursor-pointer"
        title="مشاركة عبر تليجرام"
        aria-label="مشاركة عبر تليجرام"
      >
        <TelegramIcon className="w-3.5 h-3.5" />
      </button>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        className={`p-1.5 rounded-full transition-all cursor-pointer ${
          copied
            ? 'bg-emerald-600 text-white'
            : 'text-stone-500 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200'
        }`}
        title={copied ? 'تم نسخ الرابط!' : 'نسخ رابط المقال'}
        aria-label="نسخ رابط المقال"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
