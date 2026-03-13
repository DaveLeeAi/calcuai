import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import {
  resolveSlug,
  getAllSpecs,
  getCategory,
  getSpecsByCategory,
  getCalculatorMDX,
  getAllGlossaryTerms,
} from '@/lib/content-loader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import CalculatorRenderer from '@/components/calculator/CalculatorRenderer';
import ShareButton from '@/components/ui/ShareButton';
import { JsonLd } from '@/components/seo/JsonLd';
import { AIDiscovery } from '@/components/seo/AIDiscovery';
import {
  buildCalculatorMetadata,
  buildSubcategoryMetadata,
  buildWebPageSchema,
  buildFAQSchema,
  buildCollectionPageSchema,
} from '@/components/seo/MetaTags';
import {
  buildBreadcrumbSchema,
  buildSoftwareApplicationSchema,
} from '@/lib/schema-generator';
import { RelatedResources } from '@/components/content/RelatedResources';
import { DisclaimerBlock } from '@/components/content/DisclaimerBlock';
import { ArticleContent } from '@/components/content/ArticleContent';
import type { CalculatorSpec } from '@/lib/types';
import {
  getGlossaryTermsForCalculator,
  getMethodologyTopicsForCalculator,
} from '@/lib/content-linker';
import { autoLinkGlossaryTerms } from '@/lib/glossary-auto-linker';
import SalesTaxVisualizations from '@/components/content/SalesTaxVisualizations';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import InlineTableOfContents from '@/components/content/InlineTableOfContents';
import { siteConfig } from '@/lib/site-config';

// ═══════════════════════════════════════════════════════
// Static params
// ═══════════════════════════════════════════════════════

interface Props {
  params: { category: string; slug: string };
}

export async function generateStaticParams() {
  const specs = getAllSpecs();
  const calcParams = specs.map((spec) => ({
    category: spec.category,
    slug: spec.slug,
  }));

  // Also generate params for subcategory hubs with 4+ calculators
  const { getAllCategories } = await import('@/lib/content-loader');
  const categories = getAllCategories();
  const subParams: { category: string; slug: string }[] = [];
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      if (sub.calculators.length >= 4) {
        subParams.push({ category: cat.slug, slug: sub.slug });
      }
    }
  }

  return [...calcParams, ...subParams];
}

// ═══════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolution = resolveSlug(params.category, params.slug);

  if (resolution.type === 'calculator') {
    return buildCalculatorMetadata(resolution.spec);
  }

  if (resolution.type === 'subcategory') {
    const sub = resolution.category.subcategories.find(
      (s) => s.slug === resolution.subcategory
    );
    return buildSubcategoryMetadata(
      sub?.name || params.slug,
      sub?.description || '',
      params.category,
      params.slug
    );
  }

  return {};
}

// ═══════════════════════════════════════════════════════
// Resolve related calculator titles + categories
// ═══════════════════════════════════════════════════════

function resolveRelatedCalculators(
  relatedIds: string[],
  allSpecs: CalculatorSpec[]
): { id: string; title: string; href: string; category?: string }[] {
  return relatedIds.map((relId) => {
    const relSpec = allSpecs.find((s) => s.id === relId);
    return {
      id: relId,
      title:
        relSpec?.title ||
        relId
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
      href: relSpec
        ? `/${relSpec.category}/${relSpec.slug}`
        : `/${relId}`,
      category: relSpec?.category,
    };
  });
}

// ═══════════════════════════════════════════════════════
// Extract plain text from BLUF for AI discovery
// ═══════════════════════════════════════════════════════

function extractBlufText(mdxSource: string): string | undefined {
  const match = mdxSource.match(
    /<div className="bluf-intro">([\s\S]*?)<\/div>/
  );
  if (!match) return undefined;
  // Strip MDX/HTML tags to get plain text
  return match[1]
    .replace(/<[^>]+>/g, '')
    .replace(/\$\$[^$]+\$\$/g, '')
    .replace(/\$[^$]+\$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ═══════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════

export default function SlugPage({ params }: Props) {
  const resolution = resolveSlug(params.category, params.slug);

  if (resolution.type === 'not-found') {
    notFound();
  }

  // ═══════════════════════════════════════════════════════
  // CALCULATOR PAGE
  // ═══════════════════════════════════════════════════════
  if (resolution.type === 'calculator') {
    const { spec } = resolution;
    const cat = getCategory(spec.category);
    const catName = cat?.name || spec.category;
    const allSpecs = getAllSpecs();

    const rawMdx = getCalculatorMDX(spec.category, spec.slug);
    const glossaryTerms = getAllGlossaryTerms();
    const mdxSource = rawMdx ? autoLinkGlossaryTerms(rawMdx, glossaryTerms) : null;

    const webPageSchema = buildWebPageSchema(spec);
    const faqSchema = mdxSource ? buildFAQSchema(spec, mdxSource) : null;
    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: 'Home', url: siteConfig.url },
      { name: catName, url: `${siteConfig.url}/${spec.category}` },
      { name: spec.title },
    ]);
    const softwareAppSchema = buildSoftwareApplicationSchema(spec);

    const relatedCalcs = resolveRelatedCalculators(spec.relatedCalculators, allSpecs);
    const glossaryLinks = getGlossaryTermsForCalculator(spec);
    const methodologyLinks = getMethodologyTopicsForCalculator(spec);
    const blufText = mdxSource ? extractBlufText(mdxSource) : undefined;

    return (
      <article>
        <JsonLd data={webPageSchema} id="schema-webpage" />
        <JsonLd data={breadcrumbSchema} id="schema-breadcrumb" />
        <JsonLd data={softwareAppSchema} id="schema-software-app" />
        {faqSchema && <JsonLd data={faqSchema} id="schema-faq" />}
        <AIDiscovery spec={spec} blufText={blufText} />

        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          crossOrigin="anonymous"
        />

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: catName, href: `/${spec.category}` },
            { label: spec.title },
          ]}
        />

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-6">
          {spec.title}
        </h1>

        {/* BLUF intro */}
        {mdxSource && (
          <div className="mb-8" data-speakable="true">
            <BlufContent source={mdxSource} />
          </div>
        )}

        {/* Calculator Widget — centered, hero position */}
        <div className="my-8">
          <CalculatorRenderer spec={spec} />
        </div>

        {/* Share */}
        <div className="mx-auto max-w-calculator mt-4">
          <ShareButton title={spec.title} />
        </div>

        {/* Feedback */}
        <FeedbackWidget calculatorSlug={spec.slug} calculatorTitle={spec.title} />

        {/* Table of Contents — inline, scrolls with content */}
        <InlineTableOfContents containerSelector="article" />

        {/* Article Content */}
        {mdxSource && (
          <ArticleContent
            mdxSource={mdxSource}
            tier={spec.priority}
            category={spec.category}
            disclaimer={spec.disclaimer}
            calculatorId={spec.id}
            sectionHeadings={{
              ...(spec.sectionHeadings || {}),
              ...(spec.interpretationHeading
                ? { interpretation: spec.interpretationHeading }
                : {}),
            }}
          />
        )}

        {/* Sales tax visualizations (map + table) — renders as article sections */}
        {spec.id === 'sales-tax-calculator' && (
          <div className="mt-8">
            <SalesTaxVisualizations />
          </div>
        )}

        {/* Related Resources */}
        <RelatedResources
          calculators={relatedCalcs}
          glossaryTerms={glossaryLinks}
          methodologyTopics={methodologyLinks}
        />

        {/* Disclaimer */}
        <DisclaimerBlock type={spec.disclaimer} />
      </article>
    );
  }

  // ═══════════════════════════════════════════════════════
  // SUBCATEGORY HUB PAGE
  // ═══════════════════════════════════════════════════════
  if (resolution.type === 'subcategory') {
    const { category: catDef, subcategory: subSlug } = resolution;
    const sub = catDef.subcategories.find((s) => s.slug === subSlug);
    if (!sub) notFound();

    const specs = getSpecsByCategory(catDef.slug);
    const collectionSchema = buildCollectionPageSchema(
      sub.name,
      sub.description || '',
      `${catDef.slug}/${subSlug}`
    );

    return (
      <div>
        <JsonLd data={collectionSchema} id="schema-collection" />
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: catDef.name, href: `/${catDef.slug}` },
            { label: sub.name },
          ]}
        />

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {sub.name}
        </h1>
        <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{sub.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sub.calculators.map((calcId) => {
            const spec = specs.find((s) => s.id === calcId);
            return (
              <Link
                key={calcId}
                href={`/${catDef.slug}/${calcId}`}
                className="category-card"
              >
                <span className="font-semibold text-brand-600">
                  {spec?.title ||
                    calcId
                      .replace(/-/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <Link
            href={`/${catDef.slug}`}
            className="text-brand-500 hover:underline text-sm"
          >
            ← Back to {catDef.name}
          </Link>
        </div>
      </div>
    );
  }

  return notFound();
}

// ═══════════════════════════════════════════════════════
// MDX Content Renderer (Server Component)
// ═══════════════════════════════════════════════════════

interface BlufContentProps {
  source: string;
}

function BlufContent({ source }: BlufContentProps) {
  const blufMatch = source.match(
    /<div className="bluf-intro">([\s\S]*?)<\/div>/
  );
  if (!blufMatch) return null;
  const blufContent = blufMatch[1].trim();

  return (
    <div className="bluf-intro text-base text-gray-700 dark:text-slate-300 leading-relaxed">
      <MDXRemote
        source={blufContent}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins: [rehypeKatex],
          },
        }}
      />
    </div>
  );
}
