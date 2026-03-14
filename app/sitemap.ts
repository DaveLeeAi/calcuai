import type { MetadataRoute } from 'next';
import { getAllCategories, getAllSpecs, getAllGlossaryTerms, getAllMethodologyTopics } from '@/lib/content-loader';
import { siteConfig } from '@/lib/site-config';
import salesTaxData from '@/content/data/us-sales-tax-2026.json';
import electricityData from '@/content/data/us-electricity-rates-2026.json';

function stateNameToSlug(stateName: string): string {
  return (
    stateName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '-sales-tax'
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const categories = getAllCategories();
  const specs = getAllSpecs();
  const glossaryTerms = getAllGlossaryTerms();
  const baseUrl = siteConfig.url;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/${cat.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Subcategory hub pages (only those with 4+ calculators that generate actual routes)
  const subcategoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) =>
    cat.subcategories
      .filter((sub) => sub.calculators.length >= 4)
      .map((sub) => ({
        url: `${baseUrl}/${cat.slug}/${sub.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
  );

  const calculatorPages: MetadataRoute.Sitemap = specs
    .filter((spec) => spec.editorialStatus !== 'draft')
    .map((spec) => ({
    url: `${baseUrl}/${spec.category}/${spec.slug}`,
    ...(spec.lastContentUpdate ? { lastModified: new Date(spec.lastContentUpdate) } : {}),
    changeFrequency: 'monthly' as const,
    priority: spec.priority === 'flagship' ? 0.9 : spec.priority === 'standard' ? 0.7 : 0.5,
  }));

  const glossaryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/glossary`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    ...glossaryTerms.map((term) => ({
      url: `${baseUrl}/glossary/${term.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];

  const methodologyTopics = getAllMethodologyTopics();
  const methodologyPages: MetadataRoute.Sitemap = [
    // Include methodology index page when topics exist
    ...(methodologyTopics.length > 0
      ? [{
          url: `${baseUrl}/methodology`,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }]
      : []),
    ...methodologyTopics.map((topic) => ({
      url: `${baseUrl}/methodology/${topic.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  // Programmatic state sales tax pages (51 entries)
  const stateSalesTaxPages: MetadataRoute.Sitemap = (
    salesTaxData.states as { stateName: string }[]
  ).map((state) => ({
    url: `${baseUrl}/finance/${stateNameToSlug(state.stateName)}`,
    lastModified: new Date(salesTaxData.lastVerified),
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  // Programmatic state electricity rate pages (51 entries)
  const stateElectricityPages: MetadataRoute.Sitemap = (
    electricityData.states as { stateName: string }[]
  ).map((state) => ({
    url: `${baseUrl}/energy/${state.stateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-electricity-rates`,
    lastModified: new Date(electricityData.effectiveDate),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...subcategoryPages,
    ...calculatorPages,
    ...glossaryPages,
    ...methodologyPages,
    ...stateSalesTaxPages,
    ...stateElectricityPages,
  ];
}
