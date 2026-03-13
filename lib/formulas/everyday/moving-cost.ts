/**
 * Moving Cost Calculator
 *
 * Calculates the total cost of a local or long-distance move based on
 * move type, number of rooms, distance, crew size, and additional fees.
 *
 * Formulas:
 *   Local move (distance < 100 miles):
 *     estimatedHours = max(2, ceil(numberOfRooms × 1.5))
 *     laborCost = hourlyRate × estimatedHours
 *     transportCost = 0 (included in hourly rate)
 *     totalCost = laborCost + packingSupplies + insuranceFee
 *
 *   Long-distance move (distance ≥ 100 miles):
 *     estimatedWeight = numberOfRooms × 1500 (if weightLbs = 0)
 *     transportCost = weightLbs × ratePerPound
 *     laborCost = 0 (included in transport rate)
 *     totalCost = transportCost + packingSupplies + insuranceFee
 *
 *   costPerRoom = totalCost / numberOfRooms
 *
 * Source: American Moving & Storage Association (AMSA) industry averages;
 *         MovingLabor.com rate data (2024).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface MovingCostOutput {
  totalCost: number;
  laborCost: number;
  transportCost: number;
  suppliesCost: number;
  insuranceCost: number;
  costPerRoom: number;
  estimatedHours: number;
  estimatedWeight: number;
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Moving Cost Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates total moving cost with itemized breakdown.
 *
 * Local: totalCost = (hourlyRate × estimatedHours) + packing + insurance
 * Long-distance: totalCost = (weightLbs × ratePerPound) + packing + insurance
 *
 * @param inputs - Record with moveType, numberOfRooms, distance, numberOfMovers,
 *                 hourlyRate, weightLbs, ratePerPound, packingSupplies, insuranceFee
 * @returns Record with total cost, labor, transport, supplies, insurance, cost per room, summary
 */
export function calculateMovingCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // Helper: parse number with fallback that treats 0 as valid
  const num = (val: unknown, fallback: number): number => {
    const n = Number(val);
    return isNaN(n) ? fallback : n;
  };

  const moveType = String(inputs.moveType || 'local');
  const numberOfRooms = Math.max(1, Math.floor(num(inputs.numberOfRooms, 3)));
  const distance = Math.max(0, num(inputs.distance, 30));
  const numberOfMovers = Math.max(2, Math.floor(num(inputs.numberOfMovers, 3)));
  const hourlyRate = Math.max(0, num(inputs.hourlyRate, 150));
  const rawWeight = Math.max(0, num(inputs.weightLbs, 0));
  const ratePerPound = Math.max(0, num(inputs.ratePerPound, 0.50));
  const packingSupplies = Math.max(0, num(inputs.packingSupplies, 200));
  const insuranceFee = Math.max(0, num(inputs.insuranceFee, 150));

  const isLocal = moveType === 'local';

  // ── Estimated hours (local moves) ─────────────────
  const estimatedHours = isLocal
    ? Math.max(2, Math.ceil(numberOfRooms * 1.5))
    : 0;

  // ── Estimated weight (long-distance moves) ────────
  const estimatedWeight = isLocal
    ? 0
    : rawWeight > 0
      ? rawWeight
      : numberOfRooms * 1500;

  // ── Labor cost (local only) ───────────────────────
  const laborCost = isLocal
    ? parseFloat((hourlyRate * estimatedHours).toFixed(2))
    : 0;

  // ── Transport cost (long-distance only) ───────────
  const transportCost = isLocal
    ? 0
    : parseFloat((estimatedWeight * ratePerPound).toFixed(2));

  // ── Supplies & insurance ──────────────────────────
  const suppliesCost = parseFloat(packingSupplies.toFixed(2));
  const insuranceCost = parseFloat(insuranceFee.toFixed(2));

  // ── Total cost ────────────────────────────────────
  const totalCost = parseFloat(
    (laborCost + transportCost + suppliesCost + insuranceCost).toFixed(2)
  );

  // ── Cost per room ─────────────────────────────────
  const costPerRoom = parseFloat((totalCost / numberOfRooms).toFixed(2));

  // ── Summary value-group ───────────────────────────
  const summary = isLocal
    ? [
        { label: 'Labor (Crew)', value: laborCost },
        { label: 'Packing Supplies', value: suppliesCost },
        { label: 'Insurance', value: insuranceCost },
      ]
    : [
        { label: 'Transport (Weight-Based)', value: transportCost },
        { label: 'Packing Supplies', value: suppliesCost },
        { label: 'Insurance', value: insuranceCost },
      ];

  return {
    totalCost,
    laborCost,
    transportCost,
    suppliesCost,
    insuranceCost,
    costPerRoom,
    estimatedHours,
    estimatedWeight,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'moving-cost': calculateMovingCost,
};
