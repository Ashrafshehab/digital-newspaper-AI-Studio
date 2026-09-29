import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Palette,
  Type,
  Highlighter,
  List,
  Quote,
  Sparkles,
  RemoveFormatting,
  Eye,
  Code
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (htmlValue: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'ابدأ بكتابة نص التحقيق الصحفي... يمكنك تظليل أي كلمة أو عنوان وتطبيق التنسيقات فورا',
  minHeight = '220px',
  maxHeight = '380px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [viewSource, setViewSource] = useState(false);
  const isInternalChangeRef = useRef(false);

  // Sync incoming value to contentEditable when not typing internally
  useEffect(() => {
    if (editorRef.current && !isInternalChangeRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChangeRef.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    isInternalChangeRef.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html);
  }, [onChange]);

  // Execute formatting command on selected text without losing selection or auto-formatting words
  const executeCmd = (command: string, arg: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    // Ensure we only apply if there is an active selection or cursor
    const selection = window.getSelection();
    if (!selection) return;

    document.execCommand(command, false, arg);
    handleInput();
  };

  // Apply Heading (H2 / H3) to the current line/block safely
  const applyHeading = (tag: 'h2' | 'h3') => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Check if current block is already that tag
    let parent = selection.anchorNode as HTMLElement | null;
    while (parent && parent !== editorRef.current) {
      if (parent.nodeName.toLowerCase() === tag) {
        // Toggle back to paragraph
        document.execCommand('formatBlock', false, '<p>');
        handleInput();
        return;
      }
      parent = parent.parentElement;
    }

    document.execCommand('formatBlock', false, `<${tag}>`);
    handleInput();
  };

  // Custom text colors
  const colors = [
    { label: 'عنبري دافئ', color: '#b45309' },
    { label: 'أزرق صحفي', color: '#0369a1' },
    { label: 'أخضر موثق', color: '#047857' },
    { label: 'أحمر عاجل', color: '#be123c' },
    { label: 'بنفسجي ثقافي', color: '#7e22ce' },
    { label: 'رمادي داكن', color: '#374151' }
  ];

  const applyColor = (hex: string) => {
    executeCmd('foreColor', hex);
    setShowColorMenu(false);
  };

  // Font sizes: 1 to 7 in document.execCommand
  const sizes = [
    { label: 'كبير جداً (عنوان)', size: '6' },
    { label: 'كبير (فرعي)', size: '5' },
    { label: 'متوسط بارز', size: '4' },
    { label: 'عادي (افتراضي)', size: '3' },
    { label: 'صغير توضيحي', size: '2' }
  ];

  const applySize = (sizeVal: string) => {
    executeCmd('fontSize', sizeVal);
    setShowSizeMenu(false);
  };

  const applyHighlight = () => {
    executeCmd('hiliteColor', '#fde68a'); // soft warm amber highlight
  };

  const applyQuote = () => {
    executeCmd('formatBlock', '<blockquote>');
  };

  const clearFormatting = () => {
    executeCmd('removeFormat');
    executeCmd('formatBlock', '<p>');
  };

  // Safe paste handler: preserves separate paragraphs and headings without auto-applying random inline styles
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const textData = clipboardData.getData('text/plain');

    if (htmlData) {
      // Clean HTML: preserve semantic tags (h1-h6, p, blockquote, ul, ol, li, strong, em, b, i, u)
      // and strip foreign inline messy font tags/styles that cause accidental formatting
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlData, 'text/html');

        // Remove dangerous or foreign styles
        doc.querySelectorAll('*').forEach((el) => {
          // Keep safe semantic tags, remove messy style attributes from external sites
          if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'STRONG', 'B', 'EM', 'I', 'U'].includes(el.tagName)) {
            // Keep clean
            el.removeAttribute('style');
            el.removeAttribute('class');
          }
        });

        // Convert H1 to H2 for editorial hierarchy
        doc.querySelectorAll('h1').forEach((h1) => {
          const h2 = doc.createElement('h2');
          h2.innerHTML = h1.innerHTML;
          h1.parentNode?.replaceChild(h2, h1);
        });

        const cleanHtml = doc.body.innerHTML;
        if (cleanHtml && cleanHtml.trim()) {
          document.execCommand('insertHTML', false, cleanHtml);
          handleInput();
          return;
        }
      } catch {
        // Fallback to text parsing
      }
    }

    // If plain text pasted: split paragraphs by double newline and insert as separate <p> tags
    if (textData) {
      const paragraphs = textData
        .split(/\r?\n\r?\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      if (paragraphs.length > 1) {
        const formattedHtml = paragraphs
          .map((p) => `<p>${p.replace(/\r?\n/g, '<br/>')}</p>`)
          .join('');
        document.execCommand('insertHTML', false, formattedHtml);
      } else {
        // Single paragraph or line
        const single = textData.replace(/\r?\n/g, '<br/>');
        document.execCommand('insertHTML', false, `<p>${single}</p>`);
      }
      handleInput();
    }
  };

  return (
    <div className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 shadow-2xs transition-all focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 relative flex flex-col">
      {/* Visual Formatting Toolbar - Sticky pinned at top of view during page or modal scroll */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-1 p-2 bg-stone-100/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 text-xs select-none shadow-sm rounded-t-lg">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 ml-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>تنسيق النص الحي:</span>
          </span>

          {/* Bold */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCmd('bold');
            }}
            className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold cursor-pointer transition-colors"
            title="عريض (Bold) - يظهر فوراً بخط عريض"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCmd('italic');
            }}
            className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors"
            title="مائل (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCmd('underline');
            }}
            className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors"
            title="تسطير (Underline)"
          >
            <Underline className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

          {/* Heading 2 */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyHeading('h2');
            }}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold cursor-pointer transition-colors text-[11px]"
            title="عنوان جانبي رئيسي كبير (H2)"
          >
            <Heading2 className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            <span>عنوان رئيسي</span>
          </button>

          {/* Heading 3 */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyHeading('h3');
            }}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-amber-800 dark:text-amber-400 font-bold cursor-pointer transition-colors text-[11px]"
            title="عنوان جانبي فرعي (H3)"
          >
            <Heading3 className="w-4 h-4 text-amber-600" />
            <span>عنوان فرعي</span>
          </button>

          <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

          {/* Color Palette Menu */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowColorMenu(!showColorMenu);
                setShowSizeMenu(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors text-[11px] font-semibold"
              title="تلوين الكلمات والعناوين فورياً"
            >
              <Palette className="w-3.5 h-3.5 text-amber-600" />
              <span>لون النص</span>
            </button>

            {showColorMenu && (
              <div className="absolute top-full right-0 mt-1 z-30 w-44 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg shadow-xl py-1">
                {colors.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyColor(c.color);
                    }}
                    className="w-full text-right px-3 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 flex items-center gap-2 cursor-pointer"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/20"
                      style={{ backgroundColor: c.color }}
                    />
                    <span style={{ color: c.color }} className="font-bold">
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size Menu */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowSizeMenu(!showSizeMenu);
                setShowColorMenu(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors text-[11px] font-semibold"
              title="تغيير وتكبير حجم الخط"
            >
              <Type className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
              <span>حجم الخط</span>
            </button>

            {showSizeMenu && (
              <div className="absolute top-full right-0 mt-1 z-30 w-48 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg shadow-xl py-1">
                {sizes.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applySize(s.size);
                    }}
                    className="w-full text-right px-3 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs text-stone-800 dark:text-stone-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

          {/* Highlight Marker */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyHighlight();
            }}
            className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors"
            title="تظليل النص باللون الأصفر الدافئ"
          >
            <Highlighter className="w-4 h-4 text-amber-600" />
          </button>

          {/* Bullet List */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCmd('insertUnorderedList');
            }}
            className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors"
            title="قائمة نقطية"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Quote */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyQuote();
            }}
            className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer transition-colors"
            title="اقتباس صحفي مميز"
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              clearFormatting();
            }}
            className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer transition-colors"
            title="إزالة التنسيق والعودة لنص عادي"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle HTML view */}
        <button
          type="button"
          onClick={() => setViewSource(!viewSource)}
          className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer transition-colors text-[11px] flex items-center gap-1 font-mono"
          title={viewSource ? 'العودة للمحرر المرئي (WYSIWYG)' : 'عرض كود HTML'}
        >
          {viewSource ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{viewSource ? 'محرر مرئي' : 'HTML'}</span>
        </button>
      </div>

      {/* Editor Content Area with Dedicated Vertical Scrollbar (مسطرة رأسية ثابتة) */}
      {viewSource ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          style={{ minHeight, maxHeight }}
          className="editor-scroll-area w-full p-4 font-mono text-xs bg-stone-900 text-emerald-400 focus:outline-hidden leading-relaxed resize-none overflow-y-auto rounded-b-lg"
          dir="ltr"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleInput}
          onPaste={handlePaste}
          data-placeholder={placeholder}
          style={{ minHeight, maxHeight }}
          className="rich-text-content editor-scroll-area w-full p-4 text-sm sm:text-base leading-relaxed text-stone-900 dark:text-stone-100 font-body bg-white dark:bg-stone-850 focus:outline-hidden overflow-y-scroll cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-stone-400 empty:before:pointer-events-none rounded-b-lg"
        />
      )}
    </div>
  );
};
