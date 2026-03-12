import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  getAllMethodologyTopics,
  getMethodologyTopic,
  getAllSpecs,
} from '@/lib/content-loader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildTechArticleSchema } from '@/components/seo/MetaTags';
import { RelatedResources } from '@/components/content/RelatedResources';
import { getGlossaryForMethodologyTopic } from '@/lib/content-linker';
import type { CalculatorSpec } from '@/lib/types';
import { siteConfig } from '@/lib/site-config';

// ═══════════════════════════════════════════════════════
// Static params
// ═══════════════════════════════════════════════════════

interface Props {
  params: { topic: string };
}

export function generateStaticParams() {
  const topics = getAllMethodologyTopics();
  return topics.map((topic) => ({ topic: topic.slug }));
}

// ═══════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════

export function generateMetadata({ params }: Props): Metadata {
  const topicData = getMethodologyTopic(params.topic);
  if (!topicData) return {};

  const { frontmatter } = topicData;
  const title = `How ${frontmatter.title.replace(/^How\s+/i, '')} — ${siteConfig.name}`;
  const description = `Deep-dive into the math behind ${frontmatter.title.toLowerCase().replace(/^how\s+/i, '')}. Derivations, formula comparisons, assumptions, limitations, and authoritative sources.`;
  const canonical = `${siteConfig.url}/methodology/${frontmatter.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
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

export default function MethodologyTopicPage({ params }: Props) {
  const topicData = getMethodologyTopic(params.topic);
  if (!topicData) notFound();

  const { frontmatter, content } = topicData;
  const allSpecs = getAllSpecs();
  const relatedCalcs = resolveRelatedCalculators(
    frontmatter.relatedCalculators,
    allSpecs
  );
  const glossaryLinks = getGlossaryForMethodologyTopic(frontmatter);

  const techArticleSchema = buildTechArticleSchema(
    frontmatter.title,
    `Deep-dive into the math behind ${frontmatter.title.toLowerCase().replace(/^how\s+/i, '')}.`,
    `${siteConfig.url}/methodology/${frontmatter.slug}`
  );

  return (
    <article>
      <JsonLd data={techArticleSchema} id="schema-article" />

      {/* KaTeX CSS for math formulas */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
        crossOrigin="anonymous"
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Methodology', href: '/methodology' },
          { label: frontmatter.title },
        ]}
      />

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-6">
        {frontmatter.title}
      </h1>

      <div className="max-w-content mx-auto prose prose-gray dark:prose-invert prose-headings:scroll-mt-20 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-table:text-sm prose-td:py-2 prose-td:px-3 prose-th:py-2 prose-th:px-3">
        <MDXRemote
          source={content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex],
            },
          }}
        />
      </div>

      <RelatedResources
        calculators={relatedCalcs}
        glossaryTerms={glossaryLinks}
      />
    </article>
  );
}
