'use client';

import { OutputComponentProps, formatValue } from './types';

export default function SingleValue({ field, data }: OutputComponentProps) {
  const value = data[field.id];

  if (field.highlight) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/60 dark:from-brand-900/40 dark:to-brand-800/30 border border-brand-200 dark:border-brand-700 p-5 sm:p-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(26,111,160,0.06),_transparent_60%)]" />
        <div className="relative">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-600/80 dark:text-brand-400/80">
            {field.label}
          </span>
          <div className="mt-1.5">
            <span className="text-4xl font-bold tracking-tight text-brand-700 dark:text-brand-300 sm:text-5xl">
              {formatValue(value, field.format, field.precision)}
            </span>
          </div>
          {field.description && (
            <p className="mt-2.5 text-sm leading-relaxed text-brand-600/70 dark:text-brand-400/70 max-w-md mx-auto">
              {field.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center rounded-lg bg-gray-50 dark:bg-slate-700/50 p-4 text-center">
      <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
        {field.label}
      </span>
      <span className="text-2xl font-bold text-gray-900 dark:text-white">
        {formatValue(value, field.format, field.precision)}
      </span>
      {field.description && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400 max-w-sm">
          {field.description}
        </p>
      )}
    </div>
  );
}
