import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories, getAllSpecs, getAllGlossaryTerms, getAllMethodologyTopics } from '@/lib/content-loader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import type { CalculatorSpec } from '@/lib/types';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Sitemap — ${siteConfig.name}`,
  description: `Browse all calculators, glossary terms, and methodology pages on ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/sitemap-page` },
  robots: { index: false, follow: true },
};

export default function SitemapPage() {
  const categories = getAllCategories();
  const allSpecs = getAllSpecs();
  const glossaryTerms = getAllGlossaryTerms();
  const methodologyTopics = getAllMethodologyTopics();

  // Group specs by category
  const specsByCategory = new Map<string, CalculatorSpec[]>();
  for (const spec of allSpecs) {
    const existing = specsByCategory.get(spec.category) || [];
    existing.push(spec);
    specsByCategory.set(spec.category, existing);
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Sitemap',
    description: `Browse all calculators, glossary terms, and methodology pages on ${siteConfig.name}.`,
    url: `${siteConfig.url}/sitemap-page`,
  };

  return (
    <div>
      <JsonLd data={webPageSchema} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Sitemap' }]} />

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Sitemap</h1>

      {/* Calculators by Category */}
      {categories.map((cat) => {
        const specs = specsByCategory.get(cat.slug) || [];
        // Group by subcategory
        const subcatMap = new Map<string, CalculatorSpec[]>();
        const subcatNames = new Map<string, string>();
        for (const sub of cat.subcategories) {
          subcatNames.set(sub.slug, sub.name);
          for (const calcSlug of sub.calculators) {
            const spec = specs.find((s) => s.slug === calcSlug);
            if (spec) {
              const existing = subcatMap.get(sub.slug) || [];
              existing.push(spec);
              subcatMap.set(sub.slug, existing);
            }
          }
        }

        return (
          <section key={cat.slug} className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              <Link href={`/${cat.slug}`} className="hover:text-brand-500 transition-colors">
                {cat.name}
              </Link>
            </h2>
            {Array.from(subcatMap.entries()).map(([subSlug, subSpecs]) => (
              <div key={subSlug} className="mb-4 ml-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                  {subcatNames.get(subSlug) || subSlug}
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 ml-2">
                  {subSpecs.map((spec) => (
                    <li key={spec.slug}>
                      <Link
                        href={`/${spec.category}/${spec.slug}`}
                        className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                      >
                        {spec.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );
      })}

      {/* Glossary */}
      {glossaryTerms.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <Link href="/glossary" className="hover:text-brand-500 transition-colors">
              Glossary
            </Link>
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 ml-4">
            {glossaryTerms.map((term) => (
              <li key={term.slug}>
                <Link
                  href={`/glossary/${term.slug}`}
                  className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                >
                  {term.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Methodology */}
      {methodologyTopics.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Methodology</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 ml-4">
            {methodologyTopics.map((topic) => (
              <li key={topic.slug}>
                <Link
                  href={`/methodology/${topic.slug}`}
                  className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                >
                  {topic.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Other Pages */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Other Pages</h2>
        <ul className="flex flex-col gap-1 ml-4">
          <li>
            <Link href="/about" className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
              About {siteConfig.name}
            </Link>
          </li>
          <li>
            <Link href="/glossary" className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
              Glossary Index
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
