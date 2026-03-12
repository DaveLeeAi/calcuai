import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `About ${siteConfig.name}`,
  description: 'Free, accurate, and fast online calculators. Learn about our quality standards and methodology.',
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: `About ${siteConfig.name}`,
    description: 'Free, accurate, and fast online calculators. Learn about our quality standards and methodology.',
    url: `${siteConfig.url}/about`,
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `About ${siteConfig.name}`,
    description: 'Free, accurate, and fast online calculators. Learn about our quality standards and methodology.',
  },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="max-w-content mx-auto">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">About {siteConfig.name}</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p>
          {siteConfig.name} provides free, accurate, and fast online calculators for finance, health, math,
          construction, business, and everyday use. Every calculator is built with verified formulas,
          tested against known-correct values, and designed for a great user experience on any device.
        </p>
        <h2>Our Quality Standards</h2>
        <p>
          Every calculator on this site passes a rigorous quality process before publication. Formulas
          are sourced from authoritative references (IRS publications, CFA Institute standards, peer-reviewed
          research). Each calculator is tested with 10+ test cases including edge cases. Content is reviewed
          for accuracy, clarity, and genuine usefulness.
        </p>
        <h2>Contact</h2>
        <p>
          Found an error? Have a suggestion? We take accuracy seriously.
          Reach us at <strong>{siteConfig.contactEmail}</strong>.
        </p>
      </div>
    </div>
  );
}
