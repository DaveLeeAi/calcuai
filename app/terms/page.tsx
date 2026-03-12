import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Terms of Service — ${siteConfig.name}`,
  description: `Terms of service for ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/terms` },
  openGraph: {
    title: `Terms of Service — ${siteConfig.name}`,
    description: `Terms of service for ${siteConfig.name}.`,
    url: `${siteConfig.url}/terms`,
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Terms of Service — ${siteConfig.name}`,
    description: `Terms of service for ${siteConfig.name}.`,
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="max-w-content mx-auto">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Terms of Service' }]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
      <div className="prose prose-gray max-w-none">
        <p>Terms of service coming soon.</p>
      </div>
    </div>
  );
}
