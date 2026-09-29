import React from 'react';

/**
 * Strips HTML formatting tags for clean text reading (used by TTS, excerpt previews, etc.)
 */
export function stripHtmlTags(str: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

/**
 * Converts array of paragraphs or stored article.content to an HTML string for WYSIWYG editing,
 * ensuring each paragraph or heading remains distinct without merging.
 */
export function articleContentToHtml(content: string[] | string): string {
  if (!content) return '';
  if (Array.isArray(content)) {
    return content
      .map((p) => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        // If already starts with a block tag like <h2>, <h3>, <p>, <blockquote>, <ul>, <ol>
        if (/^<(p|h1|h2|h3|h4|blockquote|ul|ol|div)[\s>]/i.test(trimmed)) {
          return trimmed;
        }
        return `<p>${trimmed}</p>`;
      })
      .filter(Boolean)
      .join('\n');
  }

  const str = content.trim();
  if (/^<(p|h1|h2|h3|h4|blockquote|ul|ol|div)[\s>]/i.test(str)) {
    return str;
  }
  // If plain text with newlines
  return str
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}

/**
 * Splits HTML from rich editor into clean individual paragraphs / block sections for article.content array,
 * preserving all headings (h2, h3), quotes, lists, and paragraphs as independent elements.
 */
export function htmlToArticleParagraphs(html: string): string[] {
  if (!html || !html.trim()) return [];

  const trimmed = html.trim();

  // If text is purely plain without HTML tags, split by double newlines or single newlines
  if (!/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  // Parse using browser DOMParser to accurately extract block level elements without merging
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${trimmed}</div>`, 'text/html');
      const container = doc.body.firstElementChild || doc.body;

      const paragraphs: string[] = [];

      Array.from(container.childNodes).forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const outer = el.outerHTML.trim();
          const textOnly = el.textContent?.trim() || '';
          if (textOnly || el.querySelector('img, hr, br')) {
            paragraphs.push(outer);
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) {
            paragraphs.push(`<p>${text}</p>`);
          }
        }
      });

      if (paragraphs.length > 0) {
        return paragraphs;
      }
    } catch {
      // Fallback below
    }
  }

  // Regex fallback: split by top-level block boundaries
  const blocks = trimmed
    .split(/(?=<(?:p|h[1-6]|blockquote|ul|ol)[\s>])/i)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  return blocks.length > 0 ? blocks : [trimmed];
}

/**
 * Sanitizes and renders safe HTML tags for paragraphs / headings in reader and inspector views.
 */
export const FormattedArticleContent: React.FC<{
  paragraph: string;
  className?: string;
}> = ({ paragraph, className = '' }) => {
  if (!paragraph) return null;

  let content = paragraph;
  if (content.includes('&lt;') && content.includes('&gt;')) {
    content = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  const hasHtml = /<[a-z][\s\S]*>/i.test(content);

  if (!hasHtml) {
    return <p className={`mb-4 leading-relaxed ${className}`}>{content}</p>;
  }

  const safeHtml = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');

  return (
    <div
      className={`prose-content mb-4 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
};



