// ═══════════════════════════════════════════════════════
// Calculator Spec Schema — v2 with operational fields
// ═══════════════════════════════════════════════════════

export type Category = 'finance' | 'health' | 'math' | 'construction' | 'science' | 'everyday' | 'business' | 'conversion' | 'ecommerce' | 'real-estate' | 'energy' | 'productivity';
export type InputType = 'number' | 'currency' | 'percentage' | 'date' | 'select' | 'toggle' | 'range' | 'radio' | 'unit-pair';
export type OutputType = 'single-value' | 'value-group' | 'table' | 'chart-pie' | 'chart-line' | 'chart-bar' | 'gauge' | 'comparison';
export type Feature = 'chart' | 'amortization-table' | 'compare-scenarios' | 'shareable-url' | 'print-results' | 'presets';
export type DisclaimerType = 'finance' | 'health' | 'general' | 'construction';
export type EditorialStatus = 'draft' | 'review' | 'published' | 'deprecated';
export type Priority = 'flagship' | 'standard' | 'utility';
export type TargetIntent = 'informational' | 'transactional' | 'navigational';
export type MonetizationType = 'ads' | 'affiliate' | 'lead-gen' | 'ads+affiliate' | 'none';

export interface InputField {
  id: string;
  label: string;
  type: InputType;
  required: boolean;
  defaultValue?: number | string | boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  units?: { value: string; label: string; conversionFactor: number }[];
  defaultUnit?: string;
  prefix?: string;
  suffix?: string;
  dependsOn?: string;
  maxDependency?: string;
  helpText?: string;
  visibleWhen?: Record<string, string[]>;
}

export interface OutputField {
  id: string;
  label: string;
  type: OutputType;
  format?: 'currency' | 'percentage' | 'number' | 'date' | 'text';
  precision?: number;
  highlight?: boolean;
  description?: string;
  chartConfig?: {
    xLabel?: string;
    yLabel?: string;
    colors?: string[];
  };
  columns?: { key: string; label: string; format?: string }[];
  gaugeConfig?: {
    min: number;
    max: number;
    ranges: { min: number; max: number; label: string; color: string }[];
  };
}

export interface TabDefinition {
  id: string;
  label: string;
  description?: string;
  defaultInputOverrides: Record<string, unknown>;
  visibleInputs?: string[];
}

export interface CalculatorSpec {
  // Identity
  id: string;
  title: string;
  slug: string;
  category: Category;
  subcategory: string;

  // SEO
  primaryKeyword: string;
  secondaryKeywords?: string[];
  metaTitle: string;
  metaDescription: string;

  // Calculator Logic
  inputs: InputField[];
  outputs: OutputField[];
  formula: string;
  features: Feature[];
  tabs?: TabDefinition[];

  // Content
  relatedCalculators: string[];
  glossaryTerms?: string[];
  methodologyTopics?: string[];
  disclaimer: DisclaimerType;
  hasFAQ: boolean;
  hasMethodologyPage: boolean;
  requiresSources: boolean;  // true = data-dependent (show Methodology & Sources), false = formula-only (show How This Is Calculated)

  // Operational (v2)
  editorialStatus: EditorialStatus;
  reviewOwner: string;
  formulaSource: string;
  formulaCitation: string;
  formulaAuditDate: string;
  priority: Priority;
  targetIntent: TargetIntent;
  monetizationType: MonetizationType;
  mergeCandidateOf: string | null;
  duplicationRisk: string[];
  qualityScore: number;
  lastContentUpdate: string;
  seasonality: string | null;
  articleWordTarget: number;
  speakableSelectors: string[];

  // Optional per-calculator override for the interpretation section heading.
  // Falls back to category/subcategory defaults via getInterpretationHeading().
  interpretationHeading?: string;

  // Optional per-calculator heading overrides for any article section.
  // Keys are ArticleSectionType values (e.g. 'keyFactors', 'assumptions').
  // When set, these override both the MDX heading and category defaults.
  sectionHeadings?: Partial<Record<string, string>>;
}

// ═══════════════════════════════════════════════════════
// Category & Subcategory Definitions
// ═══════════════════════════════════════════════════════

export interface SubcategoryDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  calculators: string[];
}

export interface CategoryDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  metaTitle: string;
  metaDescription: string;
  subcategories: SubcategoryDefinition[];
  featuredCalculators: string[];
}

// ═══════════════════════════════════════════════════════
// Formula Module Interface
// ═══════════════════════════════════════════════════════

export type FormulaFunction = (inputs: Record<string, unknown>) => Record<string, unknown>;

// ═══════════════════════════════════════════════════════
// Content Types
// ═══════════════════════════════════════════════════════

export interface GlossaryTerm {
  slug: string;
  title: string;
  relatedCalculators: string[];
}

export interface MethodologyTopic {
  slug: string;
  title: string;
  relatedCalculators: string[];
}

export interface MethodologyPage {
  slug: string;
  title: string;
  relatedCalculators: string[];
  content: string;
}
