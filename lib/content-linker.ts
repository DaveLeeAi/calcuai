/**
 * content-linker.ts — Build-time utility for cross-content-type link resolution.
 *
 * Maps calculators ↔ glossary terms ↔ methodology topics based on
 * keyword matching and explicit frontmatter references.
 */
import {
  getAllSpecs,
  getAllGlossaryTerms,
  getAllMethodologyTopics,
} from './content-loader';
import type { CalculatorSpec, GlossaryTerm, MethodologyTopic } from './types';

interface ResolvedLink {
  id: string;
  title: string;
  href: string;
}

/**
 * Given a calculator spec, find glossary terms that are relevant to it.
 *
 * Matching rules:
 * 1. Glossary term's relatedCalculators explicitly includes this calculator
 * 2. Calculator's glossaryTerms field explicitly includes this term (if populated)
 * 3. Glossary term slug appears in the calculator's primaryKeyword or subcategory
 */
export function getGlossaryTermsForCalculator(
  spec: CalculatorSpec,
  allTerms?: GlossaryTerm[]
): ResolvedLink[] {
  const terms = allTerms ?? getAllGlossaryTerms();
  const matched: ResolvedLink[] = [];
  const seen = new Set<string>();

  for (const term of terms) {
    // Rule 1: glossary explicitly lists this calculator
    const explicitMatch = term.relatedCalculators.includes(spec.id);

    // Rule 2: calculator explicitly lists this glossary term
    const specGlossary = (spec as CalculatorSpec & { glossaryTerms?: string[] }).glossaryTerms;
    const specMatch = specGlossary?.includes(term.slug) ?? false;

    // Rule 3: keyword overlap — term slug appears in spec's primary keyword or subcategory
    const slugNormalized = term.slug.replace(/-/g, ' ');
    const keywordMatch =
      spec.primaryKeyword.toLowerCase().includes(slugNormalized) ||
      spec.subcategory.replace(/-/g, ' ').includes(slugNormalized);

    if ((explicitMatch || specMatch || keywordMatch) && !seen.has(term.slug)) {
      seen.add(term.slug);
      matched.push({
        id: term.slug,
        title: term.title,
        href: `/glossary/${term.slug}`,
      });
    }
  }

  return matched;
}

/**
 * Given a calculator spec, find methodology topics that are relevant to it.
 *
 * Matching rules:
 * 1. Methodology topic's relatedCalculators explicitly includes this calculator
 * 2. Calculator's methodologyTopics field explicitly includes this topic (if populated)
 * 3. Calculator's hasMethodologyPage is true and topic slug relates to the formula name
 */
export function getMethodologyTopicsForCalculator(
  spec: CalculatorSpec,
  allTopics?: MethodologyTopic[]
): ResolvedLink[] {
  const topics = allTopics ?? getAllMethodologyTopics();
  const matched: ResolvedLink[] = [];
  const seen = new Set<string>();

  for (const topic of topics) {
    // Rule 1: methodology explicitly lists this calculator
    const explicitMatch = topic.relatedCalculators.includes(spec.id);

    // Rule 2: calculator explicitly lists this methodology topic
    const specMethodology = (spec as CalculatorSpec & { methodologyTopics?: string[] }).methodologyTopics;
    const specMatch = specMethodology?.includes(topic.slug) ?? false;

    // Rule 3: formula-name overlap
    const formulaNormalized = spec.formula.replace(/-/g, ' ').toLowerCase();
    const topicNormalized = topic.slug.replace(/-/g, ' ').toLowerCase();
    const formulaMatch =
      spec.hasMethodologyPage &&
      (formulaNormalized.includes(topicNormalized) ||
        topicNormalized.includes(formulaNormalized));

    if ((explicitMatch || specMatch || formulaMatch) && !seen.has(topic.slug)) {
      seen.add(topic.slug);
      matched.push({
        id: topic.slug,
        title: topic.title,
        href: `/methodology/${topic.slug}`,
      });
    }
  }

  return matched;
}

/**
 * Given a glossary term, find methodology topics that cover the same concept.
 */
export function getMethodologyForGlossaryTerm(
  term: GlossaryTerm,
  allTopics?: MethodologyTopic[]
): ResolvedLink[] {
  const topics = allTopics ?? getAllMethodologyTopics();
  const matched: ResolvedLink[] = [];

  for (const topic of topics) {
    // Match if the glossary term slug appears in the methodology topic slug
    // e.g., glossary "compound-interest" matches methodology "compound-interest"
    const termNormalized = term.slug.replace(/-/g, ' ');
    const topicNormalized = topic.slug.replace(/-/g, ' ');

    if (
      topicNormalized.includes(termNormalized) ||
      termNormalized.includes(topicNormalized)
    ) {
      matched.push({
        id: topic.slug,
        title: topic.title,
        href: `/methodology/${topic.slug}`,
      });
    }
  }

  return matched;
}

/**
 * Given a methodology topic, find glossary terms that relate to the same concept.
 */
export function getGlossaryForMethodologyTopic(
  topic: MethodologyTopic,
  allTerms?: GlossaryTerm[]
): ResolvedLink[] {
  const terms = allTerms ?? getAllGlossaryTerms();
  const matched: ResolvedLink[] = [];

  for (const term of terms) {
    const termNormalized = term.slug.replace(/-/g, ' ');
    const topicNormalized = topic.slug.replace(/-/g, ' ');

    if (
      topicNormalized.includes(termNormalized) ||
      termNormalized.includes(topicNormalized)
    ) {
      matched.push({
        id: term.slug,
        title: term.title,
        href: `/glossary/${term.slug}`,
      });
    }
  }

  return matched;
}
