import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Privacy Policy — ${siteConfig.name}`,
  description: `Privacy policy for ${siteConfig.name}. Learn how we handle your data.`,
  alternates: { canonical: `${siteConfig.url}/privacy` },
  openGraph: {
    title: `Privacy Policy — ${siteConfig.name}`,
    description: `Privacy policy for ${siteConfig.name}. Learn how we handle your data.`,
    url: `${siteConfig.url}/privacy`,
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Privacy Policy — ${siteConfig.name}`,
    description: `Privacy policy for ${siteConfig.name}. Learn how we handle your data.`,
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-content mx-auto">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none">
        <p>
          Privacy policy coming soon. For questions, contact{' '}
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
