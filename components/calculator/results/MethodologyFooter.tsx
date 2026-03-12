'use client';

import { DisclaimerType } from '@/lib/types';

interface MethodologyFooterProps {
  formulaCitation?: string;
  formulaSource?: string;
  disclaimer: DisclaimerType;
  slug: string;
}

const DISCLAIMER_TEXT: Record<DisclaimerType, string> = {
  finance:
    'This calculator provides estimates for informational purposes only. It does not constitute financial advice. Consult a qualified financial advisor for personalized guidance.',
  health:
    'This calculator provides estimates based on standard formulas. Results are not a substitute for professional medical advice, diagnosis, or treatment.',
  construction:
    'Estimates are approximations based on standard calculations. Actual material quantities and costs may vary. Consult a licensed contractor for project-specific guidance.',
  general:
    'This calculator provides estimates for informational purposes only. Results may vary based on individual circumstances.',
};

export default function MethodologyFooter({
  formulaCitation,
  formulaSource,
  disclaimer,
  slug,
}: MethodologyFooterProps) {
  return (
    <div className="space-y-2 border-t border-gray-200 pt-3 text-xs text-gray-500">
      {formulaSource && (
        <div className="flex items-start gap-1.5">
          <svg
            className="mt-0.5 h-3 w-3 shrink-0 text-gray-400"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm3 1a.5.5 0 000 1h6a.5.5 0 000-1H5zm0 3a.5.5 0 000 1h6a.5.5 0 000-1H5zm0 3a.5.5 0 000 1h4a.5.5 0 000-1H5z" />
          </svg>
          <span>
            <span className="font-medium text-gray-600">Formula: </span>
            {formulaSource}
            {formulaCitation && (
              <span>
                {' '}
                — <span className="italic">{formulaCitation}</span>
              </span>
            )}
          </span>
        </div>
      )}
      <p className="leading-relaxed text-gray-400">
        {DISCLAIMER_TEXT[disclaimer]}
      </p>
    </div>
  );
}
