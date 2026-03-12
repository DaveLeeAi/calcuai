/**
 * Meta Tag Generator — generates comprehensive metadata for every page type.
 *
 * Handles: standard meta, Open Graph, Twitter Card, article meta,
 * canonical URL, and hreflang.
 */

import type { Metadata } from 'next';
import type { CalculatorSpec, CategoryDefinition } from '@/lib/types';
import { siteConfig } from '@/lib/site-config';

// ─── Calculator Page Metadata ────────────────────────

export function buildCalculatorMeta(spec: CalculatorSpec): Metadata {
  const canonical = `${siteConfig.url}/${spec.category}/${spec.slug}`;
  const isPublished = spec.editorialStatus === 'published';

  return {
    title: spec.metaTitle,
    description: spec.metaDescription,
    alternates: {
      canonical,
      languages: { 'en-US': canonical },
    },
    openGraph: {
      title: spec.metaTitle,
      description: spec.metaDescription,
      url: canonical,
      type: 'website',
      siteName: siteConfig.name,
      locale: 'en_US',
      images: spec.slug
        ? [
            {
              url: `${siteConfig.url}/og/${spec.category}/${spec.slug}.png`,
              width: 1200,
              height: 630,
              alt: spec.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: spec.metaTitle,
      description: spec.metaDescription,
      images: spec.slug
        ? [`${siteConfig.url}/og/${spec.category}/${spec.slug}.png`]
        : undefined,
    },
    robots: {
      index: isPublished,
      follow: true,
    },
    other: {
      'article:published_time': spec.lastContentUpdate || '',
      'article:modified_time': spec.lastContentUpdate || '',
      'article:section': spec.category,
      'citation_title': spec.title,
      'citation_author': siteConfig.name,
      'citation_publication_date': spec.lastContentUpdate || '',
    },
  };
}

// ─── Category Hub Metadata ───────────────────────────

export function buildCategoryMeta(category: CategoryDefinition): Metadata {
  const canonical = `${siteConfig.url}/${category.slug}`;

  return {
    title: category.metaTitle,
    description: category.metaDescription,
    alternates: {
      canonical,
      languages: { 'en-US': canonical },
    },
    openGraph: {
      title: category.metaTitle,
      description: category.metaDescription,
      url: canonical,
      type: 'website',
      siteName: siteConfig.name,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: category.metaTitle,
      description: category.metaDescription,
    },
    robots: { index: true, follow: true },
  };
}

// ─── Subcategory Hub Metadata ────────────────────────

export function buildSubcategoryMeta(
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
    alternates: {
      canonical,
      languages: { 'en-US': canonical },
    },
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

// ─── Homepage Metadata ───────────────────────────────

export function buildHomepageMeta(): Metadata {
  return {
    title: {
      absolute: `Free Online Calculators — ${siteConfig.name}`,
    },
    description: siteConfig.description,
    alternates: {
      canonical: siteConfig.url,
      languages: { 'en-US': siteConfig.url },
    },
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
}

// ─── Glossary Page Metadata ──────────────────────────

export function buildGlossaryMeta(
  termTitle: string,
  description: string,
  slug: string
): Metadata {
  const canonical = `${siteConfig.url}/glossary/${slug}`;

  return {
    title: `${termTitle} — Calculator Glossary`,
    description,
    alternates: {
      canonical,
      languages: { 'en-US': canonical },
    },
    openGraph: {
      title: `${termTitle} — Calculator Glossary`,
      description,
      url: canonical,
      type: 'article',
      siteName: siteConfig.name,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title: `${termTitle} — Calculator Glossary`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

// ─── Methodology Page Metadata ───────────────────────

export function buildMethodologyMeta(
  title: string,
  description: string,
  slug: string
): Metadata {
  const canonical = `${siteConfig.url}/methodology/${slug}`;

  return {
    title: `${title} — Methodology`,
    description,
    alternates: {
      canonical,
      languages: { 'en-US': canonical },
    },
    openGraph: {
      title: `${title} — Methodology`,
      description,
      url: canonical,
      type: 'article',
      siteName: siteConfig.name,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title: `${title} — Methodology`,
      description,
    },
    robots: { index: true, follow: true },
  };
}
