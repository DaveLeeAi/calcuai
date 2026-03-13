'use client';

import { useState, useEffect, useCallback } from 'react';

interface FeedbackWidgetProps {
  calculatorSlug: string;
  calculatorTitle: string;
  inline?: boolean;
}

type FeedbackStep = 'idle' | 'positive' | 'negative' | 'submitted';

interface FeedbackData {
  calculatorSlug: string;
  calculatorTitle: string;
  vote: 'yes' | 'no';
  reasons?: string[];
  comment?: string;
  timestamp: string;
}

const NEGATIVE_REASONS = [
  'Calculator didn\'t give expected results',
  'Missing a feature or option I needed',
  'Results were hard to understand',
  'Content wasn\'t helpful enough',
  'Other',
];

function ThumbsUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function ThumbsDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  );
}

export default function FeedbackWidget({ calculatorSlug, calculatorTitle, inline = false }: FeedbackWidgetProps) {
  const [step, setStep] = useState<FeedbackStep>('idle');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  const storageKey = `calcuai-feedback-${calculatorSlug}`;

  // Check localStorage for existing feedback on mount (non-inline only)
  useEffect(() => {
    setIsHydrated(true);
    if (inline) return;
    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) {
        setStep('submitted');
      }
    } catch {
      // localStorage unavailable — proceed as idle
    }
  }, [storageKey, inline]);

  const saveFeedback = useCallback(
    (vote: 'yes' | 'no', reasons?: string[], userComment?: string) => {
      const data: FeedbackData = {
        calculatorSlug,
        calculatorTitle,
        vote,
        reasons: reasons && reasons.length > 0 ? reasons : undefined,
        comment: userComment && userComment.trim() ? userComment.trim() : undefined,
        timestamp: new Date().toISOString(),
      };

      if (!inline) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(data));
        } catch {
          // localStorage full or unavailable
        }
      }

      // Dispatch custom event for analytics (GTM, GA, etc.)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('calcuai:feedback', { detail: data })
        );
      }

      setStep('submitted');
    },
    [calculatorSlug, calculatorTitle, storageKey, inline]
  );

  const handleYes = useCallback(() => {
    setStep('positive');
  }, []);

  const handleNo = useCallback(() => {
    setStep('negative');
  }, []);

  const handlePositiveSubmit = useCallback(() => {
    saveFeedback('yes', undefined, comment);
  }, [saveFeedback, comment]);

  const handlePositiveSkip = useCallback(() => {
    saveFeedback('yes');
  }, [saveFeedback]);

  const handleNegativeSubmit = useCallback(() => {
    saveFeedback('no', selectedReasons, comment);
  }, [saveFeedback, selectedReasons, comment]);

  const toggleReason = useCallback((reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  }, []);

  // Don't render until hydrated to avoid flash
  if (!isHydrated) return null;

  // Already submitted
  if (step === 'submitted') {
    if (inline) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircleIcon className="w-3.5 h-3.5" />
          Thanks!
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-calculator mt-6">
        <div className="flex items-center gap-3 rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20 px-5 py-4">
          <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm text-green-800 dark:text-green-300">
            Thank you for your feedback! It helps us improve our calculators.
          </p>
        </div>
      </div>
    );
  }

  // Initial question
  if (step === 'idle') {
    if (inline) {
      return (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-slate-400">Helpful?</span>
          <button
            onClick={handleYes}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-500 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            type="button"
            aria-label="Yes, this was helpful"
          >
            <ThumbsUpIcon className="w-3.5 h-3.5" />
            Yes
          </button>
          <button
            onClick={handleNo}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            type="button"
            aria-label="No, this was not helpful"
          >
            <ThumbsDownIcon className="w-3.5 h-3.5" />
            No
          </button>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-calculator mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Was this calculator helpful?
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleYes}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors hover:border-green-300 hover:bg-green-50 dark:hover:border-green-700 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400"
              type="button"
            >
              <ThumbsUpIcon className="w-4 h-4" />
              Yes
            </button>
            <button
              onClick={handleNo}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 transition-colors hover:border-red-300 hover:bg-red-50 dark:hover:border-red-700 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400"
              type="button"
            >
              <ThumbsDownIcon className="w-4 h-4" />
              No
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Positive follow-up
  if (step === 'positive') {
    if (inline) {
      return (
        <div className="relative">
          <div className="absolute bottom-full right-0 mb-2 w-72 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg p-4 z-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Glad we could help!</p>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you find most helpful? (optional)"
              rows={2}
              className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button onClick={handlePositiveSkip} className="text-xs text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200" type="button">Skip</button>
              <button onClick={handlePositiveSubmit} className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600" type="button">Send</button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            Thanks!
          </div>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-calculator mt-6">
        <div className="rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Glad we could help!
            </p>
          </div>
          <label
            htmlFor="positive-comment"
            className="block text-sm text-gray-600 dark:text-slate-400 mb-2"
          >
            Anything else you&apos;d like to share? (optional)
          </label>
          <textarea
            id="positive-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you find most helpful?"
            rows={2}
            className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none"
          />
          <div className="flex items-center justify-end gap-3 mt-3">
            <button
              onClick={handlePositiveSkip}
              className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
              type="button"
            >
              Skip
            </button>
            <button
              onClick={handlePositiveSubmit}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              type="button"
            >
              Send feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Negative follow-up
  if (step === 'negative') {
    if (inline) {
      return (
        <div className="relative">
          <div className="absolute bottom-full right-0 mb-2 w-80 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg p-4 z-50">
            <p className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-3">What could be better?</p>
            <div className="space-y-1.5 mb-3">
              {NEGATIVE_REASONS.map((reason) => (
                <label key={reason} className="flex items-center gap-2 cursor-pointer">
                  <span className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-colors shrink-0 ${
                    selectedReasons.includes(reason) ? 'border-brand-500 bg-brand-500' : 'border-gray-300 dark:border-slate-500'
                  }`}>
                    {selectedReasons.includes(reason) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <input type="checkbox" checked={selectedReasons.includes(reason)} onChange={() => toggleReason(reason)} className="sr-only" />
                  <span className="text-xs text-gray-700 dark:text-slate-300">{reason}</span>
                </label>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any details? (optional)"
              rows={2}
              className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-xs text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
            />
            <div className="flex items-center justify-end mt-2">
              <button onClick={handleNegativeSubmit} className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600" type="button">Send</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-slate-400">Helpful?</span>
            <span className="text-sm text-red-500">👎</span>
          </div>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-calculator mt-6">
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-4">
            We&apos;d love to improve. What could be better?
          </p>

          <div className="space-y-2 mb-4">
            {NEGATIVE_REASONS.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors shrink-0 ${
                    selectedReasons.includes(reason)
                      ? 'border-brand-500 bg-brand-500'
                      : 'border-gray-300 dark:border-slate-500 group-hover:border-brand-400'
                  }`}
                >
                  {selectedReasons.includes(reason) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={selectedReasons.includes(reason)}
                  onChange={() => toggleReason(reason)}
                  className="sr-only"
                />
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  {reason}
                </span>
              </label>
            ))}
          </div>

          <label
            htmlFor="negative-comment"
            className="block text-sm text-gray-600 dark:text-slate-400 mb-2"
          >
            Tell us more (optional)
          </label>
          <textarea
            id="negative-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any additional details that would help us improve..."
            rows={3}
            className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none"
          />
          <div className="flex items-center justify-end mt-3">
            <button
              onClick={handleNegativeSubmit}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              type="button"
            >
              Send feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
