'use client';

import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CalculatorError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Something went wrong
      </h2>
      <p className="text-gray-600 dark:text-slate-400 mb-6 max-w-md">
        We couldn&apos;t load this calculator. This might be a temporary issue.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-slate-300 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
