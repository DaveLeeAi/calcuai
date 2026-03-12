import type { Metadata } from 'next';
import { buildSearchItems } from '@/lib/search-index';
import SearchResults from './SearchResults';

export const metadata: Metadata = {
  title: 'Search Calculators',
  description: 'Search across all free online calculators for finance, health, math, construction, and more.',
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? '';
  const items = buildSearchItems();

  return (
    <div className="max-w-content mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Calculators</h1>
      <SearchResults items={items} initialQuery={query} />
    </div>
  );
}
