'use client';

import { OutputComponentProps, formatValue } from './types';

export default function GaugeIndicator({ field, data }: OutputComponentProps) {
  const value = typeof data[field.id] === 'number' ? (data[field.id] as number) : 0;
  const config = field.gaugeConfig;
  if (!config) return null;

  const { min, max, ranges } = config;
  const totalSpan = max - min;
  const clampedValue = Math.max(min, Math.min(max, value));

  // SVG arc gauge — 180 degrees (semicircle)
  const startAngle = -180;
  const endAngle = 0;
  const cx = 150;
  const cy = 130;
  const outerR = 110;
  const innerR = 80;

  const angleForValue = (v: number) =>
    startAngle + ((v - min) / totalSpan) * (endAngle - startAngle);

  const describeArc = (startVal: number, endVal: number, rOuter: number, rInner: number) => {
    const a1 = (angleForValue(startVal) * Math.PI) / 180;
    const a2 = (angleForValue(endVal) * Math.PI) / 180;

    const x1Outer = cx + rOuter * Math.cos(a1);
    const y1Outer = cy + rOuter * Math.sin(a1);
    const x2Outer = cx + rOuter * Math.cos(a2);
    const y2Outer = cy + rOuter * Math.sin(a2);

    const x1Inner = cx + rInner * Math.cos(a2);
    const y1Inner = cy + rInner * Math.sin(a2);
    const x2Inner = cx + rInner * Math.cos(a1);
    const y2Inner = cy + rInner * Math.sin(a1);

    const largeArc = endVal - startVal > totalSpan / 2 ? 1 : 0;

    return [
      `M ${x1Outer} ${y1Outer}`,
      `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
      'Z',
    ].join(' ');
  };

  // Needle
  const needleAngle = (angleForValue(clampedValue) * Math.PI) / 180;
  const needleLen = outerR - 5;
  const needleX = cx + needleLen * Math.cos(needleAngle);
  const needleY = cy + needleLen * Math.sin(needleAngle);

  // Find current range for label/color
  const currentRange = ranges.find((r) => clampedValue >= r.min && clampedValue <= r.max);

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-slate-700/50 p-4">
      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
        {field.label}
      </h4>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 300 160" className="w-full max-w-xs" role="img" aria-label={`${field.label}: ${value}`}>
          {/* Gauge arcs */}
          {ranges.map((range, i) => (
            <path
              key={i}
              d={describeArc(
                Math.max(range.min, min),
                Math.min(range.max, max),
                outerR,
                innerR
              )}
              fill={range.color}
              opacity={0.85}
            />
          ))}
          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#1c1c1e"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={6} fill="#1c1c1e" />
          {/* Min / Max labels */}
          <text x={cx - outerR - 5} y={cy + 16} fontSize="11" fill="#9ca3af" textAnchor="end">
            {min}
          </text>
          <text x={cx + outerR + 5} y={cy + 16} fontSize="11" fill="#9ca3af" textAnchor="start">
            {max}
          </text>
        </svg>
        <div className="mt-1 text-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatValue(value, field.format, field.precision)}
          </span>
          {currentRange && (
            <span
              className="ml-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: currentRange.color }}
            >
              {currentRange.label}
            </span>
          )}
        </div>
        {/* Range legend */}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {ranges.map((r, i) => (
            <span key={i} className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              {r.label} ({r.min}–{r.max})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
