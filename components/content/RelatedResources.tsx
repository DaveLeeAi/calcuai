import Link from 'next/link';

interface RelatedItem {
  id: string;
  title: string;
  href: string;
}

interface RelatedResourcesProps {
  /** Related calculators — rendered as primary links */
  calculators?: RelatedItem[];
  /** Related glossary terms — rendered with definition icon */
  glossaryTerms?: RelatedItem[];
  /** Related methodology topics — rendered with formula icon */
  methodologyTopics?: RelatedItem[];
}

/**
 * Renders related resources across content types: calculators, glossary terms,
 * and methodology topics. Each section only renders if items are provided.
 *
 * Replaces RelatedCalculators on pages that need cross-content-type linking
 * while maintaining the same visual style for calculator links.
 */
export function RelatedResources({
  calculators = [],
  glossaryTerms = [],
  methodologyTopics = [],
}: RelatedResourcesProps) {
  const hasCalcs = calculators.length > 0;
  const hasGlossary = glossaryTerms.length > 0;
  const hasMethodology = methodologyTopics.length > 0;

  if (!hasCalcs && !hasGlossary && !hasMethodology) return null;

  return (
    <div className="max-w-content mx-auto mt-12 space-y-8">
      {/* Related Calculators */}
      {hasCalcs && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Related Calculators
          </h2>
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
      )}

      {/* Related Glossary Terms */}
      {hasGlossary && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Key Terms
          </h2>
          <div className="flex flex-wrap gap-2">
            {glossaryTerms.map((term) => (
              <Link
                key={term.id}
                href={term.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-colors"
              >
                <span className="text-gray-400 text-xs">📖</span>
                {term.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Methodology Topics */}
      {hasMethodology && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Formula Deep-Dives
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {methodologyTopics.map((topic) => (
              <Link
                key={topic.id}
                href={topic.href}
                className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-sm"
              >
                <span className="text-indigo-400 text-xs">∑</span>
                {topic.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
