'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Fuse, { type IFuseOptions } from 'fuse.js';
import type { SearchItem } from '@/lib/search-types';
import { CATEGORY_LABELS } from '@/lib/search-types';
import SearchBar from '@/components/ui/SearchBar';

interface SearchResultsProps {
  items: SearchItem[];
  initialQuery: string;
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

export default function SearchResults({ items, initialQuery }: SearchResultsProps) {
  const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items]);

  const results = useMemo(() => {
    if (initialQuery.length < 2) return [];
    return fuse.search(initialQuery, { limit: 20 }).map((r) => r.item);
  }, [fuse, initialQuery]);

  return (
    <div>
      <div className="mb-8">
        <SearchBar items={items} placeholder="Search calculators..." autoFocus />
      </div>

      {initialQuery.length < 2 ? (
        <p className="text-gray-500 dark:text-slate-400">Type at least 2 characters to search.</p>
      ) : results.length === 0 ? (
        <p className="text-gray-500 dark:text-slate-400">
          No results found for &ldquo;{initialQuery}&rdquo;. Try a different search term.
        </p>
      ) : (
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{initialQuery}&rdquo;
          </p>
          <div className="space-y-3">
            {results.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                className="block bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500 transition-all"
              >
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white text-lg">{item.title}</h2>
                  <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                    {CATEGORY_LABELS[item.category]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2">{item.metaDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
