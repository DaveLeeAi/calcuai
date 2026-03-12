import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import {
  getAllGlossaryTerms,
  getGlossaryTerm,
  getAllSpecs,
} from '@/lib/content-loader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { RelatedResources } from '@/components/content/RelatedResources';
import { getMethodologyForGlossaryTerm } from '@/lib/content-linker';
import type { CalculatorSpec } from '@/lib/types';
import { siteConfig } from '@/lib/site-config';

// ═══════════════════════════════════════════════════════
// Static params
// ═══════════════════════════════════════════════════════

interface Props {
  params: { term: string };
}

export function generateStaticParams() {
  const terms = getAllGlossaryTerms();
  return terms.map((term) => ({ term: term.slug }));
}

// ═══════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════

export function generateMetadata({ params }: Props): Metadata {
  const termData = getGlossaryTerm(params.term);
  if (!termData) return {};

  const { frontmatter } = termData;
  const title = `${frontmatter.title} — Definition & Calculator | ${siteConfig.name}`;
  const description = `What is ${frontmatter.title}? Clear definition with examples, plus links to ${frontmatter.relatedCalculators.length} related calculators.`;
  const canonical = `${siteConfig.url}/glossary/${frontmatter.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: siteConfig.name,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

// ═══════════════════════════════════════════════════════
// Resolve related calculator specs to links
// ═══════════════════════════════════════════════════════

function resolveRelatedCalculators(
  relatedIds: string[],
  allSpecs: CalculatorSpec[]
): { id: string; title: string; href: string }[] {
  return relatedIds
    .map((relId) => {
      const relSpec = allSpecs.find((s) => s.id === relId);
      if (!relSpec) return null;
      return {
        id: relId,
        title: relSpec.title,
        href: `/${relSpec.category}/${relSpec.slug}`,
      };
    })
    .filter((item): item is { id: string; title: string; href: string } => item !== null);
}

// ═══════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════

export default function GlossaryTermPage({ params }: Props) {
  const termData = getGlossaryTerm(params.term);
  if (!termData) notFound();

  const { frontmatter, content } = termData;
  const allSpecs = getAllSpecs();
  const relatedCalcs = resolveRelatedCalculators(
    frontmatter.relatedCalculators,
    allSpecs
  );
  const methodologyLinks = getMethodologyForGlossaryTerm(frontmatter);

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${frontmatter.title} — Definition`,
    description: `Clear definition of ${frontmatter.title} with examples and related calculators.`,
    url: `${siteConfig.url}/glossary/${frontmatter.slug}`,
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
    <article>
      <JsonLd data={webPageSchema} id="schema-webpage" />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Glossary', href: '/glossary' },
          { label: frontmatter.title },
        ]}
      />

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-6">
        {frontmatter.title}
      </h1>

      <div className="max-w-content mx-auto prose prose-gray dark:prose-invert prose-headings:scroll-mt-20 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4">
        <MDXRemote source={content} />
      </div>

      <RelatedResources
        calculators={relatedCalcs}
        methodologyTopics={methodologyLinks}
      />
    </article>
  );
}
