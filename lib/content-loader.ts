import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { CalculatorSpec, CategoryDefinition, GlossaryTerm, MethodologyTopic } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const CATEGORIES_DIR = path.join(CONTENT_DIR, 'categories');
const CALCULATORS_DIR = path.join(CONTENT_DIR, 'calculators');
const GLOSSARY_DIR = path.join(CONTENT_DIR, 'glossary');
const METHODOLOGY_DIR = path.join(CONTENT_DIR, 'methodology');

// ═══════════════════════════════════════════════════════
// Category Loading
// ═══════════════════════════════════════════════════════

export function getAllCategories(): CategoryDefinition[] {
  const files = fs.readdirSync(CATEGORIES_DIR).filter(f => f.endsWith('.json'));
  return files.map(file => {
    const raw = fs.readFileSync(path.join(CATEGORIES_DIR, file), 'utf-8');
    return JSON.parse(raw) as CategoryDefinition;
  });
}

export function getCategory(slug: string): CategoryDefinition | null {
  const filePath = path.join(CATEGORIES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as CategoryDefinition;
}

// ═══════════════════════════════════════════════════════
// Calculator Spec Loading
// ═══════════════════════════════════════════════════════

export function getAllSpecs(): CalculatorSpec[] {
  const specs: CalculatorSpec[] = [];
  const categories = fs.readdirSync(CALCULATORS_DIR);

  for (const cat of categories) {
    const catDir = path.join(CALCULATORS_DIR, cat);
    if (!fs.statSync(catDir).isDirectory()) continue;

    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.spec.json'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(catDir, file), 'utf-8');
      specs.push(JSON.parse(raw) as CalculatorSpec);
    }
  }

  return specs;
}

export function getSpec(category: string, slug: string): CalculatorSpec | null {
  const filePath = path.join(CALCULATORS_DIR, category, `${slug}.spec.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as CalculatorSpec;
}

export function getSpecsByCategory(category: string): CalculatorSpec[] {
  const catDir = path.join(CALCULATORS_DIR, category);
  if (!fs.existsSync(catDir)) return [];

  const files = fs.readdirSync(catDir).filter(f => f.endsWith('.spec.json'));
  return files.map(file => {
    const raw = fs.readFileSync(path.join(catDir, file), 'utf-8');
    return JSON.parse(raw) as CalculatorSpec;
  });
}

// ═══════════════════════════════════════════════════════
// MDX Content Loading
// ═══════════════════════════════════════════════════════

export function getCalculatorMDX(category: string, slug: string): string | null {
  const filePath = path.join(CALCULATORS_DIR, category, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

// ═══════════════════════════════════════════════════════
// Slug Resolution
// ═══════════════════════════════════════════════════════

export type SlugResolution =
  | { type: 'calculator'; spec: CalculatorSpec }
  | { type: 'subcategory'; category: CategoryDefinition; subcategory: string }
  | { type: 'not-found' };

export function resolveSlug(category: string, slug: string): SlugResolution {
  // 1. Check if it's a calculator
  const spec = getSpec(category, slug);
  if (spec) return { type: 'calculator', spec };

  // 2. Check if it's a subcategory with 4+ calculators
  const catDef = getCategory(category);
  if (catDef) {
    const subcat = catDef.subcategories.find(s => s.slug === slug);
    if (subcat && subcat.calculators.length >= 4) {
      return { type: 'subcategory', category: catDef, subcategory: slug };
    }
  }

  return { type: 'not-found' };
}

// ═══════════════════════════════════════════════════════
// Glossary Loading
// ═══════════════════════════════════════════════════════

export function getAllGlossaryTerms(): GlossaryTerm[] {
  if (!fs.existsSync(GLOSSARY_DIR)) return [];

  const files = fs.readdirSync(GLOSSARY_DIR).filter(f => f.endsWith('.mdx'));
  return files.map(file => {
    const raw = fs.readFileSync(path.join(GLOSSARY_DIR, file), 'utf-8');
    const { data } = matter(raw);
    return {
      title: data.title as string,
      slug: data.slug as string,
      relatedCalculators: (data.relatedCalculators as string[]) || [],
    };
  });
}

export function getGlossaryTerm(slug: string): { frontmatter: GlossaryTerm; content: string } | null {
  const filePath = path.join(GLOSSARY_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    frontmatter: {
      title: data.title as string,
      slug: data.slug as string,
      relatedCalculators: (data.relatedCalculators as string[]) || [],
    },
    content,
  };
}

// ═══════════════════════════════════════════════════════
// Methodology Loading
// ═══════════════════════════════════════════════════════

export function getAllMethodologyTopics(): MethodologyTopic[] {
  if (!fs.existsSync(METHODOLOGY_DIR)) return [];

  const files = fs.readdirSync(METHODOLOGY_DIR).filter(f => f.endsWith('.mdx'));
  return files.map(file => {
    const raw = fs.readFileSync(path.join(METHODOLOGY_DIR, file), 'utf-8');
    const { data } = matter(raw);
    return {
      title: data.title as string,
      slug: data.slug as string,
      relatedCalculators: (data.relatedCalculators as string[]) || [],
    };
  });
}

export function getMethodologyTopic(slug: string): { frontmatter: MethodologyTopic; content: string } | null {
  const filePath = path.join(METHODOLOGY_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    frontmatter: {
      title: data.title as string,
      slug: data.slug as string,
      relatedCalculators: (data.relatedCalculators as string[]) || [],
    },
    content,
  };
}
