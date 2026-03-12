'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

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
 * Clean, minimal Table of Contents:
 * - Simple text links, no bold, no heavy styling
 * - 13px font, gray-500 color
 * - Active section highlighted with 2px blue left border
 * - Only top-level H2s shown by default; H3 subsections expand under the active H2
 * - Hidden completely on screens under 1280px
 */
export default function TableOfContents({
  containerSelector = 'article',
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Parse headings from the DOM after mount
  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const elements = container.querySelectorAll('h2, h3');
    const items: TocItem[] = [];

    elements.forEach((el) => {
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

    observerRef.current?.disconnect();

    const callback: IntersectionObserverCallback = (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        setActiveId(visible[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    });

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
        setActiveId(id);
      }
    },
    []
  );

  // Determine which H2 is currently active (for expanding its H3 children)
  const activeH2Id = useMemo(() => {
    if (!activeId) return '';
    const activeItem = headings.find((h) => h.id === activeId);
    if (activeItem?.level === 2) return activeId;
    // If active is an H3, find its parent H2
    const idx = headings.findIndex((h) => h.id === activeId);
    for (let i = idx - 1; i >= 0; i--) {
      if (headings[i].level === 2) return headings[i].id;
    }
    return '';
  }, [activeId, headings]);

  if (headings.length < 3) return null;

  // Hidden completely below 1280px — no mobile accordion
  return (
    <nav
      className="hidden xl:block sticky top-20 self-start max-w-[200px] max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain"
      aria-label="Table of contents"
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-gray-200 dark:border-slate-700">
        {headings.map((h, idx) => {
          const isActive = activeId === h.id;

          // H3s: only show if their parent H2 is the active H2
          if (h.level === 3) {
            let parentH2Id = '';
            for (let i = idx - 1; i >= 0; i--) {
              if (headings[i].level === 2) {
                parentH2Id = headings[i].id;
                break;
              }
            }
            if (parentH2Id !== activeH2Id) return null;
          }

          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                className={`block border-l-2 -ml-px py-1 text-[13px] leading-snug transition-colors ${
                  h.level === 3 ? 'pl-5' : 'pl-3'
                } ${
                  isActive
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
