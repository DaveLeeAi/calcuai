'use client';

import { useState, useEffect, useMemo } from 'react';
import USChoroplethMap from './USChoroplethMap';

// ─── Types ────────────────────────────────────────────

interface ElecStateRecord {
  stateCode: string;
  stateName: string;
  avgRateCentsPerKwh: number;
}

interface ElecDataFile {
  states: ElecStateRecord[];
}

// ─── State abbreviation → FIPS mapping ───────────────

const STATE_CODE_TO_FIPS: Record<string, string> = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06',
  CO: '08', CT: '09', DE: '10', DC: '11', FL: '12',
  GA: '13', HI: '15', ID: '16', IL: '17', IN: '18',
  IA: '19', KS: '20', KY: '21', LA: '22', ME: '23',
  MD: '24', MA: '25', MI: '26', MN: '27', MS: '28',
  MO: '29', MT: '30', NE: '31', NV: '32', NH: '33',
  NJ: '34', NM: '35', NY: '36', NC: '37', ND: '38',
  OH: '39', OK: '40', OR: '41', PA: '42', RI: '44',
  SC: '45', SD: '46', TN: '47', TX: '48', UT: '49',
  VT: '50', VA: '51', WA: '53', WV: '54', WI: '55',
  WY: '56',
};

// ─── Helpers ──────────────────────────────────────────

function stateNameToElecSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-electricity-rates';
}

function formatCentsPerKwh(val: number): string {
  return `${val.toFixed(2)}¢/kWh`;
}

// ─── Component ────────────────────────────────────────

/**
 * US choropleth map showing average residential electricity rates by state.
 * Colors states by avgRateCentsPerKwh (light = cheap, dark = expensive).
 * Clicking a state navigates to /energy/{state}-electricity-rates.
 * Rendered in the "State-by-State Rate Comparison" section of the electric bill estimator.
 */
export default function ElectricityRateMap() {
  const [elecData, setElecData] = useState<ElecStateRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/us-electricity-rates-2026.json')
      .then((r) => r.json())
      .then((data: ElecDataFile) => {
        setElecData(data.states);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load electricity rate data:', err);
        setLoading(false);
      });
  }, []);

  // Transform electricity data into the format USChoroplethMap expects
  const mapData = useMemo(
    () =>
      elecData
        .filter((s) => STATE_CODE_TO_FIPS[s.stateCode])
        .map((s) => ({
          name: s.stateName,
          fips: STATE_CODE_TO_FIPS[s.stateCode],
          rate: s.avgRateCentsPerKwh,
        })),
    [elecData]
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-gray-400 dark:text-slate-500 animate-pulse">
        Loading electricity rate map...
      </div>
    );
  }

  if (mapData.length === 0) return null;

  return (
    <USChoroplethMap
      data={mapData}
      legend="Average Residential Electricity Rate (¢/kWh), 2026"
      source="U.S. Energy Information Administration (EIA), Electric Power Monthly, 2025–2026"
      valueFormat="number"
      valueFormatFn={formatCentsPerKwh}
      colorScale={['#D5F0E8', '#0D4A2E']}
      noDataColor="#E5E7EB"
      buildStateUrl={(stateName) => `/energy/${stateNameToElecSlug(stateName)}`}
    />
  );
}
