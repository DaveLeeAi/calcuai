/**
 * Central site configuration — single source of truth for brand and domain.
 * Update values here to rebrand the entire site.
 *
 * Set NEXT_PUBLIC_SITE_URL in your environment to override the base URL
 * per deployment (e.g. staging vs production).
 */
export const siteConfig = {
  name: 'CalcuAI',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calcuai.com',
  description:
    'Free online calculators for finance, health, math, construction, and more. Accurate, fast, no signup required.',
  contactEmail: 'contact@calcuai.com',
} as const;
