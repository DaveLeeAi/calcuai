import { getAllSpecs, getAllGlossaryTerms, getAllMethodologyTopics } from './content-loader';
import type { SearchItem } from './search-types';

export type { SearchItem } from './search-types';
export { CATEGORY_LABELS } from './search-types';

/**
 * Build a lightweight search item list from all content types:
 * calculators, glossary terms, and methodology topics.
 * Server-only — reads the filesystem via content-loader.
 */
export function buildSearchItems(): SearchItem[] {
  const specs = getAllSpecs();
  const calcItems: SearchItem[] = specs
    .filter((s) => s.editorialStatus !== 'deprecated')
    .map((s) => ({
      title: s.title,
      slug: s.slug,
      category: s.category,
      subcategory: s.subcategory,
      primaryKeyword: s.primaryKeyword,
      metaDescription: s.metaDescription,
      href: `/${s.category}/${s.slug}`,
      itemType: 'calculator' as const,
    }));

  const glossaryTerms = getAllGlossaryTerms();
  const glossaryItems: SearchItem[] = glossaryTerms.map((t) => ({
    title: t.title,
    slug: t.slug,
    category: 'glossary' as const,
    subcategory: 'definition',
    primaryKeyword: t.title.toLowerCase(),
    metaDescription: `Definition of ${t.title} — used by ${t.relatedCalculators.length} calculators`,
    href: `/glossary/${t.slug}`,
    itemType: 'glossary' as const,
  }));

  const methodologyTopics = getAllMethodologyTopics();
  const methodologyItems: SearchItem[] = methodologyTopics.map((m) => ({
    title: m.title,
    slug: m.slug,
    category: 'methodology' as const,
    subcategory: 'formula',
    primaryKeyword: m.title.toLowerCase(),
    metaDescription: `Deep-dive into the math behind ${m.title.toLowerCase().replace(/^how\s+/i, '')}`,
    href: `/methodology/${m.slug}`,
    itemType: 'methodology' as const,
  }));

  return [...calcItems, ...glossaryItems, ...methodologyItems];
}
