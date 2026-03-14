'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  calculateElectricBill,
  STATE_RATES,
  zipToStateCode,
  getStateRate,
} from '@/lib/formulas/energy/electric-bill-calculator';
import type {
  ApplianceBreakdown,
} from '@/lib/formulas/energy/electric-bill-calculator';

// ─── Helpers ────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// ─── Appliance Icons ────────────────────────────────────────

function ApplianceIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className ?? 'w-5 h-5';
  switch (icon) {
    case 'thermometer':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13V3.5a3 3 0 10-6 0V13a5 5 0 106 0z" />
        </svg>
      );
    case 'droplet':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.5c-3.5 0-6.5-2.8-6.5-6.5 0-4.5 6.5-12 6.5-12s6.5 7.5 6.5 12c0 3.7-3 6.5-6.5 6.5z" />
        </svg>
      );
    case 'refrigerator':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="5" y1="10" x2="19" y2="10" />
          <line x1="9" y1="6" x2="9" y2="8" />
          <line x1="9" y1="13" x2="9" y2="16" />
        </svg>
      );
    case 'lightbulb':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="9" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6M10 18h4M12 18v-3" />
        </svg>
      );
    case 'monitor':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <line x1="8" y1="20" x2="16" y2="20" />
          <line x1="12" y1="16" x2="12" y2="20" />
        </svg>
      );
    default:
      return null;
  }
}

// ─── Appliance Breakdown Component ──────────────────────────

function ApplianceBreakdownSection({
  appliances,
  monthlyBill,
}: {
  appliances: ApplianceBreakdown[];
  monthlyBill: number;
}) {
  const maxPct = Math.max(...appliances.map((a) => a.percentage));

  const barColors = [
    'bg-blue-500 dark:bg-blue-400',
    'bg-cyan-500 dark:bg-cyan-400',
    'bg-teal-500 dark:bg-teal-400',
    'bg-amber-500 dark:bg-amber-400',
    'bg-purple-500 dark:bg-purple-400',
  ];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Where Your Money Goes
      </h4>
      <div className="space-y-3">
        {appliances.map((a, i) => (
          <div key={a.label} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 dark:text-slate-500">
                  <ApplianceIcon icon={a.icon} className="w-4 h-4" />
                </span>
                <span className="text-sm text-gray-700 dark:text-slate-300">{a.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {a.monthlyKwh.toFixed(0)} kWh
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 w-16 text-right">
                  {formatCurrency(a.monthlyCost)}
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColors[i % barColors.length]}`}
                style={{ width: `${(a.percentage / maxPct) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 text-right">
              {a.percentage.toFixed(0)}% of energy cost
            </p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-3 italic">
        Based on EIA RECS 2022 average household energy end-use shares.
      </p>
    </div>
  );
}

// ─── State Comparison Component ─────────────────────────────

function StateComparison({
  stateInfo,
  userRate,
}: {
  stateInfo: NonNullable<ReturnType<typeof calculateElectricBill>['stateInfo']>;
  userRate: number;
}) {
  const s = stateInfo as {
    stateCode: string;
    stateName: string;
    stateAvgRate: number;
    stateAvgBill: number;
    rateVsState: number;
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {s.stateName} Comparison
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 dark:bg-slate-700/50 p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Your Rate</p>
          <p className="text-lg font-bold text-gray-800 dark:text-slate-200">{(userRate * 100).toFixed(2)}¢</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500">per kWh</p>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-slate-700/50 p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{s.stateName} Avg</p>
          <p className="text-lg font-bold text-gray-800 dark:text-slate-200">{(s.stateAvgRate * 100).toFixed(2)}¢</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500">per kWh</p>
        </div>
      </div>
      <p className="text-xs text-center text-gray-500 dark:text-slate-400 mt-3">
        {s.rateVsState >= 0 ? (
          <>Your rate is <span className="font-semibold text-red-600 dark:text-red-400">{s.rateVsState.toFixed(1)}% higher</span> than the {s.stateName} average</>
        ) : (
          <>Your rate is <span className="font-semibold text-emerald-600 dark:text-emerald-400">{Math.abs(s.rateVsState).toFixed(1)}% lower</span> than the {s.stateName} average</>
        )}
      </p>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────

function stateNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-electricity-rates';
}

// ─── Main Component ─────────────────────────────────────────

interface ElectricBillCalculatorProps {
  defaultStateCode?: string;
}

export default function ElectricBillCalculator({ defaultStateCode = '' }: ElectricBillCalculatorProps) {
  const router = useRouter();

  // Input state
  const [stateCode, setStateCode] = useState(defaultStateCode);
  const [zipCode, setZipCode] = useState('');
  const [monthlyKwh, setMonthlyKwh] = useState(0);
  const [sqFt, setSqFt] = useState('');
  const [ratePerKwh, setRatePerKwh] = useState(0);
  const [monthlyBaseFee, setMonthlyBaseFee] = useState(0);
  const [rateManuallySet, setRateManuallySet] = useState(false);

  // Results state — only set when Calculate is clicked
  const [calcResults, setCalcResults] = useState<ReturnType<typeof calculateElectricBill> | null>(null);

  // Auto-populate rate when state changes
  useEffect(() => {
    if (stateCode && !rateManuallySet) {
      const state = getStateRate(stateCode);
      if (state) {
        setRatePerKwh(state.avgRateCentsPerKwh / 100);
        setMonthlyBaseFee(state.avgMonthlyBaseFee);
      }
    }
  }, [stateCode, rateManuallySet]);

  // ZIP code → state auto-detection — navigate when full 5-digit ZIP resolves
  useEffect(() => {
    if (zipCode.length === 5) {
      const detected = zipToStateCode(zipCode);
      if (detected && detected !== stateCode) {
        const stateName = STATE_RATES.find((s) => s.stateCode === detected)?.stateName;
        if (stateName) {
          router.push(`/energy/${stateNameToSlug(stateName)}`);
        }
      }
    }
  }, [zipCode, stateCode, router]);

  // Handlers
  const handleStateChange = useCallback((code: string) => {
    if (!code) return;
    const stateName = STATE_RATES.find((s) => s.stateCode === code)?.stateName;
    if (stateName) {
      router.push(`/energy/${stateNameToSlug(stateName)}`);
    } else {
      setStateCode(code);
      setRateManuallySet(false);
    }
  }, [router]);

  const handleZipChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 5);
    setZipCode(cleaned);
  }, []);

  const handleSqFtChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '');
    setSqFt(cleaned);
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num > 0) {
      // EIA RECS 2022: ~0.48 kWh per sq ft per month (863 kWh ÷ 1,800 sq ft avg)
      setMonthlyKwh(Math.min(Math.round(num * 0.48), 10000));
    } else {
      setMonthlyKwh(0);
    }
  }, []);

  const handleKwhSlider = useCallback((value: number) => {
    setMonthlyKwh(value);
    setSqFt('');
  }, []);

  const handleKwhInput = useCallback((value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setMonthlyKwh(Math.min(num, 10000));
      setSqFt('');
    } else if (value === '') {
      setMonthlyKwh(0);
      setSqFt('');
    }
  }, []);

  const handleRateChange = useCallback((value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setRatePerKwh(Math.min(num, 1));
      setRateManuallySet(true);
    }
  }, []);

  const handleBaseFeeChange = useCallback((value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setMonthlyBaseFee(Math.min(num, 200));
    }
  }, []);

  const handleCalculate = useCallback(() => {
    const results = calculateElectricBill({
      monthlyKwh,
      ratePerKwh,
      monthlyBaseFee,
      stateCode,
    });
    setCalcResults(results);
  }, [monthlyKwh, ratePerKwh, monthlyBaseFee, stateCode]);

  // Derived
  const sliderPct = Math.min(100, (monthlyKwh / 5000) * 100);
  const selectedStateName = stateCode
    ? STATE_RATES.find((s) => s.stateCode === stateCode)?.stateName ?? ''
    : '';

  // Results values (only used when calcResults is set)
  const monthlyBill = (calcResults?.monthlyBill as number) ?? 0;
  const annualBill = (calcResults?.annualBill as number) ?? 0;
  const dailyCost = (calcResults?.dailyCost as number) ?? 0;
  const energyCost = (calcResults?.energyCost as number) ?? 0;
  const applianceBreakdown = (calcResults?.applianceBreakdown as ApplianceBreakdown[]) ?? [];
  const stateInfo = (calcResults?.stateInfo as {
    stateCode: string;
    stateName: string;
    stateAvgRate: number;
    stateAvgBill: number;
    rateVsState: number;
  } | null) ?? null;

  return (
    <section aria-label="Electric Bill Calculator" className="mx-auto max-w-calculator">
      <div className="space-y-4">

        {/* ═══ INPUTS CARD ═══ */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-5 sm:p-6 space-y-5">

          {/* State + ZIP row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ebc-state" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                State
              </label>
              <select
                id="ebc-state"
                value={stateCode}
                onChange={(e) => handleStateChange(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-gray-800 dark:text-slate-200 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">Select your state</option>
                {STATE_RATES.map((s) => (
                  <option key={s.stateCode} value={s.stateCode}>
                    {s.stateName} ({s.avgRateCentsPerKwh.toFixed(2)}¢/kWh)
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-slate-400">Auto-fills your average rate</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ebc-zip" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                ZIP Code
              </label>
              <input
                id="ebc-zip"
                type="text"
                inputMode="numeric"
                value={zipCode}
                onChange={(e) => handleZipChange(e.target.value)}
                placeholder="e.g. 90210"
                maxLength={5}
                className="h-10 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-gray-800 dark:text-slate-200 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400">Auto-detects your state</p>
            </div>
          </div>

          {/* Home Square Footage */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ebc-sqft" className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Home Square Footage
            </label>
            <div className="relative">
              <input
                id="ebc-sqft"
                type="text"
                inputMode="numeric"
                value={sqFt}
                onChange={(e) => handleSqFtChange(e.target.value)}
                placeholder="e.g. 1800"
                className="h-10 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 pr-10 text-sm text-gray-800 dark:text-slate-200 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-slate-400">
                ft²
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Estimates your monthly kWh usage. Or enter kWh directly below.
            </p>
          </div>

          {/* Monthly Usage — Slider + Number */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="ebc-kwh" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Monthly Usage
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="ebc-kwh"
                  type="text"
                  inputMode="numeric"
                  value={monthlyKwh === 0 ? '' : monthlyKwh}
                  onChange={(e) => handleKwhInput(e.target.value)}
                  placeholder="863"
                  className="w-20 h-8 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 text-sm text-right font-semibold text-gray-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
                <span className="text-sm text-gray-500 dark:text-slate-400">kWh</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={5000}
              step={10}
              value={monthlyKwh}
              onChange={(e) => handleKwhSlider(parseInt(e.target.value, 10))}
              aria-label="Monthly kilowatt-hour usage slider"
              aria-valuenow={monthlyKwh}
              aria-valuemin={0}
              aria-valuemax={5000}
              className="h-2 w-full cursor-pointer appearance-none rounded-full accent-blue-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${sliderPct}%, #e5e7eb ${sliderPct}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500">
              <span>0 kWh</span>
              <span className="text-blue-500 dark:text-blue-400 font-medium">US avg: 863 kWh</span>
              <span>5,000 kWh</span>
            </div>
          </div>

          {/* Price per kWh */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ebc-rate" className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Price per kWh
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-slate-400">$</span>
              <input
                id="ebc-rate"
                type="text"
                inputMode="decimal"
                value={ratePerKwh === 0 ? '' : ratePerKwh}
                onChange={(e) => handleRateChange(e.target.value)}
                placeholder="0.1724"
                className="h-10 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-7 pr-14 text-sm text-gray-800 dark:text-slate-200 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-slate-400">/kWh</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              US average: $0.1724/kWh (2026).
              {stateCode && selectedStateName && (
                <> {selectedStateName} average: ${((getStateRate(stateCode)?.avgRateCentsPerKwh ?? 0) / 100).toFixed(4)}/kWh.</>
              )}
            </p>
          </div>

          {/* Monthly Base Fee */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ebc-base" className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Monthly Base Fee
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-slate-400">$</span>
              <input
                id="ebc-base"
                type="text"
                inputMode="decimal"
                value={monthlyBaseFee === 0 ? '' : monthlyBaseFee}
                onChange={(e) => handleBaseFeeChange(e.target.value)}
                placeholder="12"
                className="h-10 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-7 pr-3 text-sm text-gray-800 dark:text-slate-200 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Service/delivery charge. Typical: $5–$25/month.
            </p>
          </div>

          {/* ── Calculate Button ── */}
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-base tracking-wide shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Calculate My Bill
          </button>
        </div>

        {/* ═══ RESULTS (only shown after Calculate is clicked) ═══ */}
        {calcResults && (
          <>
            {/* Results Card */}
            <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 shadow-lg overflow-hidden">
              <div className="p-5 sm:p-6 text-center">
                <p className="text-xs font-medium uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-1">
                  Estimated Monthly Bill
                </p>
                <p className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-none tracking-tight">
                  {formatCurrency(monthlyBill)}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                  {monthlyKwh.toLocaleString()} kWh at {(ratePerKwh * 100).toFixed(2)}¢/kWh
                  {selectedStateName ? ` in ${selectedStateName}` : ''}
                </p>

                {/* Secondary stats */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="rounded-xl bg-white/70 dark:bg-slate-700/50 py-3 px-2">
                    <p className="text-xs text-gray-500 dark:text-slate-400">Annual</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-slate-200">{formatCurrency(annualBill)}</p>
                  </div>
                  <div className="rounded-xl bg-white/70 dark:bg-slate-700/50 py-3 px-2">
                    <p className="text-xs text-gray-500 dark:text-slate-400">Daily</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-slate-200">{formatCurrency(dailyCost)}</p>
                  </div>
                  <div className="rounded-xl bg-white/70 dark:bg-slate-700/50 py-3 px-2">
                    <p className="text-xs text-gray-500 dark:text-slate-400">Energy Cost</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-slate-200">{formatCurrency(energyCost)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appliance Breakdown */}
            <ApplianceBreakdownSection appliances={applianceBreakdown} monthlyBill={monthlyBill} />

            {/* State Comparison */}
            {stateInfo && (
              <StateComparison stateInfo={stateInfo} userRate={ratePerKwh} />
            )}

            {/* Methodology */}
            <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Methodology
              </h4>
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                <strong>Formula:</strong> Monthly Bill = (kWh &times; Rate per kWh) + Monthly Base Fee.
                State average rates from the U.S. Energy Information Administration (EIA),
                Electric Power Monthly, Table 5.6.a (2025–2026). National average usage (863 kWh/mo)
                from EIA RECS 2022. Appliance breakdown percentages from EIA&apos;s residential
                energy end-use survey.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
