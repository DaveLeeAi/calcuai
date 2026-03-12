import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        The calculator or page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
        >
          Browse All Calculators
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Search Calculators
        </Link>
      </div>
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <Link href="/finance" className="text-brand-600 hover:text-brand-700 hover:underline">
          Finance
        </Link>
        <Link href="/health" className="text-brand-600 hover:text-brand-700 hover:underline">
          Health
        </Link>
        <Link href="/math" className="text-brand-600 hover:text-brand-700 hover:underline">
          Math
        </Link>
        <Link href="/everyday" className="text-brand-600 hover:text-brand-700 hover:underline">
          Everyday
        </Link>
        <Link href="/business" className="text-brand-600 hover:text-brand-700 hover:underline">
          Business
        </Link>
        <Link href="/construction" className="text-brand-600 hover:text-brand-700 hover:underline">
          Construction
        </Link>
        <Link href="/science" className="text-brand-600 hover:text-brand-700 hover:underline">
          Science
        </Link>
        <Link href="/conversion" className="text-brand-600 hover:text-brand-700 hover:underline">
          Conversion
        </Link>
      </div>
    </div>
  );
}
