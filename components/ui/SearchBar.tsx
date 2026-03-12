'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Fuse, { type IFuseOptions } from 'fuse.js';
import type { SearchItem } from '@/lib/search-types';
import { CATEGORY_LABELS } from '@/lib/search-types';

interface SearchBarProps {
  items: SearchItem[];
  placeholder?: string;
  autoFocus?: boolean;
}

const FUSE_OPTIONS: IFuseOptions<SearchItem> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'primaryKeyword', weight: 0.3 },
    { name: 'category', weight: 0.1 },
    { name: 'subcategory', weight: 0.1 },
    { name: 'metaDescription', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
};

export default function SearchBar({
  items,
  placeholder = 'Search calculators...',
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items]);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    return fuse.search(query, { limit: 8 }).map((r) => r.item);
  }, [fuse, query]);

  const showDropdown = isOpen && query.length >= 2;

  const navigateTo = useCallback(
    (href: string) => {
      setIsOpen(false);
      setQuery('');
      router.push(href);
    },
    [router],
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      clearSearch();
      return;
    }

    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        navigateTo(results[activeIndex].href);
      } else if (results.length > 0) {
        navigateTo(results[0].href);
      }
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="input-field text-lg pl-12 pr-10 py-3 w-full"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-results"
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          autoComplete="off"
        />
        {query.length > 0 && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Clear search"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <ul
          id="search-results"
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg max-h-[400px] overflow-y-auto"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-gray-500 dark:text-slate-400 text-sm">
              No results found for &ldquo;{query}&rdquo;
            </li>
          ) : (
            results.map((item, i) => (
              <li
                key={item.slug}
                id={`search-result-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-slate-700 last:border-0 transition-colors ${
                  i === activeIndex ? 'bg-brand-50 dark:bg-brand-900/30' : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => navigateTo(item.href)}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-gray-900 dark:text-white truncate">{item.title}</span>
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                    item.itemType === 'glossary'
                      ? 'bg-amber-100 text-amber-700'
                      : item.itemType === 'methodology'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-brand-100 text-brand-600'
                  }`}>
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{item.metaDescription}</p>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
