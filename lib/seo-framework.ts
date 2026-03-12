/**
 * SEO Framework — Central entry point for all SEO helpers.
 *
 * Re-exports from schema-generator and meta-generator so pages
 * can import everything from one place.
 */

// Schema generators
export {
  buildWebPageSchema,
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildSoftwareApplicationSchema,
  buildHowToSchema,
  buildDatasetSchema,
  buildOrganizationSchema,
  buildWebsiteSchema,
  buildAggregateRatingSchema,
  buildAllCalculatorSchemas,
  extractFAQFromMDX,
  type CalculatorSchemas,
} from './schema-generator';

// Meta tag generators
export {
  buildCalculatorMeta,
  buildCategoryMeta,
  buildSubcategoryMeta,
  buildHomepageMeta,
  buildGlossaryMeta,
  buildMethodologyMeta,
} from './meta-generator';

// ─── Core Web Vitals helpers ─────────────────────────

/**
 * Returns preconnect link hints for CDN domains used by the site.
 * Include these in <head> for faster resource loading.
 */
export const PRECONNECT_DOMAINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdn.jsdelivr.net',
] as const;

/**
 * Returns priority hints for above-fold elements.
 * Use with next/image's `priority` prop or <link rel="preload">.
 */
export function getAboveFoldHints(spec: { priority: string }) {
  return {
    /** Calculator widget should load eagerly on flagship pages */
    calculatorPriority: spec.priority === 'flagship',
    /** Hero images should be preloaded */
    preloadHeroImage: true,
    /** Font display strategy */
    fontDisplay: 'swap' as const,
  };
}
