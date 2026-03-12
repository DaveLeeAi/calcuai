import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllMethodologyTopics, getAllSpecs } from '@/lib/content-loader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Methodology — Formula Deep-Dives | ${siteConfig.name}`,
  description:
    'Explore the math behind our calculators. Derivations, formula comparisons, assumptions, and authoritative sources for every calculation.',
  alternates: { canonical: `${siteConfig.url}/methodology` },
  openGraph: {
    title: `Methodology — Formula Deep-Dives | ${siteConfig.name}`,
    description:
      'Explore the math behind our calculators. Derivations, formula comparisons, assumptions, and authoritative sources for every calculation.',
    url: `${siteConfig.url}/methodology`,
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Methodology — Formula Deep-Dives | ${siteConfig.name}`,
    description:
      'Explore the math behind our calculators. Derivations, formula comparisons, assumptions, and authoritative sources for every calculation.',
  },
  robots: { index: true, follow: true },
};

export default function MethodologyIndexPage() {
  const topics = getAllMethodologyTopics();
  const allSpecs = getAllSpecs();

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Methodology — Formula Deep-Dives',
    description:
      'Explore the math behind our calculators. Derivations, formula comparisons, assumptions, and authoritative sources.',
    url: `${siteConfig.url}/methodology`,
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
      <JsonLd data={webPageSchema} id="schema-collection" />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Methodology' },
        ]}
      />

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-4">
        Methodology
      </h1>

      <p className="text-lg text-gray-600 mb-8 max-w-3xl">
        Deep-dives into the formulas, derivations, and assumptions behind our
        calculators. Each article explains not just <em>what</em> the formula
        is, but <em>why</em> it works, where it breaks down, and how different
        approaches compare.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {topics.map((topic) => {
          // Resolve related calculator titles for display
          const relatedCalcNames = topic.relatedCalculators
            .map((id) => {
              const spec = allSpecs.find((s) => s.id === id);
              return spec?.title;
            })
            .filter(Boolean);

          return (
            <Link
              key={topic.slug}
              href={`/methodology/${topic.slug}`}
              className="category-card group"
            >
              <h2 className="font-semibold text-lg text-gray-900 group-hover:text-brand-500 transition-colors mb-2">
                {topic.title}
              </h2>
              {relatedCalcNames.length > 0 && (
                <p className="text-sm text-gray-500">
                  Used by: {relatedCalcNames.join(', ')}
                </p>
              )}
              <p className="text-xs text-brand-500 mt-3 font-medium">
                Read deep-dive &rarr;
              </p>
            </Link>
          );
        })}
      </div>

      {topics.length === 0 && (
        <p className="text-gray-500">
          Methodology articles are coming soon.
        </p>
      )}
    </div>
  );
}
