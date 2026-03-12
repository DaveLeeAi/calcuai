'use client';

import Link from 'next/link';
import { useState } from 'react';
import { siteConfig } from '@/lib/site-config';
import { ThemeToggle } from '@/components/ThemeToggle';

const CATEGORIES = [
  { name: 'Finance', slug: 'finance' },
  { name: 'Health', slug: 'health' },
  { name: 'Math', slug: 'math' },
  { name: 'Construction', slug: 'construction' },
  { name: 'Science', slug: 'science' },
  { name: 'Everyday', slug: 'everyday' },
  { name: 'Business', slug: 'business' },
  { name: 'Conversion', slug: 'conversion' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm dark:shadow-none">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
            {siteConfig.name}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/glossary"
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Glossary
            </Link>
            <Link
              href="/methodology"
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Methodology
            </Link>
            <div className="ml-2 border-l border-gray-200 dark:border-slate-600 pl-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden pb-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/glossary"
              className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Glossary
            </Link>
            <Link
              href="/methodology"
              className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Methodology
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
