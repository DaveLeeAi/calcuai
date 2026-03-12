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
      <h1 className="text-6xl font-bold text-gray-300 dark:text-slate-700 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
      <p className="text-gray-600 dark:text-slate-400 mb-8 max-w-md">
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
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          Search Calculators
        </Link>
      </div>
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <Link href="/finance" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline">
          Finance
        </Link>
        <Link href="/health" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline">
          Health
        </Link>
        <Link href="/math" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline">
          Math
        </Link>
        <Link href="/everyday" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline">
          Everyday
        </Link>
        <Link href="/business" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline">
          Business
        </Link>
        <Link href="/construction" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline">
          Construction
        </Link>
        <Link href="/science" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline">
          Science
        </Link>
        <Link href="/conversion" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline">
          Conversion
        </Link>
      </div>
    </div>
  );
}
