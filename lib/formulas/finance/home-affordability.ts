/**
 * Home Affordability Calculator
 *
 * Calculates the maximum home price a buyer can afford based on the 28/36 rule
 * (also known as the front-end / back-end DTI rule).
 *
 * The 28/36 Rule:
 *   Front-end ratio: Total housing costs should not exceed 28% of gross monthly income.
 *   Back-end ratio: Total debt payments (housing + other debts) should not exceed 36% of gross monthly income.
 *
 * Max monthly housing payment = min(
 *   grossMonthlyIncome × 0.28,
 *   grossMonthlyIncome × 0.36 - monthlyDebts
 * )
 *
 * Max loan amount is derived by reversing the mortgage payment formula:
 *   P = M × [(1+r)^n - 1] / [r × (1+r)^n]
 *
 * Where:
 *   P = max loan amount
 *   M = max monthly P&I payment (after subtracting taxes, insurance, PMI)
 *   r = monthly interest rate
 *   n = total number of monthly payments
 *
 * Max home price = Max loan amount + Down payment
 *
 * Source: Consumer Financial Protection Bureau (CFPB);
 *         Fannie Mae Selling Guide (B3-6-02: DTI ratios);
 *         Freddie Mac Seller/Servicer Guide (Section 5401.1).
 */
export function calculateHomeAffordability(inputs: Record<string, unknown>): Record<string, unknown> {
  const annualIncome = Number(inputs.annualIncome) || 0;
  const monthlyDebts = Number(inputs.monthlyDebts) || 0;
  const downPayment = Number(inputs.downPayment) || 0;
  const interestRate = (Number(inputs.interestRate) || 0) / 100;
  const loanTermYears = parseInt(String(inputs.loanTerm) || '30', 10);
  const loanTermMonths = loanTermYears * 12;
  const propertyTaxRate = (Number(inputs.propertyTaxRate) || 0) / 100;
  const annualInsurance = Number(inputs.annualInsurance) || 0;
  const includePMI = inputs.includePMI !== false;

  const grossMonthlyIncome = annualIncome / 12;

  // 28/36 rule: determine max monthly housing payment
  const frontEndMax = grossMonthlyIncome * 0.28;
  const backEndMax = grossMonthlyIncome * 0.36 - monthlyDebts;
  const maxMonthlyHousing = Math.max(0, Math.min(frontEndMax, backEndMax));

  // Subtract estimated monthly property tax, insurance, and PMI to get max P&I
  // Property tax and PMI depend on home price, so we iterate to find the solution
  const monthlyRate = interestRate / 12;
  const monthlyInsurance = annualInsurance / 12;

  // Iterative approach: start with a rough estimate and converge
  let maxHomePrice = 0;
  let maxLoanAmount = 0;
  let actualMonthlyPayment = 0;
  let monthlyPropertyTax = 0;
  let monthlyPMI = 0;
  let monthlyPI = 0;

  // Start by assuming max P&I = maxMonthlyHousing - insurance
  // Then adjust for property tax and PMI based on resulting home price
  for (let iteration = 0; iteration < 20; iteration++) {
    const availableForPI = maxMonthlyHousing - monthlyPropertyTax - monthlyInsurance - monthlyPMI;

    if (availableForPI <= 0) {
      maxLoanAmount = 0;
      maxHomePrice = downPayment;
      break;
    }

    // Reverse mortgage formula to find max loan amount
    if (monthlyRate === 0) {
      maxLoanAmount = availableForPI * loanTermMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, loanTermMonths);
      maxLoanAmount = availableForPI * (factor - 1) / (monthlyRate * factor);
    }

    maxHomePrice = maxLoanAmount + downPayment;

    // Recalculate property tax and PMI based on new home price
    monthlyPropertyTax = (maxHomePrice * propertyTaxRate) / 12;

    // PMI: if down payment < 20% of home price, add 0.5% annual PMI on loan amount
    const downPaymentPct = maxHomePrice > 0 ? (downPayment / maxHomePrice) * 100 : 100;
    monthlyPMI = (includePMI && downPaymentPct < 20) ? (maxLoanAmount * 0.005) / 12 : 0;

    monthlyPI = availableForPI;
  }

  // Final calculations
  maxHomePrice = parseFloat(Math.max(0, maxHomePrice).toFixed(2));
  maxLoanAmount = parseFloat(Math.max(0, maxLoanAmount).toFixed(2));

  // Compute actual monthly payment breakdown
  if (monthlyRate === 0) {
    monthlyPI = maxLoanAmount > 0 ? maxLoanAmount / loanTermMonths : 0;
  } else {
    const factor = Math.pow(1 + monthlyRate, loanTermMonths);
    monthlyPI = maxLoanAmount * (monthlyRate * factor) / (factor - 1);
  }

  monthlyPropertyTax = (maxHomePrice * propertyTaxRate) / 12;
  const downPaymentPctFinal = maxHomePrice > 0 ? (downPayment / maxHomePrice) * 100 : 100;
  monthlyPMI = (includePMI && downPaymentPctFinal < 20) ? (maxLoanAmount * 0.005) / 12 : 0;
  actualMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyPMI;

  const maxMonthlyPayment = parseFloat(actualMonthlyPayment.toFixed(2));

  // DTI ratios
  const frontEndDTI = grossMonthlyIncome > 0
    ? parseFloat(((actualMonthlyPayment / grossMonthlyIncome) * 100).toFixed(2))
    : 0;
  const backEndDTI = grossMonthlyIncome > 0
    ? parseFloat((((actualMonthlyPayment + monthlyDebts) / grossMonthlyIncome) * 100).toFixed(2))
    : 0;

  // Payment breakdown pie chart
  const paymentBreakdown: { name: string; value: number }[] = [
    { name: 'Principal & Interest', value: parseFloat(monthlyPI.toFixed(2)) },
  ];
  if (monthlyPropertyTax > 0) {
    paymentBreakdown.push({ name: 'Property Tax', value: parseFloat(monthlyPropertyTax.toFixed(2)) });
  }
  if (monthlyInsurance > 0) {
    paymentBreakdown.push({ name: 'Insurance', value: parseFloat(monthlyInsurance.toFixed(2)) });
  }
  if (monthlyPMI > 0) {
    paymentBreakdown.push({ name: 'PMI', value: parseFloat(monthlyPMI.toFixed(2)) });
  }

  // Summary value group
  const summary = [
    { label: 'Max Home Price', value: maxHomePrice },
    { label: 'Max Loan Amount', value: maxLoanAmount },
    { label: 'Max Monthly Payment', value: maxMonthlyPayment },
    { label: 'Down Payment', value: downPayment },
    { label: 'Front-End DTI', value: frontEndDTI },
    { label: 'Back-End DTI', value: backEndDTI },
  ];

  return {
    maxHomePrice,
    maxLoanAmount,
    maxMonthlyPayment,
    frontEndDTI,
    backEndDTI,
    summary,
    paymentBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'home-affordability': calculateHomeAffordability,
};
