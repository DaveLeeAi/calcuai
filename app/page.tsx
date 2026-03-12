import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllCategories, getAllGlossaryTerms, getAllMethodologyTopics, getAllSpecs } from '@/lib/content-loader';
import { buildSearchItems } from '@/lib/search-index';
import type { CategoryDefinition } from '@/lib/types';
import SearchBar from '@/components/ui/SearchBar';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Free Online Calculators — ${siteConfig.name}`,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: `Free Online Calculators — ${siteConfig.name}`,
    description: siteConfig.description,
    url: siteConfig.url,
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Free Online Calculators — ${siteConfig.name}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

const POPULAR_CALCULATORS = [
  { title: 'Mortgage Calculator', href: '/finance/mortgage-calculator' },
  { title: 'BMI Calculator', href: '/health/bmi-calculator' },
  { title: 'Percentage Calculator', href: '/math/percentage-calculator' },
  { title: 'Age Calculator', href: '/everyday/age-calculator' },
  { title: 'Compound Interest Calculator', href: '/finance/compound-interest-calculator' },
  { title: 'Calorie Calculator', href: '/health/calorie-calculator' },
  { title: 'Loan Calculator', href: '/finance/loan-calculator' },
  { title: 'GPA Calculator', href: '/everyday/gpa-calculator' },
  { title: 'Tip Calculator', href: '/everyday/tip-calculator' },
  { title: 'Date Calculator', href: '/everyday/date-calculator' },
  { title: 'Margin Calculator', href: '/business/margin-calculator' },
  { title: 'Concrete Calculator', href: '/construction/concrete-calculator' },
  { title: 'Standard Deviation Calculator', href: '/math/standard-deviation-calculator' },
  { title: 'Salary Calculator', href: '/finance/salary-calculator' },
  { title: 'ROI Calculator', href: '/business/roi-calculator' },
];

/** Count all unique calculators across subcategories + featured list */
function getTotalCalculatorCount(cat: CategoryDefinition): number {
  const slugs = new Set<string>();
  for (const sub of cat.subcategories) {
    for (const calc of sub.calculators) {
      slugs.add(calc);
    }
  }
  for (const calc of cat.featuredCalculators) {
    slugs.add(calc);
  }
  return slugs.size;
}

export default function HomePage() {
  const categories = getAllCategories();
  const searchItems = buildSearchItems();
  const glossaryTerms = getAllGlossaryTerms();
  const methodologyTopics = getAllMethodologyTopics();
  const allSpecs = getAllSpecs();

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-12 sm:py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Free Online Calculators
        </h1>
        <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
          Accurate, fast, and free calculators for finance, health, math, construction, and more. No signup required.
        </p>
        <div className="max-w-xl mx-auto">
          <SearchBar items={searchItems} />
        </div>
      </section>

      {/* Category Grid */}
      <section className="mb-16">
        <h2 className="section-heading text-center mb-8">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/${cat.slug}`} className="category-card group">
              <Image
                src={`/icons/${cat.slug}.svg`}
                alt=""
                width={32}
                height={32}
                className="mb-3"
              />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
              <p className="text-xs text-brand-500 mt-3 font-medium">
                {getTotalCalculatorCount(cat)} calculators &rarr;
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Calculators */}
      <section className="mb-16">
        <h2 className="section-heading text-center mb-8">Popular Calculators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-content mx-auto">
          {POPULAR_CALCULATORS.map((calc) => (
            <Link key={calc.href} href={calc.href} className="related-calc-link text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300">
              {calc.title}
            </Link>
          ))}
        </div>
      </section>

      {/* Methodology Deep-Dives */}
      {methodologyTopics.length > 0 && (
        <section className="mb-16">
          <h2 className="section-heading text-center mb-4">Understand the Math</h2>
          <p className="text-center text-gray-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Deep-dives into the formulas, derivations, and assumptions behind our calculators.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-content mx-auto">
            {methodologyTopics.map((topic) => {
              const relatedNames = topic.relatedCalculators
                .slice(0, 3)
                .map((id) => allSpecs.find((s) => s.id === id)?.title)
                .filter(Boolean);
              return (
                <Link
                  key={topic.slug}
                  href={`/methodology/${topic.slug}`}
                  className="category-card group"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                    {topic.title}
                  </h3>
                  {relatedNames.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-1">
                      Used by: {relatedNames.join(', ')}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-4">
            <Link href="/methodology" className="text-sm text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 font-medium">
              View all methodology articles &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* Glossary */}
      {glossaryTerms.length > 0 && (
        <section className="mb-16">
          <h2 className="section-heading text-center mb-4">Glossary</h2>
          <p className="text-center text-gray-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Clear definitions of key terms used across our calculators.
          </p>
          <div className="flex flex-wrap gap-2 justify-center max-w-content mx-auto">
            {glossaryTerms
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((term) => (
                <Link
                  key={term.slug}
                  href={`/glossary/${term.slug}`}
                  className="inline-flex items-center rounded-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:border-brand-200 dark:hover:border-brand-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                >
                  {term.title}
                </Link>
              ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/glossary" className="text-sm text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 font-medium">
              Browse full glossary &rarr;
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
