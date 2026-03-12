import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGlossaryTerms } from '@/lib/content-loader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Calculator Glossary — Definitions & Terms | ${siteConfig.name}`,
  description:
    'Clear definitions of financial, mathematical, health, and construction terms used across our calculators.',
  alternates: { canonical: `${siteConfig.url}/glossary` },
  openGraph: {
    title: `Calculator Glossary — Definitions & Terms | ${siteConfig.name}`,
    description:
      'Clear definitions of financial, mathematical, health, and construction terms used across our calculators.',
    url: `${siteConfig.url}/glossary`,
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Calculator Glossary — Definitions & Terms | ${siteConfig.name}`,
    description:
      'Clear definitions of financial, mathematical, health, and construction terms used across our calculators.',
  },
  robots: { index: true, follow: true },
};

export default function GlossaryIndexPage() {
  const terms = getAllGlossaryTerms();

  // Group terms alphabetically
  const grouped: Record<string, typeof terms> = {};
  for (const term of terms) {
    const letter = term.title[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(term);
  }

  // Sort letters and terms within each letter
  const sortedLetters = Object.keys(grouped).sort();
  for (const letter of sortedLetters) {
    grouped[letter].sort((a, b) => a.title.localeCompare(b.title));
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Calculator Glossary',
    description:
      'Clear definitions of financial, mathematical, health, and construction terms used across our calculators.',
    url: `${siteConfig.url}/glossary`,
    author: {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: siteConfig.name,
    },
    isPartOf: { '@id': `${siteConfig.url}/#website` },
  };

  return (
    <div>
      <JsonLd data={webPageSchema} id="schema-webpage" />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Glossary' },
        ]}
      />

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-4">
        Calculator Glossary
      </h1>

      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8 max-w-3xl">
        Clear, concise definitions of financial, mathematical, health, and
        construction terms used across our calculators. Each term links to the
        calculators where it applies most.
      </p>

      {/* A-Z Jump Links */}
      <nav className="flex flex-wrap gap-2 mb-8" aria-label="Alphabet navigation">
        {sortedLetters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-700 transition-colors"
          >
            {letter}
          </a>
        ))}
      </nav>

      {/* Grouped Term Listing */}
      <div className="space-y-8">
        {sortedLetters.map((letter) => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4">
              {letter}
            </h2>
            <ul className="space-y-2">
              {grouped[letter].map((term) => (
                <li key={term.slug}>
                  <Link
                    href={`/glossary/${term.slug}`}
                    className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline font-medium"
                  >
                    {term.title}
                  </Link>
                  <span className="text-sm text-gray-500 dark:text-slate-500 ml-2">
                    — {term.relatedCalculators.length} calculator
                    {term.relatedCalculators.length !== 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
