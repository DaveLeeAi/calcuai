import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkMath from 'remark-math';
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
import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildCalculatorMetadata,
  buildSubcategoryMetadata,
  buildWebPageSchema,
  buildFAQSchema,
  buildCollectionPageSchema,
} from '@/components/seo/MetaTags';
import { RelatedCalculators } from '@/components/content/RelatedCalculators';
import { RelatedResources } from '@/components/content/RelatedResources';
import { DisclaimerBlock } from '@/components/content/DisclaimerBlock';
import { ArticleContent } from '@/components/content/ArticleContent';
import type { CalculatorSpec } from '@/lib/types';
import {
  getGlossaryTermsForCalculator,
  getMethodologyTopicsForCalculator,
} from '@/lib/content-linker';
import { autoLinkGlossaryTerms } from '@/lib/glossary-auto-linker';

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
): { id: string; title: string; href: string }[] {
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
    };
  });
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

    // Load MDX source and auto-link glossary terms
    const rawMdx = getCalculatorMDX(spec.category, spec.slug);
    const glossaryTerms = getAllGlossaryTerms();
    const mdxSource = rawMdx ? autoLinkGlossaryTerms(rawMdx, glossaryTerms) : null;

    // Build schemas
    const webPageSchema = buildWebPageSchema(spec);
    const faqSchema = mdxSource ? buildFAQSchema(spec, mdxSource) : null;

    // Resolve related calculators
    const relatedCalcs = resolveRelatedCalculators(
      spec.relatedCalculators,
      allSpecs
    );

    // Resolve cross-content-type links
    const glossaryLinks = getGlossaryTermsForCalculator(spec);
    const methodologyLinks = getMethodologyTopicsForCalculator(spec);

    return (
      <article>
        {/* JSON-LD Schema: WebPage (+ Speakable for flagships) */}
        <JsonLd data={webPageSchema} id="schema-webpage" />

        {/* JSON-LD Schema: FAQPage (only when hasFAQ + actual FAQ content) */}
        {faqSchema && <JsonLd data={faqSchema} id="schema-faq" />}

        {/* KaTeX CSS for math formulas */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          crossOrigin="anonymous"
        />

        {/* Section 1: Breadcrumbs (with BreadcrumbList schema) */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: catName, href: `/${spec.category}` },
            { label: spec.title },
          ]}
        />

        {/* Section 2: H1 Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-6">
          {spec.title}
        </h1>

        {/* MDX Content: BLUF intro (Section 3) renders before the calculator */}
        {mdxSource && (
          <div className="max-w-content mx-auto mb-8">
            <BlufContent source={mdxSource} />
          </div>
        )}

        {/* Section 4 & 5: Calculator Widget + Result Display */}
        <div className="my-8">
          <CalculatorRenderer spec={spec} />
        </div>

        {/* Sections 6-14: Modular Article Content */}
        {mdxSource && (
          <ArticleContent
            mdxSource={mdxSource}
            tier={spec.priority}
            category={spec.category}
            disclaimer={spec.disclaimer}
            sectionHeadings={{
              ...(spec.sectionHeadings || {}),
              ...(spec.interpretationHeading
                ? { interpretation: spec.interpretationHeading }
                : {}),
            }}
          />
        )}

        {/* Section 15: Related Resources (calculators + glossary + methodology) */}
        <RelatedResources
          calculators={relatedCalcs}
          glossaryTerms={glossaryLinks}
          methodologyTopics={methodologyLinks}
        />

        {/* Section 17: Disclaimer */}
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
    <div className="bluf-intro text-lg text-gray-700 dark:text-slate-300 leading-relaxed">
      <MDXRemote
        source={blufContent}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
          },
        }}
      />
    </div>
  );
}
