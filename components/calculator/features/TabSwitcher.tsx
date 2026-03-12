'use client';

import { TabDefinition } from '@/lib/types';

interface TabSwitcherProps {
  tabs: TabDefinition[];
  activeTab: string | null;
  onChange: (tabId: string) => void;
}

export default function TabSwitcher({ tabs, activeTab, onChange }: TabSwitcherProps) {
  return (
    <div className="mb-6 border-b border-gray-200 dark:border-slate-700">
      <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="Calculator modes">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-500 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
