import Link from 'next/link';

interface RelatedCalculator {
  id: string;
  title: string;
  href: string;
}

interface RelatedCalculatorsProps {
  calculators: RelatedCalculator[];
}

/**
 * Renders a grid of 4-6 related calculator links.
 * Priority: same subcategory (min 2), same category different subcategory (min 1),
 * cross-category with shared user intent (max 2).
 */
export function RelatedCalculators({ calculators }: RelatedCalculatorsProps) {
  if (calculators.length === 0) return null;

  return (
    <section className="max-w-content mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Calculators</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {calculators.map((calc) => (
          <Link
            key={calc.id}
            href={calc.href}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-brand-600 shadow-sm transition-all hover:shadow-md hover:border-brand-300 hover:-translate-y-0.5"
          >
            <span className="text-brand-400">→</span>
            {calc.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
