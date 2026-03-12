# Calculator Spec Schema Reference

Every calculator is defined by a JSON spec file. This file drives the UI rendering, validation, calculation, result display, SEO, and content operations.

## Full Schema

```typescript
interface CalculatorSpec {
  // === IDENTITY ===
  id: string;                    // Unique ID, matches slug (e.g., "mortgage-calculator")
  title: string;                 // Display title (e.g., "Mortgage Calculator")
  slug: string;                  // URL slug (e.g., "mortgage-calculator")
  category: Category;            // Top-level category slug
  subcategory: string;           // Subcategory slug within category

  // === SEO ===
  primaryKeyword: string;        // Must be unique across ALL calculators
  metaTitle: string;             // Max 60 chars. Format: "{Title} — Free Online Calculator | {Brand}"
  metaDescription: string;       // 120-155 chars. Unique. Never starts with "This calculator..."

  // === CALCULATOR LOGIC ===
  inputs: InputField[];          // Ordered list of input fields
  outputs: OutputField[];        // Ordered list of output displays
  formula: string;               // ID of formula module in /lib/formulas/
  features: Feature[];           // Optional advanced features

  // === TABS / MODES ===
  tabs?: TabDefinition[];        // If this calculator has tab variants (e.g., Loan Calc has Auto Loan tab)

  // === CONTENT ===
  relatedCalculators: string[];  // 4-6 calculator IDs. Priority: same subcategory > same category > cross-category
  disclaimer: DisclaimerType;    // "finance" | "health" | "general" | "construction"
  hasFAQ: boolean;               // True only if MDX has genuine FAQ section
  hasMethodologyPage: boolean;   // True if linked to a /methodology/ page

  // === CONTENT FRAMEWORK (added for dual-ranking: Google + AI citation) ===
  formulaCitation: string;       // Authoritative source citation for the formula (e.g., "CFPB", "CFA Institute")
  articleWordTarget: number;     // Target word count based on tier (flagship: 2500, standard: 1400, utility: 800)
  speakableSelectors: string[];  // CSS selectors for Speakable schema (e.g., [".bluf-intro", ".formula-section", ".faq-section"])

  // === OPERATIONAL (v2) ===
  editorialStatus: "draft" | "review" | "published" | "deprecated";
  reviewOwner: string;
  formulaSource: string;         // Citation for where the formula comes from
  formulaAuditDate: string;      // ISO date of last accuracy verification
  priority: "flagship" | "standard" | "utility";  // NOTE: changed "low" to "utility" for content framework alignment
  targetIntent: "informational" | "transactional" | "navigational";
  monetizationType: "ads" | "affiliate" | "lead-gen" | "ads+affiliate" | "none";
  mergeCandidateOf: string | null;     // If this should be a tab, name parent ID
  duplicationRisk: string[];           // IDs of calculators with overlap risk
  qualityScore: number;                // 0-100 from quality scoring
  lastContentUpdate: string;           // ISO date
  seasonality: string | null;          // null | "tax-season" | "back-to-school" | "new-year" | etc.
}

type Category = "finance" | "health" | "math" | "construction" | "science" | "everyday" | "business" | "conversion";

type Feature = "chart" | "amortization-table" | "compare-scenarios" | "shareable-url" | "print-results" | "presets";

type DisclaimerType = "finance" | "health" | "general" | "construction";
```

## Input Field Schema

```typescript
interface InputField {
  id: string;                    // Unique within this calculator (e.g., "loanAmount")
  label: string;                 // Display label (e.g., "Loan Amount")
  type: InputType;               // See Input Types below
  required: boolean;
  defaultValue?: number | string;
  placeholder?: string;

  // Validation
  min?: number;
  max?: number;
  step?: number;

  // For select/radio types
  options?: { value: string; label: string }[];

  // For unit-pair type
  units?: { value: string; label: string; conversionFactor: number }[];
  defaultUnit?: string;

  // For currency type
  prefix?: string;               // Default "$"

  // For percentage type
  suffix?: string;               // Default "%"

  // Dependencies
  dependsOn?: string;            // ID of another input this depends on
  maxDependency?: string;        // e.g., "downPayment" max depends on "homePrice"

  // Help text
  helpText?: string;             // Tooltip or small text below input
}

type InputType = "number" | "currency" | "percentage" | "date" | "select" | "toggle" | "range" | "radio" | "unit-pair";
```

## Output Field Schema

```typescript
interface OutputField {
  id: string;                    // Unique within this calculator
  label: string;                 // Display label (e.g., "Monthly Payment")
  type: OutputType;              // See Output Types below
  format?: "currency" | "percentage" | "number" | "date" | "text";
  precision?: number;            // Decimal places
  highlight?: boolean;           // If true, displayed prominently as primary result

  // For chart types
  chartConfig?: {
    xLabel?: string;
    yLabel?: string;
    colors?: string[];
  };

  // For table type
  columns?: { key: string; label: string; format?: string }[];

  // For gauge type
  gaugeConfig?: {
    min: number;
    max: number;
    ranges: { min: number; max: number; label: string; color: string }[];
  };
}

type OutputType = "single-value" | "value-group" | "table" | "chart-pie" | "chart-line" | "chart-bar" | "gauge" | "comparison";
```

## Tab Definition Schema

```typescript
interface TabDefinition {
  id: string;                    // e.g., "auto-loan"
  label: string;                 // Tab display text (e.g., "Auto Loan")
  description?: string;          // Optional description shown on tab
  defaultInputOverrides: Record<string, any>;  // Default values that differ from base calculator
  visibleInputs?: string[];      // If set, only show these inputs on this tab (hides others)
}
```

## Example Spec: Mortgage Calculator

```json
{
  "id": "mortgage-calculator",
  "title": "Mortgage Calculator",
  "slug": "mortgage-calculator",
  "category": "finance",
  "subcategory": "mortgage",

  "primaryKeyword": "mortgage calculator",
  "metaTitle": "Mortgage Calculator — Free Monthly Payment Calculator",
  "metaDescription": "Calculate your monthly mortgage payment with principal, interest, taxes, and insurance. See your full amortization schedule. Free, no signup required.",

  "inputs": [
    {
      "id": "homePrice",
      "label": "Home Price",
      "type": "currency",
      "required": true,
      "defaultValue": 350000,
      "min": 10000,
      "max": 10000000,
      "step": 1000,
      "prefix": "$"
    },
    {
      "id": "downPayment",
      "label": "Down Payment",
      "type": "currency",
      "required": true,
      "defaultValue": 70000,
      "min": 0,
      "maxDependency": "homePrice",
      "prefix": "$"
    },
    {
      "id": "downPaymentPercent",
      "label": "Down Payment %",
      "type": "percentage",
      "required": false,
      "defaultValue": 20,
      "min": 0,
      "max": 100,
      "dependsOn": "downPayment",
      "helpText": "Syncs with down payment amount"
    },
    {
      "id": "interestRate",
      "label": "Interest Rate",
      "type": "percentage",
      "required": true,
      "defaultValue": 6.5,
      "min": 0.1,
      "max": 25,
      "step": 0.125
    },
    {
      "id": "loanTerm",
      "label": "Loan Term",
      "type": "select",
      "required": true,
      "defaultValue": "30",
      "options": [
        { "value": "10", "label": "10 years" },
        { "value": "15", "label": "15 years" },
        { "value": "20", "label": "20 years" },
        { "value": "30", "label": "30 years" }
      ]
    },
    {
      "id": "propertyTax",
      "label": "Annual Property Tax",
      "type": "currency",
      "required": false,
      "defaultValue": 3500,
      "min": 0,
      "helpText": "Annual property tax amount"
    },
    {
      "id": "homeInsurance",
      "label": "Annual Home Insurance",
      "type": "currency",
      "required": false,
      "defaultValue": 1200,
      "min": 0
    },
    {
      "id": "includePMI",
      "label": "Include PMI",
      "type": "toggle",
      "defaultValue": true,
      "helpText": "Private mortgage insurance (required if down payment < 20%)"
    }
  ],

  "outputs": [
    {
      "id": "monthlyPayment",
      "label": "Monthly Payment",
      "type": "single-value",
      "format": "currency",
      "highlight": true
    },
    {
      "id": "paymentBreakdown",
      "label": "Payment Breakdown",
      "type": "chart-pie",
      "chartConfig": {
        "colors": ["#1A6FA0", "#2ECC71", "#E74C3C", "#F39C12"]
      }
    },
    {
      "id": "loanSummary",
      "label": "Loan Summary",
      "type": "value-group",
      "format": "currency"
    },
    {
      "id": "amortizationSchedule",
      "label": "Amortization Schedule",
      "type": "table",
      "columns": [
        { "key": "month", "label": "Month" },
        { "key": "payment", "label": "Payment", "format": "currency" },
        { "key": "principal", "label": "Principal", "format": "currency" },
        { "key": "interest", "label": "Interest", "format": "currency" },
        { "key": "balance", "label": "Remaining Balance", "format": "currency" }
      ]
    },
    {
      "id": "balanceOverTime",
      "label": "Balance Over Time",
      "type": "chart-line",
      "chartConfig": {
        "xLabel": "Year",
        "yLabel": "Balance ($)",
        "colors": ["#1A6FA0"]
      }
    }
  ],

  "formula": "mortgage-payment",
  "features": ["chart", "amortization-table", "compare-scenarios", "shareable-url", "print-results"],

  "relatedCalculators": [
    "amortization-calculator",
    "refinance-calculator",
    "home-affordability-calculator",
    "down-payment-calculator",
    "loan-calculator"
  ],
  "disclaimer": "finance",
  "hasFAQ": true,
  "hasMethodologyPage": false,

  "editorialStatus": "published",
  "reviewOwner": "dave",
  "formulaSource": "Standard fixed-rate mortgage amortization formula (M = P[r(1+r)^n]/[(1+r)^n-1])",
  "formulaAuditDate": "2026-03-10",
  "priority": "flagship",
  "targetIntent": "transactional",
  "monetizationType": "ads+affiliate",
  "mergeCandidateOf": null,
  "duplicationRisk": ["home-affordability-calculator", "payment-calculator"],
  "qualityScore": 92,
  "lastContentUpdate": "2026-03-10",
  "seasonality": null
}
```

## Formula Module Pattern

```typescript
// /lib/formulas/finance/mortgage-payment.ts

export interface MortgageInput {
  principal: number;      // Loan amount (home price - down payment)
  annualRate: number;     // Annual interest rate as decimal (6.5% = 0.065)
  termMonths: number;     // Loan term in months
  monthlyTax?: number;    // Monthly property tax
  monthlyInsurance?: number;
  monthlyPMI?: number;
}

export interface MortgageOutput {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalAndInterest: number;
  breakdown: {
    principal: number;
    interest: number;
    tax: number;
    insurance: number;
    pmi: number;
  };
  amortizationSchedule: AmortizationRow[];
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Standard fixed-rate mortgage payment formula:
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 *
 * Where:
 *   M = monthly payment (principal + interest only)
 *   P = principal (loan amount)
 *   r = monthly interest rate (annual rate / 12)
 *   n = number of payments (term in months)
 */
export function calculateMortgage(input: MortgageInput): MortgageOutput {
  const { principal, annualRate, termMonths } = input;
  const monthlyRate = annualRate / 12;

  let principalAndInterest: number;

  if (monthlyRate === 0) {
    principalAndInterest = principal / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    principalAndInterest = principal * (monthlyRate * factor) / (factor - 1);
  }

  const tax = input.monthlyTax || 0;
  const insurance = input.monthlyInsurance || 0;
  const pmi = input.monthlyPMI || 0;

  const monthlyPayment = principalAndInterest + tax + insurance + pmi;
  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = (principalAndInterest * termMonths) - principal;

  // Generate amortization schedule
  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = principalAndInterest - interestPayment;
    balance -= principalPayment;

    schedule.push({
      month,
      payment: principalAndInterest,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });
  }

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    principalAndInterest,
    breakdown: {
      principal: principalAndInterest - (balance > 0 ? balance * monthlyRate : 0),
      interest: balance > 0 ? balance * monthlyRate : 0,
      tax,
      insurance,
      pmi,
    },
    amortizationSchedule: schedule,
  };
}
```

## Unit Test Pattern

```typescript
// /__tests__/formulas/finance/mortgage-payment.test.ts

import { calculateMortgage } from '@/lib/formulas/finance/mortgage-payment';

describe('calculateMortgage', () => {
  it('calculates standard 30-year fixed mortgage correctly', () => {
    const result = calculateMortgage({
      principal: 280000,
      annualRate: 0.065,
      termMonths: 360,
    });
    // Known correct value: $1,770.49/mo for $280k at 6.5% over 30 years
    expect(result.principalAndInterest).toBeCloseTo(1770.49, 0);
  });

  it('calculates 15-year mortgage correctly', () => {
    const result = calculateMortgage({
      principal: 280000,
      annualRate: 0.06,
      termMonths: 180,
    });
    expect(result.principalAndInterest).toBeCloseTo(2363.41, 0);
  });

  it('handles zero interest rate', () => {
    const result = calculateMortgage({
      principal: 120000,
      annualRate: 0,
      termMonths: 360,
    });
    expect(result.principalAndInterest).toBeCloseTo(333.33, 0);
  });

  it('includes tax and insurance in monthly payment', () => {
    const result = calculateMortgage({
      principal: 280000,
      annualRate: 0.065,
      termMonths: 360,
      monthlyTax: 291.67,
      monthlyInsurance: 100,
    });
    expect(result.monthlyPayment).toBeCloseTo(2162.16, 0);
  });

  it('generates correct amortization schedule length', () => {
    const result = calculateMortgage({
      principal: 280000,
      annualRate: 0.065,
      termMonths: 360,
    });
    expect(result.amortizationSchedule).toHaveLength(360);
  });

  it('amortization schedule ends near zero balance', () => {
    const result = calculateMortgage({
      principal: 280000,
      annualRate: 0.065,
      termMonths: 360,
    });
    const lastRow = result.amortizationSchedule[359];
    expect(lastRow.balance).toBeCloseTo(0, 0);
  });

  // ... minimum 10 test cases per formula
});
```
