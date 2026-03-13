'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

function stateNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-sales-tax';
}

interface StateTaxRecord {
  stateCode: string;
  stateName: string;
  fips: string;
  stateTaxRate: number;
  avgLocalTaxRate: number;
  combinedRate: number;
  groceryTaxStatus: string;
  groceryTaxRate?: number | null;
  clothingTaxStatus: string;
  clothingTaxNote?: string;
  changedFrom2025: boolean;
  changeNote: string | null;
}

type SortKey =
  | 'stateName'
  | 'stateTaxRate'
  | 'avgLocalTaxRate'
  | 'combinedRate'
  | 'groceryTaxStatus'
  | 'clothingTaxStatus';
type SortDir = 'asc' | 'desc';

interface StateTaxTableProps {
  data: StateTaxRecord[];
  onStateClick?: (stateCode: string, combinedRate: number) => void;
}

function formatRate(rate: number): string {
  return rate === 0 ? '0.00%' : `${rate.toFixed(2)}%`;
}

function GroceryBadge({ status, rate }: { status: string; rate?: number | null }) {
  if (status === 'exempt' || status === 'N/A') {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
        {status === 'N/A' ? 'No tax' : 'Exempt'}
      </span>
    );
  }
  if (status === 'reduced') {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-400">
        Reduced{rate != null ? ` (${rate}%)` : ''}
      </span>
    );
  }
  if (status === 'taxed') {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
        Full rate{rate != null && rate > 0 ? ` (${rate}%)` : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
      Varies
    </span>
  );
}

function ClothingBadge({ status, note }: { status: string; note?: string }) {
  if (status === 'exempt' || status === 'N/A') {
    return (
      <span
        className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400"
        title={note}
      >
        {status === 'N/A' ? 'No tax' : note ? 'Partial' : 'Exempt'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
      Taxed
    </span>
  );
}

export default function StateTaxTable({ data, onStateClick }: StateTaxTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('combinedRate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir(key === 'stateName' ? 'asc' : 'desc');
      }
    },
    [sortKey]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (s) =>
        s.stateName.toLowerCase().includes(q) ||
        s.stateCode.toLowerCase().includes(q)
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'stateName':
          cmp = a.stateName.localeCompare(b.stateName);
          break;
        case 'stateTaxRate':
          cmp = a.stateTaxRate - b.stateTaxRate;
          break;
        case 'avgLocalTaxRate':
          cmp = a.avgLocalTaxRate - b.avgLocalTaxRate;
          break;
        case 'combinedRate':
          cmp = a.combinedRate - b.combinedRate;
          break;
        case 'groceryTaxStatus':
          cmp = a.groceryTaxStatus.localeCompare(b.groceryTaxStatus);
          break;
        case 'clothingTaxStatus':
          cmp = a.clothingTaxStatus.localeCompare(b.clothingTaxStatus);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const SortHeader = ({
    label,
    field,
    className,
  }: {
    label: string;
    field: SortKey;
    className?: string;
  }) => (
    <th
      className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-200 transition-colors ${className || ''}`}
      onClick={() => handleSort(field)}
      role="columnheader"
      aria-sort={
        sortKey === field
          ? sortDir === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === field && (
          <span className="text-brand-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-700">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by state name..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            aria-label="Filter states"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700" role="table">
          <thead className="bg-gray-50 dark:bg-slate-800/80">
            <tr>
              <SortHeader label="State" field="stateName" className="sticky left-0 bg-gray-50 dark:bg-slate-800/80 z-10" />
              <SortHeader label="State Rate" field="stateTaxRate" />
              <SortHeader label="Avg. Local" field="avgLocalTaxRate" />
              <SortHeader label="Combined" field="combinedRate" />
              <SortHeader label="Grocery" field="groceryTaxStatus" />
              <SortHeader label="Clothing" field="clothingTaxStatus" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {sorted.map((state) => {
              const isNoTax = state.combinedRate === 0;
              const isChanged = state.changedFrom2025;

              return (
                <tr
                  key={state.stateCode}
                  className={`transition-colors ${
                    isNoTax
                      ? 'bg-green-50/50 dark:bg-green-900/10'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  } ${onStateClick ? 'cursor-pointer' : ''}`}
                  onClick={
                    onStateClick
                      ? () => onStateClick(state.stateCode, state.combinedRate)
                      : undefined
                  }
                  role={onStateClick ? 'button' : undefined}
                  tabIndex={onStateClick ? 0 : undefined}
                  onKeyDown={
                    onStateClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onStateClick(state.stateCode, state.combinedRate);
                          }
                        }
                      : undefined
                  }
                >
                  <td className="sticky left-0 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-medium whitespace-nowrap z-10">
                    <span className="inline-flex items-center gap-2">
                      <Link
                        href={`/finance/${stateNameToSlug(state.stateName)}`}
                        className="text-brand-600 dark:text-brand-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {state.stateName}
                      </Link>
                      {isNoTax && (
                        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">
                          NO TAX
                        </span>
                      )}
                      {isChanged && (
                        <span
                          className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400"
                          title={state.changeNote || '2026 change'}
                        >
                          2026
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-slate-300 tabular-nums">
                    {formatRate(state.stateTaxRate)}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-slate-300 tabular-nums">
                    {formatRate(state.avgLocalTaxRate)}
                  </td>
                  <td className="px-3 py-2.5 text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                    {formatRate(state.combinedRate)}
                  </td>
                  <td className="px-3 py-2.5">
                    <GroceryBadge
                      status={state.groceryTaxStatus}
                      rate={state.groceryTaxRate}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <ClothingBadge
                      status={state.clothingTaxStatus}
                      note={state.clothingTaxNote}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-2">
        <p className="text-xs text-gray-400 dark:text-slate-500">
          {sorted.length} of {data.length} states shown. Combined rates = state + average local.
          Source: Tax Foundation, 2026. Click any state name for detailed rates, exemptions, and examples.
        </p>
      </div>
    </div>
  );
}
