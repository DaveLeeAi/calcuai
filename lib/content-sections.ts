// ═══════════════════════════════════════════════════════
// MDX Article Section Parser + Behavior Configuration
// ═══════════════════════════════════════════════════════
//
// Parses calculator MDX content into discrete typed sections,
// enabling modular rendering with per-section styling and
// progressive disclosure (collapsible deep sections).
//
// Heading variation: category-aware defaults replace the old
// universal DISPLAY_HEADINGS map. Per-spec overrides via
// sectionHeadings take priority. Original MDX headings are
// preserved when they are already calculator-specific.

import type { Category, DisclaimerType, Priority } from './types';

// ─── Section Types ───────────────────────────────────

export type ArticleSectionType =
  | 'interpretation'
  | 'howToUse'
  | 'formula'
  | 'workedExamples'
  | 'keyFactors'
  | 'commonMistakes'
  | 'assumptions'
  | 'faq'
  | 'methodology'
  | 'comparison'
  | 'scenarios'
  | 'generic';

export interface ParsedSection {
  type: ArticleSectionType;
  heading: string;
  content: string;       // MDX body without the heading line
  rawContent: string;    // Full content including heading
}

export interface FaqItem {
  question: string;
  answer: string;        // MDX content for the answer
}

// ─── Heading → Section Type Detection ────────────────

const SECTION_PATTERNS: [RegExp, ArticleSectionType][] = [
  [/what\s+(this\s+)?calculator\s+tells\s+you/i, 'interpretation'],
  [/what\s+your\s+results?\s+(mean|show|explain)/i, 'interpretation'],
  [/what\s+this\s+estimate\s+shows/i, 'interpretation'],
  [/your\s+results?\s+explained/i, 'interpretation'],
  [/understanding\s+your\s+results/i, 'interpretation'],
  [/what\s+your\s+.+\s+(means?|shows?)/i, 'interpretation'],
  [/how\s+to\s+use/i, 'howToUse'],
  [/quick\s+start/i, 'howToUse'],
  [/how\s+this\s+is\s+calculated/i, 'formula'],
  [/^the\s+formula$/i, 'formula'],
  [/formula\s*[&+]\s*method/i, 'formula'],
  [/how\s+it\s+works$/i, 'formula'],
  [/conversion\s+formulas?/i, 'formula'],
  [/worked\s+examples?/i, 'workedExamples'],
  [/key\s+factors/i, 'keyFactors'],
  [/key\s+concepts/i, 'keyFactors'],
  [/what\s+affects/i, 'keyFactors'],
  [/what\s+drives/i, 'keyFactors'],
  [/what\s+changes/i, 'keyFactors'],
  [/variables?\s+that/i, 'keyFactors'],
  [/conversion\s+factors/i, 'keyFactors'],
  [/common\s+mistakes/i, 'commonMistakes'],
  [/common\s+errors/i, 'commonMistakes'],
  [/common\s+misconceptions/i, 'commonMistakes'],
  [/costly\s+mistakes/i, 'commonMistakes'],
  [/common\s+estimation\s+mistakes/i, 'commonMistakes'],
  [/common\s+conversion\s+errors/i, 'commonMistakes'],
  [/common\s+analysis\s+mistakes/i, 'commonMistakes'],
  [/assumptions?\s*[&+]\s*limitations?/i, 'assumptions'],
  [/when\s+this\s+calculator\s+falls\s+short/i, 'assumptions'],
  [/what\s+this\s+doesn.t\s+(include|account)/i, 'assumptions'],
  [/important\s+limitations/i, 'assumptions'],
  [/where\s+this\s+(model\s+)?breaks\s+down/i, 'assumptions'],
  [/constraints?\s*[&+]\s*edge\s+cases/i, 'assumptions'],
  [/precision\s*[&+]\s*rounding/i, 'assumptions'],
  [/frequently\s+asked\s+questions?/i, 'faq'],
  [/common\s+questions/i, 'faq'],
  [/^faq$/i, 'faq'],
  [/methodology\s*[&+]\s*sources/i, 'methodology'],
  [/sources?\s*[&+]\s*methodology/i, 'methodology'],
  [/standards?\s*[&+]\s*references/i, 'methodology'],
  [/^methodology$/i, 'methodology'],
  [/^sources$/i, 'methodology'],
  [/comparison/i, 'comparison'],
  [/scenario/i, 'scenarios'],
  [/application/i, 'scenarios'],
];

function detectSectionType(heading: string): ArticleSectionType {
  for (const [pattern, type] of SECTION_PATTERNS) {
    if (pattern.test(heading)) return type;
  }
  return 'generic';
}

// ─── Generic Heading Detection ───────────────────────
// These patterns identify "template" headings that should
// be replaced with category-aware alternatives. If an MDX
// heading does NOT match these, it was customized by the
// writer and should be preserved.

const GENERIC_HEADING_PATTERNS: Partial<Record<ArticleSectionType, RegExp>> = {
  howToUse:       /^how to use this calculator$/i,
  formula:        /^the formula$/i,
  workedExamples: /^worked examples?$/i,
  keyFactors:     /^key factors( that affect your results?)?$/i,
  commonMistakes: /^common mistakes( to avoid)?$/i,
  assumptions:    /^assumptions?\s*[&+]\s*limitations?$/i,
  faq:            /^frequently asked questions?$/i,
};

function isGenericHeading(type: ArticleSectionType, heading: string): boolean {
  const pattern = GENERIC_HEADING_PATTERNS[type];
  if (!pattern) return false;
  return pattern.test(heading.trim());
}

// ─── Category-Aware Heading Defaults ─────────────────
// Only sections where the generic heading feels wrong or
// repetitive for that category get overrides. Gaps fall
// through to the universal defaults below.

const CATEGORY_HEADINGS: Partial<Record<Category, Partial<Record<ArticleSectionType, string>>>> = {
  finance: {
    keyFactors:     'What Affects Your Numbers',
    commonMistakes: 'Costly Mistakes to Avoid',
    assumptions:    'Assumptions Built Into This Estimate',
    faq:            'Common Questions',
  },
  health: {
    keyFactors:     'What Affects This Estimate',
    commonMistakes: 'Common Misconceptions',
    assumptions:    'Important Limitations',
    formula:        'How This Is Calculated',
    faq:            'Common Questions',
  },
  construction: {
    keyFactors:     'What Changes Your Estimate',
    commonMistakes: 'Common Estimation Mistakes',
    assumptions:    'What This Doesn\'t Account For',
    faq:            'Common Questions',
  },
  science: {
    keyFactors:     'Variables That Affect Results',
    assumptions:    'Where This Model Breaks Down',
    faq:            'Common Questions',
  },
  math: {
    keyFactors:     'Key Concepts',
    commonMistakes: 'Common Errors',
    assumptions:    'Constraints & Edge Cases',
    faq:            'Common Questions',
  },
  everyday: {
    keyFactors:     'What Affects Your Result',
    howToUse:       'Quick Start',
    formula:        'How It Works',
    faq:            'Common Questions',
  },
  business: {
    keyFactors:     'What Drives These Numbers',
    commonMistakes: 'Common Analysis Mistakes',
    faq:            'Common Questions',
  },
  conversion: {
    keyFactors:     'Conversion Factors',
    formula:        'Conversion Formulas',
    commonMistakes: 'Common Conversion Errors',
    assumptions:    'Precision & Rounding Notes',
    faq:            'Common Questions',
    methodology:    'Standards & References',
  },
};

// Universal fallback — used when the category has no specific heading
const DEFAULT_HEADINGS: Partial<Record<ArticleSectionType, string>> = {
  howToUse:       'How to Use This Calculator',
  formula:        'The Formula',
  workedExamples: 'Worked Examples',
  keyFactors:     'Key Factors',
  commonMistakes: 'Common Mistakes to Avoid',
  assumptions:    'Assumptions & Limitations',
  faq:            'Frequently Asked Questions',
  methodology:    'Sources & Methodology',
};

// ─── Context-Aware Heading Resolution ────────────────
//
// Priority order:
//   1. Per-spec override (sectionHeadings field)
//   2. Original MDX heading if calculator-specific
//   3. Category-aware default
//   4. Universal default
//   5. Original MDX heading (last resort)

export function getContextualHeading(
  type: ArticleSectionType,
  originalHeading: string,
  category: Category,
  specOverrides?: Partial<Record<string, string>>
): string {
  // 1. Per-spec override always wins
  if (specOverrides?.[type]) return specOverrides[type]!;

  // 2. Custom section types: always keep original MDX heading
  if (type === 'generic' || type === 'comparison' || type === 'scenarios') {
    return originalHeading;
  }

  // 3. Interpretation: always keep MDX heading — writers already
  //    customized these per-calculator ("What Your Payment Breakdown
  //    Means", "What This Estimate Shows", etc.)
  if (type === 'interpretation') {
    return originalHeading;
  }

  // 4. Methodology: keep original — two useful variants exist
  //    ("Methodology & Sources" vs "How This Is Calculated")
  if (type === 'methodology') {
    // Only override if the category has a specific preference
    const catHeading = CATEGORY_HEADINGS[category]?.methodology;
    if (catHeading && isGenericHeading(type, originalHeading)) {
      return catHeading;
    }
    return originalHeading;
  }

  // 5. If the original heading was customized (non-generic), keep it
  if (!isGenericHeading(type, originalHeading)) {
    return originalHeading;
  }

  // 6. Category-aware default
  const categoryHeading = CATEGORY_HEADINGS[category]?.[type];
  if (categoryHeading) return categoryHeading;

  // 7. Universal default
  return DEFAULT_HEADINGS[type] || originalHeading;
}

// Backward compat — old callers that don't have category context
export function getDisplayHeading(
  type: ArticleSectionType,
  originalHeading: string
): string {
  if (type === 'generic' || type === 'comparison' || type === 'scenarios') {
    return originalHeading;
  }
  if (type === 'interpretation' || type === 'methodology') {
    return originalHeading;
  }
  return DEFAULT_HEADINGS[type] || originalHeading;
}

// ─── Section Type Icons ──────────────────────────────
// Inline SVG path data for tasteful monochrome icons.
// Used by ArticleContent to add visual scanning cues.

export interface SectionIcon {
  path: string;         // SVG path d="" data
  viewBox: string;      // SVG viewBox
  colorClass: string;   // Tailwind text color
}

export const SECTION_ICONS: Partial<Record<ArticleSectionType, SectionIcon>> = {
  interpretation: {
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    viewBox: '0 0 24 24',
    colorClass: 'text-brand-500',
  },
  keyFactors: {
    path: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    viewBox: '0 0 24 24',
    colorClass: 'text-emerald-500',
  },
  howToUse: {
    path: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    viewBox: '0 0 24 24',
    colorClass: 'text-blue-500',
  },
  formula: {
    path: 'M4.745 3A1.745 1.745 0 003 4.745v14.51C3 20.216 3.784 21 4.745 21h14.51A1.745 1.745 0 0021 19.255V4.745A1.745 1.745 0 0019.255 3H4.745zM9 7h2l-3 5 3 5H9l-3-5 3-5zm6 0h2l3 5-3 5h-2l3-5-3-5z',
    viewBox: '0 0 24 24',
    colorClass: 'text-indigo-500',
  },
  workedExamples: {
    path: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    viewBox: '0 0 24 24',
    colorClass: 'text-blue-500',
  },
  commonMistakes: {
    path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    viewBox: '0 0 24 24',
    colorClass: 'text-orange-500',
  },
  assumptions: {
    path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    viewBox: '0 0 24 24',
    colorClass: 'text-amber-500',
  },
  faq: {
    path: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    viewBox: '0 0 24 24',
    colorClass: 'text-violet-500',
  },
  methodology: {
    path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    viewBox: '0 0 24 24',
    colorClass: 'text-gray-500',
  },
};

// ─── Section Parsing ─────────────────────────────────

export function parseArticleSections(mdxSource: string): ParsedSection[] {
  // Strip BLUF section
  let source = mdxSource.replace(
    /\{\/\*\s*Section 3:.*?\*\/\}\s*<div className="bluf-intro">[\s\S]*?<\/div>/,
    ''
  );

  // Strip section comments
  source = source.replace(/\{\/\*\s*Sections?\s+[^*]*\*\/\}/g, '');

  // Strip formula/faq wrapper divs (preserve inner content)
  source = source.replace(/<div className="(formula|faq)-section">\s*/g, '');
  // Remove closing </div> tags that were part of wrapper divs
  // Match </div> that is followed by whitespace then an H2, section comment, or EOF
  source = source.replace(/<\/div>\s*(?=\n\n##|\n*\{\/\*|\n*$)/g, '');

  // Find all H2 headings and their positions
  const h2Pattern = /^## (.+)$/gm;
  const matches: { index: number; fullMatch: string; heading: string }[] = [];
  let match;

  while ((match = h2Pattern.exec(source)) !== null) {
    matches.push({
      index: match.index,
      fullMatch: match[0],
      heading: match[1].trim(),
    });
  }

  const sections: ParsedSection[] = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : source.length;
    const heading = matches[i].heading;
    const rawContent = source.slice(start, end).trim();
    const content = rawContent
      .replace(/^## .+\n+/, '')
      .trim();

    if (!content) continue;

    sections.push({
      type: detectSectionType(heading),
      heading,
      content,
      rawContent,
    });
  }

  return sections;
}

// ─── FAQ Item Parsing ────────────────────────────────

export function parseFaqItems(faqContent: string): FaqItem[] {
  const h3Pattern = /^### (.+)$/gm;
  const matches: { index: number; question: string }[] = [];
  let match;

  while ((match = h3Pattern.exec(faqContent)) !== null) {
    matches.push({ index: match.index, question: match[1].trim() });
  }

  const items: FaqItem[] = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : faqContent.length;
    const question = matches[i].question;
    const answer = faqContent
      .slice(start, end)
      .replace(/^### .+\n+/, '')
      .trim();

    if (answer) {
      items.push({ question, answer });
    }
  }

  return items;
}

// ─── Section Visibility & Behavior ───────────────────

export interface SectionBehavior {
  /** Whether the section renders at all */
  visible: boolean;
  /** Whether the section uses <details> progressive disclosure */
  collapsible: boolean;
  /** If collapsible, whether it starts open */
  defaultOpen: boolean;
}

export function getSectionBehavior(
  sectionType: ArticleSectionType,
  tier: Priority,
  category: Category,
  disclaimer: DisclaimerType
): SectionBehavior {
  const isYmyl = disclaimer === 'health' || disclaimer === 'finance';

  // Base behavior by section type
  const base: Record<ArticleSectionType, SectionBehavior> = {
    interpretation: { visible: true, collapsible: false, defaultOpen: true },
    keyFactors:     { visible: true, collapsible: false, defaultOpen: true },
    howToUse:       { visible: true, collapsible: false, defaultOpen: true },
    formula:        { visible: true, collapsible: true,  defaultOpen: false },
    workedExamples: { visible: true, collapsible: false, defaultOpen: true },
    commonMistakes: { visible: true, collapsible: false, defaultOpen: true },
    assumptions:    { visible: true, collapsible: !isYmyl, defaultOpen: isYmyl },
    faq:            { visible: true, collapsible: false, defaultOpen: true },
    methodology:    { visible: true, collapsible: true,  defaultOpen: false },
    comparison:     { visible: true, collapsible: false, defaultOpen: true },
    scenarios:      { visible: true, collapsible: false, defaultOpen: true },
    generic:        { visible: true, collapsible: false, defaultOpen: true },
  };

  const behavior = { ...base[sectionType] };

  // ── Tier overrides ──

  if (tier === 'flagship') {
    // Flagships show everything open — they have rich enough content
    if (sectionType === 'formula') {
      behavior.collapsible = true;
      behavior.defaultOpen = true;
    }
    if (sectionType === 'methodology') {
      behavior.collapsible = true;
      behavior.defaultOpen = false;
    }
  }

  if (tier === 'standard') {
    // Standard: collapse "how-to" and "common mistakes" but default open
    if (sectionType === 'howToUse') {
      behavior.collapsible = true;
      behavior.defaultOpen = true;
    }
    if (sectionType === 'commonMistakes') {
      behavior.collapsible = true;
      behavior.defaultOpen = true;
    }
  }

  if (tier === 'utility') {
    // Utility calculators collapse deep sections by default
    if (sectionType === 'howToUse') {
      behavior.collapsible = true;
      behavior.defaultOpen = false;
    }
    if (sectionType === 'workedExamples') {
      behavior.collapsible = true;
      behavior.defaultOpen = false;
    }
    if (sectionType === 'commonMistakes') {
      behavior.collapsible = true;
      behavior.defaultOpen = false;
    }
    if (sectionType === 'keyFactors') {
      behavior.collapsible = true;
      behavior.defaultOpen = true;
    }
  }

  // ── Category overrides ──

  // Finance always shows formula prominently
  if (category === 'finance' && sectionType === 'formula') {
    behavior.defaultOpen = true;
  }

  // Health surfaces assumptions prominently
  if (category === 'health' && sectionType === 'assumptions') {
    behavior.collapsible = false;
    behavior.defaultOpen = true;
  }

  return behavior;
}

// ─── Section Style Tokens ────────────────────────────
// Visual differentiation per section type. "Premium calm"
// with expanded card treatment for better scannability.

export interface SectionStyle {
  /** Subtle left border accent color */
  accentClass: string;
  /** Optional light background tint */
  bgClass: string;
  /** Whether this section gets the "card" treatment (border + padding) */
  card: boolean;
}

export function getSectionStyle(
  type: ArticleSectionType,
  disclaimer: DisclaimerType
): SectionStyle {
  const isYmyl = disclaimer === 'health' || disclaimer === 'finance';

  switch (type) {
    case 'interpretation':
      return { accentClass: 'border-l-brand-400', bgClass: 'bg-brand-50/40', card: true };

    case 'keyFactors':
      return { accentClass: 'border-l-emerald-300', bgClass: 'bg-emerald-50/30', card: true };

    case 'workedExamples':
      return { accentClass: 'border-l-blue-200', bgClass: 'bg-blue-50/20', card: true };

    case 'commonMistakes':
      return { accentClass: 'border-l-orange-300', bgClass: 'bg-orange-50/30', card: true };

    case 'assumptions':
      return isYmyl
        ? { accentClass: 'border-l-amber-400', bgClass: 'bg-amber-50/40', card: true }
        : { accentClass: 'border-l-amber-200', bgClass: 'bg-amber-50/20', card: true };

    case 'formula':
      return { accentClass: 'border-l-indigo-300', bgClass: 'bg-indigo-50/30', card: true };

    case 'faq':
      return { accentClass: '', bgClass: '', card: false };

    case 'methodology':
      return { accentClass: 'border-l-gray-300', bgClass: 'bg-gray-50/50', card: true };

    default:
      return { accentClass: '', bgClass: '', card: false };
  }
}

// ─── Preferred Section Order ─────────────────────────
// Sections are rendered in this order regardless of MDX order.
// Sections not in this list appear at the end in original order.

const SECTION_ORDER: ArticleSectionType[] = [
  'interpretation',
  'keyFactors',
  'howToUse',
  'formula',
  'workedExamples',
  'commonMistakes',
  'comparison',
  'scenarios',
  'assumptions',
  'faq',
  'methodology',
  'generic',
];

export function sortSections(sections: ParsedSection[]): ParsedSection[] {
  return [...sections].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a.type);
    const bi = SECTION_ORDER.indexOf(b.type);
    // If both are found, sort by the order list
    if (ai !== -1 && bi !== -1) return ai - bi;
    // Unknown types go last, in original order
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    return -1;
  });
}
