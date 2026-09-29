import React, { useRef } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Type,
  Highlighter,
  List,
  Quote,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface RichTextToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  textareaRef,
  value,
  onChange,
  label = 'أدوات التنسيق الصحفي'
}) => {
  const [showColorMenu, setShowColorMenu] = React.useState(false);
  const [showSizeMenu, setShowSizeMenu] = React.useState(false);

  // Helper to wrap selected text or insert snippet
  const wrapSelection = (before: string, after: string, placeholder = 'نص العنوان أو الفقرة') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + (value ? '\n\n' : '') + before + placeholder + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToWrap = selectedText || placeholder;

    const replacement = `${before}${textToWrap}${after}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      const newCursorStart = start + before.length;
      const newCursorEnd = newCursorStart + textToWrap.length;
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }, 10);
  };

  const applyBold = () => wrapSelection('<strong>', '</strong>', 'عنوان عريض');
  const applyItalic = () => wrapSelection('<em>', '</em>', 'نص مائل');
  const applyHeadingH2 = () => wrapSelection('\n<h2 class="text-xl font-bold text-stone-900 dark:text-stone-100 my-3 font-headline">', '</h2>\n', 'عنوان جانبي رئيسي');
  const applyHeadingH3 = () => wrapSelection('\n<h3 class="text-lg font-bold text-amber-800 dark:text-amber-400 my-2 font-headline">', '</h3>\n', 'عنوان فرعي ملون');
  const applyHighlight = () => wrapSelection('<mark class="bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 px-1 py-0.5 rounded font-semibold">', '</mark>', 'نص مميز بعلامة');
  const applyQuote = () => wrapSelection('\n<blockquote class="p-3 my-3 border-r-4 border-amber-600 bg-amber-50/70 dark:bg-stone-850/80 rounded-l text-sm font-semibold italic text-stone-800 dark:text-stone-200">"', '"</blockquote>\n', 'اقتباس صحفي مميز');
  const applyBulletList = () => wrapSelection('\n<ul class="list-disc list-inside space-y-1 my-2 pr-2 font-medium">\n  <li>', '</li>\n</ul>\n', 'عنصر في قائمة نقطية');

  // Custom Colors
  const colors = [
    { label: 'عنبري دافئ', class: 'text-amber-700 dark:text-amber-400 font-bold', hex: '#b45309' },
    { label: 'أزرق صحفي', class: 'text-sky-700 dark:text-sky-400 font-bold', hex: '#0369a1' },
    { label: 'أخضر موثق', class: 'text-emerald-700 dark:text-emerald-400 font-bold', hex: '#047857' },
    { label: 'أحمر عاجل', class: 'text-rose-700 dark:text-rose-400 font-bold', hex: '#be123c' },
    { label: 'بنفسجي ثقافي', class: 'text-purple-700 dark:text-purple-400 font-bold', hex: '#7e22ce' }
  ];

  const applyColor = (colorClass: string) => {
    wrapSelection(`<span class="${colorClass}">`, '</span>', 'نص ملون');
    setShowColorMenu(false);
  };

  // Font Sizes
  const sizes = [
    { label: 'كبير جداً (XL)', class: 'text-xl font-bold font-headline' },
    { label: 'كبير (Large)', class: 'text-lg font-bold' },
    { label: 'متوسط بارز', class: 'text-base font-semibold' },
    { label: 'صغير توضيحي', class: 'text-xs text-stone-500' }
  ];

  const applySize = (sizeClass: string) => {
    wrapSelection(`<span class="${sizeClass}">`, '</span>', 'نص بحجم مخصص');
    setShowSizeMenu(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-stone-100 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-t-lg text-xs select-none">
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 ml-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>{label}:</span>
        </span>

        {/* Bold */}
        <button
          type="button"
          onClick={applyBold}
          className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold cursor-pointer transition-colors"
          title="عريض (Bold) - للكلمات والفقرات الهامة"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={applyItalic}
          className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors"
          title="مائل (Italic)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

        {/* Heading 2 */}
        <button
          type="button"
          onClick={applyHeadingH2}
          className="flex items-center gap-0.5 px-2 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold cursor-pointer transition-colors text-[11px]"
          title="عنوان جانبي رئيسي كبير (H2)"
        >
          <Heading1 className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
          <span>عنوان رئيسي</span>
        </button>

        {/* Heading 3 */}
        <button
          type="button"
          onClick={applyHeadingH3}
          className="flex items-center gap-0.5 px-2 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-amber-800 dark:text-amber-400 font-bold cursor-pointer transition-colors text-[11px]"
          title="عنوان جانبي فرعي ملون (H3)"
        >
          <Heading2 className="w-3.5 h-3.5 text-amber-600" />
          <span>عنوان فرعي</span>
        </button>

        <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

        {/* Font Size Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowSizeMenu(!showSizeMenu);
              setShowColorMenu(false);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors text-[11px] font-semibold"
            title="تكبير أو تغيير حجم الخط"
          >
            <Type className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
            <span>حجم الخط</span>
          </button>

          {showSizeMenu && (
            <div className="absolute top-full right-0 mt-1 z-20 w-44 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg shadow-lg py-1 animate-fadeIn">
              {sizes.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applySize(s.class)}
                  className="w-full text-right px-3 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 flex items-center justify-between cursor-pointer"
                >
                  <span className={s.class}>{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Palette Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowColorMenu(!showColorMenu);
              setShowSizeMenu(false);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors text-[11px] font-semibold"
            title="تلوين العناوين والكلمات"
          >
            <Palette className="w-3.5 h-3.5 text-amber-600" />
            <span>لون النص</span>
          </button>

          {showColorMenu && (
            <div className="absolute top-full right-0 mt-1 z-20 w-40 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg shadow-lg py-1 animate-fadeIn">
              {colors.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyColor(c.class)}
                  className="w-full text-right px-3 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 flex items-center gap-2 cursor-pointer"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-black/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

        {/* Highlight Marker */}
        <button
          type="button"
          onClick={applyHighlight}
          className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors"
          title="تظليل النص (Highlight)"
        >
          <Highlighter className="w-3.5 h-3.5 text-amber-600" />
        </button>

        {/* Editorial Quote */}
        <button
          type="button"
          onClick={applyQuote}
          className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors"
          title="اقتباس صحفي مميز"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        {/* Bullet List */}
        <button
          type="button"
          onClick={applyBulletList}
          className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors"
          title="قائمة نقاط فرعية"
        >
          <List className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-[10px] text-stone-500 hidden sm:flex items-center gap-1 font-mono">
        <HelpCircle className="w-3 h-3 text-stone-400" />
        <span>ظلل الكلمة واضغط للتنسيق</span>
      </div>
    </div>
  );
};
