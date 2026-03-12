'use client';

import Link from 'next/link';
import { useState } from 'react';
import { siteConfig } from '@/lib/site-config';

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
    <nav className="bg-brand-600 text-white sticky top-0 z-50">
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-xl tracking-tight">
            {siteConfig.name}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/glossary"
              className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Glossary
            </Link>
            <Link
              href="/methodology"
              className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Methodology
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
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

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden pb-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="block px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/glossary"
              className="block px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Glossary
            </Link>
            <Link
              href="/methodology"
              className="block px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
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
