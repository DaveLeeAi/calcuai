'use client';

import { useState, useEffect, useMemo } from 'react';
import USChoroplethMap from './USChoroplethMap';
import StateTaxTable from './StateTaxTable';

interface StateTaxRecord {
  stateCode: string;
  stateName: string;
  fips: string;
  stateTaxRate: number;
  avgLocalTaxRate: number;
  combinedRate: number;
  groceryTaxStatus: string;
  groceryTaxRate?: number | null;
  clothingTaxStatus: string;
  clothingTaxNote?: string;
  changedFrom2025: boolean;
  changeNote: string | null;
}

interface TaxDataFile {
  year: number;
  effectiveDate: string;
  source: string;
  lastVerified: string;
  states: StateTaxRecord[];
}

/**
 * Combines the US Choropleth Map and State Tax Table for the sales tax calculator.
 * Loads state tax data from the JSON file and renders both visualizations.
 * Used as a custom MDX component in the sales tax article.
 */
export default function SalesTaxVisualizations() {
  const [taxData, setTaxData] = useState<StateTaxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/us-sales-tax-2026.json')
      .then((r) => r.json())
      .then((data: TaxDataFile) => {
        setTaxData(data.states);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load sales tax data:', err);
        setLoading(false);
      });
  }, []);

  // Transform data for the choropleth map
  const mapData = useMemo(
    () =>
      taxData.map((s) => ({
        name: s.stateName,
        fips: s.fips,
        rate: s.stateTaxRate,
        localRate: s.avgLocalTaxRate,
        combinedRate: s.combinedRate,
        label: s.combinedRate === 0 ? 'No sales tax' : undefined,
      })),
    [taxData]
  );

  if (loading) {
    return (
      <div className="space-y-6 my-8">
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-gray-400 dark:text-slate-500 animate-pulse">
          Loading sales tax data...
        </div>
      </div>
    );
  }

  if (taxData.length === 0) return null;

  return (
    <div className="not-prose space-y-8 my-8">
      {/* Interactive US Map */}
      <USChoroplethMap
        data={mapData}
        legend="Combined State + Local Sales Tax Rate (%)"
        source="Tax Foundation, State and Local Sales Tax Rates, 2026"
        valueFormat="percentage"
        colorScale={['#D5E8F4', '#0D3B5E']}
        noDataColor="#E5E7EB"
      />

      {/* State Data Table */}
      <StateTaxTable data={taxData} />
    </div>
  );
}
