import type { Metadata } from 'next';
import type { CalculatorSpec } from '@/lib/types';
import { siteConfig } from '@/lib/site-config';

/**
 * Builds Next.js Metadata for a calculator page.
 * Title format: {Title} — Free Online Calculator | CalcuAI
 * Description: 120-155 chars, unique per page.
 */
export function buildCalculatorMetadata(spec: CalculatorSpec): Metadata {
  const canonical = `${siteConfig.url}/${spec.category}/${spec.slug}`;

  return {
    title: spec.metaTitle,
    description: spec.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: spec.metaTitle,
      description: spec.metaDescription,
      url: canonical,
      type: 'website',
      siteName: siteConfig.name,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: spec.metaTitle,
      description: spec.metaDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Builds Next.js Metadata for a category hub page.
 */
export function buildCategoryMetadata(
  metaTitle: string,
  metaDescription: string,
  categorySlug: string
): Metadata {
  const canonical = `${siteConfig.url}/${categorySlug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonical,
      type: 'website',
      siteName: siteConfig.name,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Builds Next.js Metadata for a subcategory hub page.
 */
export function buildSubcategoryMetadata(
  name: string,
  description: string,
  categorySlug: string,
  subcategorySlug: string
): Metadata {
  const title = `${name} Calculators`;
  const canonical = `${siteConfig.url}/${categorySlug}/${subcategorySlug}`;

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
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Builds WebPage JSON-LD schema for a calculator page.
 * Includes Speakable schema for flagship pages.
 */
export function buildWebPageSchema(spec: CalculatorSpec): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: spec.metaTitle,
    description: spec.metaDescription,
    url: `${siteConfig.url}/${spec.category}/${spec.slug}`,
    ...(spec.lastContentUpdate ? { dateModified: spec.lastContentUpdate } : {}),
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

  if (
    spec.priority === 'flagship' &&
    spec.speakableSelectors &&
    spec.speakableSelectors.length > 0
  ) {
    schema.speakable = {
      '@type': 'SpeakableSpecification',
      cssSelector: spec.speakableSelectors,
    };
  }

  return schema;
}

/**
 * Builds CollectionPage JSON-LD schema for category and subcategory hub pages.
 * urlPath should be the path portion only, e.g. 'finance' or 'finance/loans'.
 */
export function buildCollectionPageSchema(
  name: string,
  description: string,
  urlPath: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${siteConfig.url}/${urlPath}`,
    isPartOf: { '@id': `${siteConfig.url}/#website` },
  };
}

/**
 * Builds TechArticle JSON-LD schema for methodology pages.
 */
export function buildTechArticleSchema(
  headline: string,
  description: string,
  url: string,
  dateModified?: string
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline,
    description,
    url,
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
  if (dateModified) schema.dateModified = dateModified;
  return schema;
}

/**
 * Builds FAQPage JSON-LD schema from MDX source.
 * Only generates when spec.hasFAQ is true AND FAQ content exists in MDX.
 */
export function buildFAQSchema(
  spec: CalculatorSpec,
  mdxSource: string
): Record<string, unknown> | null {
  if (!spec.hasFAQ) return null;

  const faqEntries: { question: string; answer: string }[] = [];
  const lines = mdxSource.split('\n');
  let inFaqSection = false;
  let currentQuestion = '';
  let currentAnswer = '';

  for (const line of lines) {
    // Match common FAQ heading variants: "Frequently Asked Questions", "Common Questions", "FAQ"
    if (line.match(/^##\s+(?:Frequently Asked Questions?|Common Questions|FAQ)\s*$/i)) {
      inFaqSection = true;
      continue;
    }
    if (inFaqSection && line.match(/^##\s+/) && !line.match(/^###/)) {
      if (currentQuestion && currentAnswer.trim()) {
        faqEntries.push({ question: currentQuestion, answer: currentAnswer.trim() });
      }
      break;
    }
    if (inFaqSection && line.match(/^###\s+/)) {
      if (currentQuestion && currentAnswer.trim()) {
        faqEntries.push({ question: currentQuestion, answer: currentAnswer.trim() });
      }
      currentQuestion = line.replace(/^###\s+/, '').trim();
      currentAnswer = '';
      continue;
    }
    if (inFaqSection && currentQuestion) {
      const trimmed = line.trim();
      if (
        trimmed &&
        !trimmed.startsWith('{/*') &&
        !trimmed.startsWith('<div') &&
        !trimmed.startsWith('</div') &&
        !trimmed.startsWith('<section') &&
        !trimmed.startsWith('</section')
      ) {
        currentAnswer += (currentAnswer ? ' ' : '') + trimmed;
      }
    }
  }
  if (currentQuestion && currentAnswer.trim()) {
    faqEntries.push({ question: currentQuestion, answer: currentAnswer.trim() });
  }

  if (faqEntries.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqEntries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };
}
