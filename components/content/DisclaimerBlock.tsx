import type { DisclaimerType } from '@/lib/types';

const DISCLAIMERS: Record<DisclaimerType, string> = {
  finance:
    'This calculator provides estimates for informational purposes only and does not constitute financial advice. Results are based on the information you provide and standard formulas. Your actual results may vary based on additional factors. Consult a qualified financial advisor before making financial decisions.',
  health:
    'This calculator provides general estimates based on widely used formulas and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for personalized guidance regarding your health.',
  construction:
    'This calculator provides material estimates based on standard calculations. Actual requirements may vary based on site conditions, material waste, local building codes, and installation methods. Always consult a licensed contractor for project-specific estimates.',
  general:
    'This calculator provides estimates for informational purposes only. Results are based on the information you provide and may vary based on specific circumstances. Use these results as a starting point, not a definitive answer.',
};

interface DisclaimerBlockProps {
  type: DisclaimerType;
}

/**
 * Renders a category-appropriate disclaimer.
 * Disclaimer text is sourced from page-specs.md and must not be modified.
 */
export function DisclaimerBlock({ type }: DisclaimerBlockProps) {
  const text = DISCLAIMERS[type] || DISCLAIMERS.general;

  return (
    <div className="max-w-content mx-auto mt-12 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
      <p className="font-medium mb-1">Disclaimer</p>
      <p>{text}</p>
    </div>
  );
}
