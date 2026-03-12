import type { Category } from './types';

export type SearchItemType = 'calculator' | 'glossary' | 'methodology';

export interface SearchItem {
  title: string;
  slug: string;
  category: Category | 'glossary' | 'methodology';
  subcategory: string;
  primaryKeyword: string;
  metaDescription: string;
  href: string;
  itemType: SearchItemType;
}

export const CATEGORY_LABELS: Record<string, string> = {
  finance: 'Finance',
  health: 'Health',
  math: 'Math',
  construction: 'Construction',
  science: 'Science',
  everyday: 'Everyday',
  business: 'Business',
  conversion: 'Conversion',
  glossary: 'Glossary',
  methodology: 'Methodology',
};
