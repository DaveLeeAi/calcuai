'use client';

import { OutputComponentProps, formatValue } from './types';

interface ValueItem {
  label: string;
  value: unknown;
}

export default function ValueGroup({ field, data }: OutputComponentProps) {
  const groupData = data[field.id];

  // Accept an array of {label, value} or a record
  let items: ValueItem[] = [];
  if (Array.isArray(groupData)) {
    items = groupData as ValueItem[];
  } else if (typeof groupData === 'object' && groupData !== null) {
    items = Object.entries(groupData as Record<string, unknown>).map(([key, val]) => ({
      label: key,
      value: val,
    }));
  }

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-slate-700/50 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
        {field.label}
      </h4>
      {field.description && (
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-3 -mt-1">{field.description}</p>
      )}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex flex-col rounded-lg border border-gray-100 dark:border-slate-600 bg-white dark:bg-slate-800 p-3 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500 mb-1">
              {item.label}
            </span>
            <span className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
              {formatValue(item.value, field.format, field.precision)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
