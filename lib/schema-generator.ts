/**
 * Schema Generator — generates all applicable JSON-LD schema types per page.
 *
 * Centralizes schema generation so every page calls one function and gets
 * all applicable schema objects back as an array.
 */

import type { CalculatorSpec } from '@/lib/types';
import { siteConfig } from '@/lib/site-config';

// ─── WebPage Schema ──────────────────────────────────

export function buildWebPageSchema(spec: CalculatorSpec): Record<string, unknown> {
  const url = `${siteConfig.url}/${spec.category}/${spec.slug}`;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}/#webpage`,
    name: spec.metaTitle,
    description: spec.metaDescription,
    url,
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    about: {
      '@type': 'Thing',
      name: spec.title,
    },
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
  };

  if (spec.lastContentUpdate) {
    schema.dateModified = spec.lastContentUpdate;
    schema.datePublished = spec.lastContentUpdate;
  }

  // Speakable for flagship pages
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

// ─── BreadcrumbList Schema ───────────────────────────

export function buildBreadcrumbSchema(
  items: { name: string; url?: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

// ─── FAQPage Schema ──────────────────────────────────

export function buildFAQSchema(
  questions: { question: string; answer: string }[]
): Record<string, unknown> | null {
  if (questions.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

// ─── SoftwareApplication Schema ──────────────────────

export function buildSoftwareApplicationSchema(
  spec: CalculatorSpec
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: spec.title,
    description: spec.metaDescription,
    url: `${siteConfig.url}/${spec.category}/${spec.slug}`,
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Calculator',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: siteConfig.name,
    },
  };
}

// ─── HowTo Schema (for worked examples) ─────────────

export function buildHowToSchema(
  name: string,
  description: string,
  steps: { name: string; text: string }[],
  url: string
): Record<string, unknown> | null {
  if (steps.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
      url: `${url}#step-${i + 1}`,
    })),
  };
}

// ─── Dataset Schema (for data tables) ────────────────

export function buildDatasetSchema(
  name: string,
  description: string,
  url: string,
  source?: string,
  dateModified?: string
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url,
    creator: {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: siteConfig.name,
    },
  };

  if (source) {
    schema.isBasedOn = source;
  }
  if (dateModified) {
    schema.dateModified = dateModified;
  }

  return schema;
}

// ─── Organization Schema (homepage only) ─────────────

export function buildOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteConfig.contactEmail,
      contactType: 'customer support',
    },
  };
}

// ─── Website Schema (homepage only) ──────────────────

export function buildWebsiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    publisher: { '@id': `${siteConfig.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

// ─── AggregateRating placeholder ─────────────────────

export function buildAggregateRatingSchema(
  itemName: string,
  ratingValue: number,
  ratingCount: number
): Record<string, unknown> | null {
  if (ratingCount === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: itemName,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toFixed(1),
      ratingCount,
      bestRating: '5',
      worstRating: '1',
    },
  };
}

// ─── Collect all schemas for a calculator page ───────

export interface CalculatorSchemas {
  webPage: Record<string, unknown>;
  breadcrumb: Record<string, unknown>;
  softwareApp: Record<string, unknown>;
  faq: Record<string, unknown> | null;
}

export function buildAllCalculatorSchemas(
  spec: CalculatorSpec,
  categoryName: string,
  faqItems: { question: string; answer: string }[]
): CalculatorSchemas {
  const breadcrumbItems = [
    { name: 'Home', url: siteConfig.url },
    { name: categoryName, url: `${siteConfig.url}/${spec.category}` },
    { name: spec.title },
  ];

  return {
    webPage: buildWebPageSchema(spec),
    breadcrumb: buildBreadcrumbSchema(breadcrumbItems),
    softwareApp: buildSoftwareApplicationSchema(spec),
    faq: spec.hasFAQ && faqItems.length > 0 ? buildFAQSchema(faqItems) : null,
  };
}

// ─── Extract FAQ items from MDX source ───────────────

export function extractFAQFromMDX(
  mdxSource: string
): { question: string; answer: string }[] {
  const entries: { question: string; answer: string }[] = [];
  const lines = mdxSource.split('\n');
  let inFaqSection = false;
  let currentQuestion = '';
  let currentAnswer = '';

  for (const line of lines) {
    if (line.match(/^##\s+Frequently Asked Questions/)) {
      inFaqSection = true;
      continue;
    }
    if (inFaqSection && line.match(/^##\s+/) && !line.match(/^###/)) {
      if (currentQuestion && currentAnswer.trim()) {
        entries.push({ question: currentQuestion, answer: currentAnswer.trim() });
      }
      break;
    }
    if (inFaqSection && line.match(/^###\s+/)) {
      if (currentQuestion && currentAnswer.trim()) {
        entries.push({ question: currentQuestion, answer: currentAnswer.trim() });
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
        !trimmed.startsWith('</div')
      ) {
        currentAnswer += (currentAnswer ? ' ' : '') + trimmed;
      }
    }
  }
  if (currentQuestion && currentAnswer.trim()) {
    entries.push({ question: currentQuestion, answer: currentAnswer.trim() });
  }

  return entries;
}
