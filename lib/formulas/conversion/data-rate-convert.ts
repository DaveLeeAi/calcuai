/**
 * Data Transfer Rate Converter — convert between units of data transfer speed
 *
 * Core formula:
 *   valueInBps = value × fromFactor
 *   convertedValue = valueInBps / toFactor
 *   conversionRate = fromFactor / toFactor
 *   inverseRate = toFactor / fromFactor
 *
 * Base unit: bits per second (bps)
 * Factors: 1 kbps = 1,000 bps, 1 Mbps = 1,000,000 bps,
 *          1 Gbps = 1,000,000,000 bps, 1 Tbps = 1,000,000,000,000 bps,
 *          1 B/s = 8 bps, 1 KB/s = 8,000 bps, 1 MB/s = 8,000,000 bps,
 *          1 GB/s = 8,000,000,000 bps.
 *
 * Note: Uses SI decimal prefixes (1 kbps = 1,000 bps, not 1,024).
 * 1 byte = 8 bits per IEEE 802.3 and IEC 80000-13:2008.
 *
 * Source: IEEE 802.3 Standard; IEC 80000-13:2008 — defines quantities
 * and units for information technology, including bit and byte prefixes.
 */

const DATA_RATE_TO_BPS: Record<string, number> = {
  bps: 1,
  kbps: 1000,
  mbps: 1000000,
  gbps: 1000000000,
  tbps: 1000000000000,
  'bytes-per-sec': 8,
  'kb-per-sec': 8000,
  'mb-per-sec': 8000000,
  'gb-per-sec': 8000000000,
};

/**
 * Converts a data transfer rate value from one unit to another.
 *
 * convertedValue = value × (fromFactor / toFactor)
 *
 * @param inputs - Record with value, fromUnit, toUnit
 * @returns Record with convertedValue, conversionDisplay, conversionRate,
 *          inverseRate, conversionTable
 */
export function calculateDataRateConvert(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const value = Math.max(0, Number(inputs.value) || 0);
  const fromUnit = String(inputs.fromUnit || 'mbps');
  const toUnit = String(inputs.toUnit || 'mb-per-sec');

  const fromFactor = DATA_RATE_TO_BPS[fromUnit] || 1;
  const toFactor = DATA_RATE_TO_BPS[toUnit] || 1;

  // 2. Core conversion
  const valueInBps = value * fromFactor;
  const convertedValue = parseFloat((valueInBps / toFactor).toFixed(6));

  // 3. Rates
  const conversionRate = parseFloat((fromFactor / toFactor).toFixed(6));
  const inverseRate = parseFloat((toFactor / fromFactor).toFixed(6));

  // 4. Display string
  const conversionDisplay = `${value} ${fromUnit} = ${convertedValue} ${toUnit}`;

  // 5. Conversion table: show value in all units
  const conversionTable = Object.entries(DATA_RATE_TO_BPS).map(([unit, factor]) => ({
    label: unit.charAt(0).toUpperCase() + unit.slice(1),
    value: parseFloat((valueInBps / factor).toFixed(6)),
  }));

  return {
    convertedValue,
    fromUnit,
    toUnit,
    conversionRate,
    inverseRate,
    conversionDisplay,
    conversionTable,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'data-rate-convert': calculateDataRateConvert,
};
