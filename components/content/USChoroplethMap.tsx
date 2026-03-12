'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as topojson from 'topojson-client';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import type { Topology, GeometryCollection } from 'topojson-specification';

// ─── Types ───────────────────────────────────────────

interface StateData {
  name: string;
  fips: string;
  rate: number;
  localRate?: number;
  combinedRate?: number;
  label?: string;
}

interface USChoroplethMapProps {
  data: StateData[];
  legend: string;
  source: string;
  valueFormat?: 'percentage' | 'currency' | 'number';
  onStateClick?: (state: StateData) => void;
  colorScale?: [string, string];
  noDataColor?: string;
}

// ─── FIPS to State Name mapping ──────────────────────

const FIPS_TO_STATE: Record<string, string> = {
  '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas',
  '06': 'California', '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware',
  '11': 'District of Columbia', '12': 'Florida', '13': 'Georgia', '15': 'Hawaii',
  '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa',
  '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine',
  '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
  '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska',
  '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico',
  '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio',
  '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island',
  '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas',
  '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington',
  '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming',
};

// ─── Color interpolation ─────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

function interpolateColor(low: string, high: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(low);
  const [r2, g2, b2] = hexToRgb(high);
  return rgbToHex(
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t
  );
}

// ─── Value formatting ────────────────────────────────

function formatValue(val: number, fmt: 'percentage' | 'currency' | 'number'): string {
  switch (fmt) {
    case 'percentage':
      return `${val.toFixed(2)}%`;
    case 'currency':
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'number':
      return val.toLocaleString('en-US');
  }
}

// ─── Component ───────────────────────────────────────

export default function USChoroplethMap({
  data,
  legend,
  source,
  valueFormat = 'percentage',
  onStateClick,
  colorScale = ['#D5E8F4', '#0D3B5E'],
  noDataColor = '#E5E7EB',
}: USChoroplethMapProps) {
  const [topology, setTopology] = useState<Topology | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    state: StateData | null;
    fipsName: string;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load TopoJSON
  useEffect(() => {
    fetch('/data/states-10m.json')
      .then((r) => r.json())
      .then((topo: Topology) => setTopology(topo))
      .catch((err) => console.error('Failed to load US map data:', err));
  }, []);

  // Build lookup maps
  const dataByFips = useMemo(() => {
    const map = new Map<string, StateData>();
    for (const d of data) {
      map.set(d.fips, d);
    }
    return map;
  }, [data]);

  const maxRate = useMemo(
    () => Math.max(...data.map((d) => d.combinedRate ?? d.rate), 1),
    [data]
  );

  const getColor = useCallback(
    (fips: string): string => {
      const d = dataByFips.get(fips);
      if (!d || (d.rate === 0 && !d.combinedRate)) return noDataColor;
      const val = d.combinedRate ?? d.rate;
      const t = Math.min(1, val / maxRate);
      return interpolateColor(colorScale[0], colorScale[1], t);
    },
    [dataByFips, maxRate, colorScale, noDataColor]
  );

  // Generate projected SVG paths from topology using d3-geo
  const pathStrings = useMemo(() => {
    if (!topology) return new Map<string, string>();

    const geom = topology.objects.states as GeometryCollection;
    const fc = topojson.feature(topology, geom);

    // AlbersUSA projection scaled to fit a 975x610 viewBox
    const projection = geoAlbersUsa()
      .scale(1280)
      .translate([975 / 2, 610 / 2]);

    const pathGenerator = geoPath().projection(projection);

    const result = new Map<string, string>();
    for (const feature of fc.features) {
      const fips = String(feature.id).padStart(2, '0');
      const d = pathGenerator(feature);
      if (d) {
        result.set(fips, d);
      }
    }
    return result;
  }, [topology]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container || !tooltip) return;
      const rect = container.getBoundingClientRect();
      setTooltip((prev) =>
        prev
          ? {
              ...prev,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            }
          : null
      );
    },
    [tooltip]
  );

  const handleStateEnter = useCallback(
    (fips: string, e: React.MouseEvent<SVGPathElement>) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const paddedFips = fips.padStart(2, '0');
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        state: dataByFips.get(paddedFips) || null,
        fipsName: FIPS_TO_STATE[paddedFips] || `State ${fips}`,
      });
    },
    [dataByFips]
  );

  const handleStateLeave = useCallback(() => setTooltip(null), []);

  const handleStateClick = useCallback(
    (fips: string) => {
      const paddedFips = fips.padStart(2, '0');
      const d = dataByFips.get(paddedFips);
      if (d && onStateClick) onStateClick(d);
    },
    [dataByFips, onStateClick]
  );

  // Legend steps
  const legendSteps = useMemo(() => {
    const steps = 5;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps;
      return {
        color: interpolateColor(colorScale[0], colorScale[1], t),
        value: maxRate * t,
      };
    });
  }, [colorScale, maxRate]);

  if (!topology || pathStrings.size === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-gray-400 dark:text-slate-500">
        Loading map...
      </div>
    );
  }

  // Get all FIPS codes that have paths
  const fipsList = Array.from(pathStrings.keys());

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {legend}
        </h3>

        {/* SVG Map */}
        <div
          ref={containerRef}
          className="relative"
          onMouseMove={handleMouseMove}
        >
          <svg
            viewBox="0 0 975 610"
            className="w-full h-auto"
            role="img"
            aria-label={`US map showing ${legend}`}
          >
            {fipsList.map((fips) => (
              <path
                key={fips}
                d={pathStrings.get(fips)!}
                fill={getColor(fips)}
                stroke="#fff"
                strokeWidth={0.5}
                className="transition-opacity duration-150 hover:opacity-80 cursor-pointer"
                onMouseEnter={(e) => handleStateEnter(fips, e)}
                onMouseLeave={handleStateLeave}
                onClick={() => handleStateClick(fips)}
                role="button"
                aria-label={FIPS_TO_STATE[fips] || `State ${fips}`}
              />
            ))}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-10 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 shadow-lg text-sm"
              style={{
                left: Math.min(tooltip.x + 12, (containerRef.current?.clientWidth ?? 400) - 180),
                top: tooltip.y - 10,
                transform: 'translateY(-100%)',
              }}
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                {tooltip.fipsName}
              </p>
              {tooltip.state ? (
                <div className="mt-1 space-y-0.5 text-gray-600 dark:text-slate-300">
                  <p>State Rate: {formatValue(tooltip.state.rate, valueFormat)}</p>
                  {tooltip.state.localRate !== undefined && (
                    <p>Avg. Local: {formatValue(tooltip.state.localRate, valueFormat)}</p>
                  )}
                  {tooltip.state.combinedRate !== undefined && (
                    <p className="font-medium text-gray-900 dark:text-white">
                      Combined: {formatValue(tooltip.state.combinedRate, valueFormat)}
                    </p>
                  )}
                  {tooltip.state.label && (
                    <p className="text-xs text-gray-400 dark:text-slate-500 italic">
                      {tooltip.state.label}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-gray-400 dark:text-slate-500 italic text-xs">
                  No data available
                </p>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {formatValue(0, valueFormat)}
          </span>
          <div className="flex-1 flex h-3 rounded-full overflow-hidden">
            {legendSteps.slice(0, -1).map((step, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: step.color }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {formatValue(maxRate, valueFormat)}
          </span>
          <div className="ml-3 flex items-center gap-1.5">
            <div
              className="h-3 w-5 rounded-sm border border-gray-300 dark:border-slate-600"
              style={{ backgroundColor: noDataColor }}
            />
            <span className="text-xs text-gray-500 dark:text-slate-400">
              No tax
            </span>
          </div>
        </div>
      </div>

      {/* Source citation */}
      <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-2 sm:px-6">
        <p className="text-xs text-gray-400 dark:text-slate-500">
          Source: {source}
        </p>
      </div>
    </div>
  );
}
