'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  /** CSS selector scope to search for headings (default: 'article') */
  containerSelector?: string;
}

/**
 * Auto-generates a Table of Contents from H2/H3 headings in the article.
 * - Desktop: sticky sidebar, highlights current section on scroll
 * - Mobile: collapsible accordion at top of article
 * - Shows reading progress bar at the top
 */
export default function TableOfContents({
  containerSelector = 'article',
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Parse headings from the DOM after mount
  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const elements = container.querySelectorAll('h2, h3');
    const items: TocItem[] = [];

    elements.forEach((el) => {
      // Generate ID if missing
      if (!el.id) {
        el.id = el.textContent
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
  }, [containerSelector]);

  // Track active section with IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    // Clean up previous observer
    observerRef.current?.disconnect();

    const callback: IntersectionObserverCallback = (entries) => {
      // Find the topmost visible heading
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        setActiveId(visible[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      // Offset for sticky navbar (56px) + some breathing room
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    });

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(100, Math.round((scrollTop / docHeight) * 100)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        // Offset for sticky navbar
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
        setActiveId(id);
        setMobileOpen(false);
      }
    },
    []
  );

  if (headings.length < 3) return null; // Don't render TOC for very short articles

  return (
    <>
      {/* ── Reading progress bar (fixed at top) ── */}
      <div
        className="fixed top-14 left-0 right-0 z-40 h-0.5 bg-gray-200 dark:bg-slate-700"
        aria-hidden="true"
      >
        <div
          className="h-full bg-brand-500 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Mobile/tablet: collapsible accordion (below 1280px) ── */}
      <div className="xl:hidden mb-6">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 shadow-sm"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Table of Contents
          </span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {mobileOpen && (
          <nav
            className="mt-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm"
            aria-label="Table of contents"
          >
            <ul className="space-y-1">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    onClick={(e) => handleClick(e, h.id)}
                    className={`block rounded px-3 py-1.5 text-sm transition-colors ${
                      h.level === 3 ? 'pl-6' : ''
                    } ${
                      activeId === h.id
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-medium'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* ── Desktop: sticky sidebar (1280px+) ── */}
      <nav
        className="hidden xl:block sticky top-20 self-start max-w-[200px] max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain"
        aria-label="Table of contents"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
          On this page
        </p>
        <ul className="space-y-0.5 border-l-2 border-gray-100 dark:border-slate-700">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                className={`block border-l-2 -ml-[2px] py-1.5 text-[13px] leading-snug transition-colors ${
                  h.level === 3 ? 'pl-6' : 'pl-4'
                } ${
                  activeId === h.id
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-medium'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
