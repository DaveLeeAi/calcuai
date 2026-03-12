import type { Category } from './types';

/**
 * Approved heading pool for the interpretation section (Section 6).
 * These replace the old universal "What This Calculator Tells You" heading
 * with context-aware titles by category/subcategory.
 */

const HEADING_BY_SUBCATEGORY: Record<string, Record<string, string>> = {
  finance: {
    mortgage: 'What Your Payment Breakdown Means',
    loans: 'What Your Payment Breakdown Means',
    investment: 'What Your Projection Shows',
    retirement: 'What Your Projection Shows',
    savings: 'What Your Projection Shows',
    tax: 'What Your Tax Estimate Shows',
  },
  health: {
    pregnancy: 'What Your Estimate Means',
    fitness: 'What Your Results Mean',
    'body-metrics': 'What Your Results Mean',
    nutrition: 'What Your Results Mean',
  },
  math: {
    basic: 'Your Result Explained',
    algebra: 'Your Result Explained',
    geometry: 'Your Result Explained',
    statistics: 'Your Result Explained',
  },
  science: {
    physics: 'Your Result Explained',
  },
  construction: {
    materials: 'What This Estimate Shows',
    landscaping: 'What This Estimate Shows',
    measurement: 'What This Measurement Shows',
  },
  everyday: {
    money: 'What Your Result Shows',
    'date-time': 'Your Result Explained',
    education: 'What Your Grade Means',
  },
  business: {
    margins: 'What Your Results Mean',
    sales: 'What Your Results Mean',
    pricing: 'What Your Results Mean',
    payroll: 'What Your Estimate Shows',
    tax: 'What Your Tax Estimate Shows',
  },
  conversion: {
    weight: 'How This Conversion Works',
    volume: 'How This Conversion Works',
    temperature: 'How This Conversion Works',
    length: 'How This Conversion Works',
    'data-storage': 'How This Conversion Works',
    area: 'How This Conversion Works',
  },
};

const HEADING_BY_CATEGORY: Record<Category, string> = {
  finance: 'What Your Results Mean',
  health: 'What Your Results Mean',
  math: 'Your Result Explained',
  science: 'Your Result Explained',
  construction: 'What This Estimate Shows',
  everyday: 'Your Result Explained',
  business: 'What Your Results Mean',
  conversion: 'How This Conversion Works',
};

const GENERIC_FALLBACK = 'What Your Results Mean';

/**
 * Returns the appropriate interpretation section heading for a calculator.
 * Resolution order: spec override > subcategory default > category default > generic fallback.
 */
export function getInterpretationHeading(
  category: Category,
  subcategory: string,
  specOverride?: string
): string {
  if (specOverride) return specOverride;

  const subcategoryHeading = HEADING_BY_SUBCATEGORY[category]?.[subcategory];
  if (subcategoryHeading) return subcategoryHeading;

  return HEADING_BY_CATEGORY[category] ?? GENERIC_FALLBACK;
}

/**
 * Lookup table for batch-updating existing MDX files.
 * Maps each `category + subcategory` pair to its heading.
 */
export function getHeadingForSpec(spec: {
  category: Category;
  subcategory: string;
  interpretationHeading?: string;
}): string {
  return getInterpretationHeading(
    spec.category,
    spec.subcategory,
    spec.interpretationHeading
  );
}
