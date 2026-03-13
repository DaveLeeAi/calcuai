/**
 * Stair Calculator Formula Module
 *
 * Calculates stair dimensions from total rise, including number of risers,
 * tread depth, total run, and stringer length.
 *
 * Number of risers:
 *   risers = ⌈totalRise / maxRiserHeight⌉
 *
 * Actual riser height:
 *   riserHeight = totalRise / risers
 *
 * Treads:
 *   treads = risers - 1
 *
 * Tread depth (2R + T = 25 comfort rule):
 *   treadDepth = max(10, 25 - 2 × riserHeight)
 *
 * Total run:
 *   totalRun = treads × treadDepth
 *
 * Stringer length (Pythagorean theorem):
 *   stringerLength = √(totalRise² + totalRun²)
 *
 * Source: International Residential Code (IRC) Section R311.7
 * — Max riser: 7.75 in, min tread: 10 in, min width: 36 in.
 */

export interface StairInput {
  totalRise: number;       // inches — total vertical height
  stairWidth: number;      // inches
  maxRiserHeight: number;  // inches
}

export interface StairOutput {
  numberOfRisers: number;
  numberOfTreads: number;
  actualRiserHeight: number;
  treadDepth: number;
  totalRun: number;
  stringerLength: number;
  meetsCode: string;
  summary: { label: string; value: string | number }[];
}

/**
 * Stair calculator — risers, treads, run, and stringer length.
 *
 * risers = ⌈totalRise / maxRiserHeight⌉
 * treadDepth = max(10, 25 - 2 × actualRiser)
 * stringerLength = √(rise² + run²)
 *
 * Source: IRC Section R311.7.
 */
export function calculateStair(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const totalRise = Number(inputs.totalRise) || 0;
  const stairWidth = Number(inputs.stairWidth) || 36;
  const maxRiserHeight = Number(inputs.maxRiserHeight) || 7.75;

  // ── Guard: invalid rise ───────────────────────────────
  if (totalRise <= 0) {
    return {
      numberOfRisers: 0,
      numberOfTreads: 0,
      actualRiserHeight: 0,
      treadDepth: 0,
      totalRun: 0,
      stringerLength: 0,
      meetsCode: '',
      summary: [],
    };
  }

  // ── Number of risers ─────────────────────────────────
  const numberOfRisers = Math.ceil(totalRise / maxRiserHeight);

  // ── Actual riser height (evenly divided) ──────────────
  const actualRiserHeight = parseFloat((totalRise / numberOfRisers).toFixed(2));

  // ── Treads = risers - 1 ───────────────────────────────
  const numberOfTreads = numberOfRisers - 1;

  // ── Tread depth using 2R + T = 25 rule ────────────────
  // IRC minimum tread depth: 10 inches
  const treadDepth = parseFloat(Math.max(10, 25 - 2 * actualRiserHeight).toFixed(2));

  // ── Total run ─────────────────────────────────────────
  const totalRun = parseFloat((numberOfTreads * treadDepth).toFixed(1));

  // ── Stringer length (hypotenuse) ──────────────────────
  const stringerLength = parseFloat(Math.sqrt(totalRise * totalRise + totalRun * totalRun).toFixed(1));

  // ── Code compliance checks (IRC R311.7) ───────────────
  const codeIssues: string[] = [];
  if (actualRiserHeight > 7.75) {
    codeIssues.push('Riser exceeds IRC max of 7.75"');
  }
  if (treadDepth < 10) {
    codeIssues.push('Tread below IRC min of 10"');
  }
  if (stairWidth < 36) {
    codeIssues.push('Width below IRC min of 36"');
  }

  const meetsCode = codeIssues.length === 0
    ? 'Yes \u2014 Meets IRC Requirements'
    : 'No \u2014 ' + codeIssues.join('; ');

  // ── Summary breakdown ─────────────────────────────────
  const summary: { label: string; value: string | number }[] = [
    { label: 'Total Rise', value: totalRise + '"' },
    { label: 'Number of Risers', value: numberOfRisers },
    { label: 'Number of Treads', value: numberOfTreads },
    { label: 'Riser Height', value: actualRiserHeight + '"' },
    { label: 'Tread Depth', value: treadDepth + '"' },
    { label: 'Total Run', value: totalRun + '" (' + (totalRun / 12).toFixed(1) + ' ft)' },
    { label: 'Stringer Length', value: stringerLength + '" (' + (stringerLength / 12).toFixed(1) + ' ft)' },
    { label: 'Stair Width', value: stairWidth + '"' },
    { label: 'Code Compliance', value: meetsCode },
  ];

  return {
    numberOfRisers,
    numberOfTreads,
    actualRiserHeight,
    treadDepth,
    totalRun,
    stringerLength,
    meetsCode,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'stair': calculateStair,
};
