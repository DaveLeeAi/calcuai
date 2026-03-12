import Link from 'next/link';

interface RelatedCalc {
  id: string;
  title: string;
  href: string;
  category?: string;
}

interface RelatedSidebarProps {
  calculators: RelatedCalc[];
}

/**
 * Sidebar card showing related calculators.
 * Desktop: renders below the sticky calculator in the right column.
 * Mobile: renders as a section at the bottom of the article.
 */
export function RelatedSidebar({ calculators }: RelatedSidebarProps) {
  if (calculators.length === 0) return null;

  const categoryLabel = (cat?: string) => {
    if (!cat) return null;
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Similar Calculators
        </h3>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-slate-700">
        {calculators.slice(0, 6).map((calc) => (
          <li key={calc.id}>
            <Link
              href={calc.href}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 group"
            >
              <div className="min-w-0">
                <span className="font-medium text-gray-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                  {calc.title}
                </span>
                {calc.category && (
                  <span className="mt-0.5 block text-xs text-gray-400 dark:text-slate-500">
                    {categoryLabel(calc.category)}
                  </span>
                )}
              </div>
              <svg
                className="h-4 w-4 shrink-0 text-gray-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
