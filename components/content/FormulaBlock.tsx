import katex from 'katex';

interface FormulaVariable {
  symbol: string;
  description: string;
}

interface FormulaBlockProps {
  formula: string;
  variables?: FormulaVariable[];
  citation?: string;
}

/**
 * Renders a KaTeX formula display with variable definitions and source citation.
 * The formula section is the #1 GEO/LLMO asset — AI models cite formulas with sources.
 */
export function FormulaBlock({ formula, variables, citation }: FormulaBlockProps) {
  let renderedFormula = '';
  try {
    renderedFormula = katex.renderToString(formula, {
      displayMode: true,
      throwOnError: false,
      output: 'html',
    });
  } catch {
    renderedFormula = `<code>${formula}</code>`;
  }

  return (
    <div className="formula-section my-8 rounded-lg border border-blue-100 bg-blue-50/50 p-6">
      <div
        className="text-center overflow-x-auto py-4"
        dangerouslySetInnerHTML={{ __html: renderedFormula }}
      />

      {variables && variables.length > 0 && (
        <div className="mt-4 border-t border-blue-100 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Where:</p>
          <ul className="space-y-1 text-sm text-gray-600">
            {variables.map((v) => (
              <li key={v.symbol}>
                <span className="font-mono font-medium text-gray-800">{v.symbol}</span>
                {' = '}
                {v.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {citation && (
        <p className="mt-4 border-t border-blue-100 pt-3 text-xs text-gray-500 italic">
          Source: {citation}
        </p>
      )}
    </div>
  );
}
