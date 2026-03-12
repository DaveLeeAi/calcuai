import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Contact — ${siteConfig.name}`,
  description: `Get in touch with the ${siteConfig.name} team.`,
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    title: `Contact — ${siteConfig.name}`,
    description: `Get in touch with the ${siteConfig.name} team.`,
    url: `${siteConfig.url}/contact`,
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Contact — ${siteConfig.name}`,
    description: `Get in touch with the ${siteConfig.name} team.`,
  },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <div className="max-w-content mx-auto">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Contact</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p>
          Found an error? Have a suggestion? We take accuracy seriously.
        </p>
        <p>
          Reach us at{' '}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
