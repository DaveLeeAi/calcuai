import type { MetadataRoute } from 'next';
import { getAllCategories, getAllSpecs, getAllGlossaryTerms, getAllMethodologyTopics } from '@/lib/content-loader';
import { siteConfig } from '@/lib/site-config';

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

  const calculatorPages: MetadataRoute.Sitemap = specs.map((spec) => ({
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

  return [...staticPages, ...categoryPages, ...subcategoryPages, ...calculatorPages, ...glossaryPages, ...methodologyPages];
}
