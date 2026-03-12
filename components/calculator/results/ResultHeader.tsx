'use client';

interface ResultHeaderProps {
  formulaCitation?: string;
}

export default function ResultHeader({ formulaCitation }: ResultHeaderProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="text-lg font-semibold text-gray-900">Your Results</h3>
      {formulaCitation && (
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 border border-brand-100">
          <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 110 14A7 7 0 018 1zm0 3a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-4.5A.75.75 0 008 4zm0 8a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
          Source: {formulaCitation}
        </span>
      )}
    </div>
  );
}
