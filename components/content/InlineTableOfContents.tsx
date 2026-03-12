'use client';

import { useState, useEffect, useCallback } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface InlineTableOfContentsProps {
  containerSelector?: string;
}

/**
 * Inline Table of Contents — renders as a simple list at the top of the article.
 * Desktop/tablet: always visible, scrolls with content (NOT sticky).
 * Mobile: collapsible with toggle.
 */
export default function InlineTableOfContents({
  containerSelector = 'article',
}: InlineTableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Small delay to let MDX content render
    const timer = setTimeout(() => {
      const container = document.querySelector(containerSelector);
      if (!container) return;

      const elements = container.querySelectorAll('h2, h3');
      const items: TocItem[] = [];

      elements.forEach((el) => {
        if (!el.id) {
          el.id =
            el.textContent
              ?.toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '') || `heading-${items.length}`;
        }
        items.push({
          id: el.id,
          text: el.textContent || '',
          level: el.tagName === 'H2' ? 2 : 3,
        });
      });

      setHeadings(items);
    }, 100);

    return () => clearTimeout(timer);
  }, [containerSelector]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    },
    []
  );

  // Only show H2s in the inline TOC (keep it compact)
  const h2Headings = headings.filter((h) => h.level === 2);

  if (h2Headings.length < 3) return null;

  return (
    <nav
      className="mb-8 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/60 px-5 py-4"
      aria-label="Table of contents"
    >
      {/* Mobile: collapsible toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between md:hidden"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
          Table of Contents
        </span>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Desktop: always visible label */}
      <p className="hidden md:block mb-3 text-sm font-semibold text-gray-700 dark:text-slate-300">
        Table of Contents
      </p>

      {/* Links list — always visible on md+, toggleable on mobile */}
      <ul
        className={`space-y-1.5 ${isOpen ? 'mt-3' : 'hidden'} md:block`}
      >
        {h2Headings.map((h) => (
          <li key={h.id} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400 dark:bg-slate-500" />
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className="text-sm text-gray-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors leading-snug"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
