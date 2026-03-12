export interface MortgageInput {
  homePrice: number;
  downPayment: number;
  interestRate: number;     // As percentage (e.g. 6.5)
  loanTerm: string;         // Years as string from select
  propertyTax?: number;     // Annual
  homeInsurance?: number;   // Annual
  includePMI?: boolean;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface MortgageOutput {
  monthlyPayment: number;
  loanSummary: { label: string; value: number }[];
  paymentBreakdown: { name: string; value: number }[];
  amortizationSchedule: AmortizationRow[];
  balanceOverTime: { year: number; balance: number }[];
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
 *
 * Source: Consumer Financial Protection Bureau (CFPB)
 */
export function calculateMortgage(inputs: Record<string, unknown>): Record<string, unknown> {
  const homePrice = Number(inputs.homePrice) || 0;
  const downPayment = Number(inputs.downPayment) || 0;
  const annualRate = (Number(inputs.interestRate) || 0) / 100;
  const termYears = parseInt(String(inputs.loanTerm) || '30', 10);
  const termMonths = termYears * 12;
  const annualTax = Number(inputs.propertyTax) || 0;
  const annualInsurance = Number(inputs.homeInsurance) || 0;
  const includePMI = inputs.includePMI !== false;

  const principal = homePrice - downPayment;
  const monthlyRate = annualRate / 12;

  // P&I calculation
  let principalAndInterest: number;
  if (monthlyRate === 0) {
    principalAndInterest = principal / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    principalAndInterest = principal * (monthlyRate * factor) / (factor - 1);
  }

  const monthlyTax = annualTax / 12;
  const monthlyInsurance = annualInsurance / 12;
  const downPaymentPct = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
  const monthlyPMI = includePMI && downPaymentPct < 20 ? principal * 0.005 / 12 : 0;

  const monthlyPayment = principalAndInterest + monthlyTax + monthlyInsurance + monthlyPMI;
  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = (principalAndInterest * termMonths) - principal;

  // Amortization schedule
  const schedule: AmortizationRow[] = [];
  const balanceOverTime: { year: number; balance: number }[] = [{ year: 0, balance: principal }];
  let balance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = principalAndInterest - interestPayment;
    balance = Math.max(0, balance - principalPayment);

    schedule.push({
      month,
      payment: parseFloat(principalAndInterest.toFixed(2)),
      principal: parseFloat(principalPayment.toFixed(2)),
      interest: parseFloat(interestPayment.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
    });

    if (month % 12 === 0) {
      balanceOverTime.push({ year: month / 12, balance: parseFloat(balance.toFixed(0)) });
    }
  }

  // Payment breakdown for pie chart
  const paymentBreakdown = [
    { name: 'Principal & Interest', value: parseFloat(principalAndInterest.toFixed(2)) },
  ];
  if (monthlyTax > 0) paymentBreakdown.push({ name: 'Property Tax', value: parseFloat(monthlyTax.toFixed(2)) });
  if (monthlyInsurance > 0) paymentBreakdown.push({ name: 'Insurance', value: parseFloat(monthlyInsurance.toFixed(2)) });
  if (monthlyPMI > 0) paymentBreakdown.push({ name: 'PMI', value: parseFloat(monthlyPMI.toFixed(2)) });

  // Loan summary for value group
  const loanSummary = [
    { label: 'Loan Amount', value: parseFloat(principal.toFixed(2)) },
    { label: 'Total Interest', value: parseFloat(totalInterest.toFixed(2)) },
    { label: 'Total Cost', value: parseFloat(totalPayment.toFixed(2)) },
    { label: 'Payoff Date', value: termYears },
  ];

  return {
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    loanSummary,
    paymentBreakdown,
    amortizationSchedule: schedule,
    balanceOverTime,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'mortgage-payment': calculateMortgage,
};
