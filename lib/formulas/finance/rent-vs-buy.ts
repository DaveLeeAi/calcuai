/**
 * Rent vs Buy Calculator
 *
 * Compares total cost of renting vs buying over N years:
 *
 * Rent total = sum of monthly rent * (1 + annualRentIncrease)^year
 *   + opportunity cost of investing the down payment
 *
 * Buy total = Down payment + sum of mortgage payments + property tax
 *   + insurance + maintenance + closing costs - equity built - appreciation
 *
 * Net result = Rent total - Buy total (positive = buying wins)
 *
 * Mortgage payment: M = P[r(1+r)^n] / [(1+r)^n - 1]
 *
 * Source: NY Times rent-vs-buy methodology / CFPB
 */

export function calculateRentVsBuy(inputs: Record<string, unknown>): Record<string, unknown> {
  const homePrice = Number(inputs.homePrice) || 0;
  const downPaymentPercent = (Number(inputs.downPaymentPercent) || 0) / 100;
  const interestRate = (Number(inputs.interestRate) || 0) / 100;
  const loanTermYears = Number(inputs.loanTerm) || 30;
  const monthlyRent = Number(inputs.monthlyRent) || 0;
  const annualRentIncrease = (Number(inputs.annualRentIncrease) || 0) / 100;
  const propertyTaxRate = (Number(inputs.propertyTaxRate) || 0) / 100;
  const annualInsurance = Number(inputs.annualInsurance) || 0;
  const annualMaintenancePercent = (Number(inputs.annualMaintenance) || 0) / 100;
  const homeAppreciation = (Number(inputs.homeAppreciation) || 0) / 100;
  const investmentReturn = (Number(inputs.investmentReturn) || 0) / 100;
  const yearsToCompare = Math.max(1, Math.min(30, Number(inputs.yearsToCompare) || 10));

  if (homePrice <= 0 && monthlyRent <= 0) {
    return {
      recommendation: 'Enter values to compare',
      totalRentCost: 0,
      totalBuyCost: 0,
      breakEvenYear: 0,
      summary: [],
      costComparison: [],
      yearByYear: [],
    };
  }

  const downPayment = homePrice * downPaymentPercent;
  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRate / 12;
  const totalPayments = loanTermYears * 12;

  // Calculate monthly mortgage payment (P&I)
  let monthlyMortgage: number;
  if (monthlyRate === 0 || loanAmount === 0) {
    monthlyMortgage = totalPayments > 0 ? loanAmount / totalPayments : 0;
  } else {
    const factor = Math.pow(1 + monthlyRate, totalPayments);
    monthlyMortgage = loanAmount * (monthlyRate * factor) / (factor - 1);
  }

  // Closing costs estimate (2-5% of home price, use 3%)
  const closingCosts = homePrice * 0.03;

  // Year-by-year comparison
  const costComparison: { year: number; rentTotal: number; buyTotal: number }[] = [];
  const yearByYear: {
    year: number;
    rentTotal: number;
    buyTotal: number;
    difference: number;
  }[] = [];

  let cumulativeRentCost = 0;
  let cumulativeBuyCost = downPayment + closingCosts;
  let currentRent = monthlyRent;
  let loanBalance = loanAmount;
  let currentHomeValue = homePrice;
  let breakEvenYear = 0;
  let foundBreakEven = false;

  // Track opportunity cost of down payment (if renting, invest it instead)
  let downPaymentInvestment = downPayment + closingCosts;
  const monthlyInvestReturn = investmentReturn / 12;

  for (let year = 1; year <= yearsToCompare; year++) {
    // --- Rent side for this year ---
    const yearRent = currentRent * 12;
    cumulativeRentCost += yearRent;

    // Opportunity cost: the down payment grows if invested
    for (let m = 0; m < 12; m++) {
      downPaymentInvestment *= (1 + monthlyInvestReturn);
    }

    // --- Buy side for this year ---
    const yearMortgage = monthlyMortgage * 12;
    const yearPropertyTax = currentHomeValue * propertyTaxRate;
    const yearInsurance = annualInsurance;
    const yearMaintenance = currentHomeValue * annualMaintenancePercent;

    // Track principal paid this year to compute equity
    let principalPaidThisYear = 0;
    for (let m = 0; m < 12; m++) {
      if (loanBalance > 0) {
        const interestPayment = loanBalance * monthlyRate;
        const principalPayment = Math.min(monthlyMortgage - interestPayment, loanBalance);
        principalPaidThisYear += principalPayment;
        loanBalance = Math.max(0, loanBalance - principalPayment);
      }
    }

    const yearBuyOutOfPocket = yearMortgage + yearPropertyTax + yearInsurance + yearMaintenance;
    cumulativeBuyCost += yearBuyOutOfPocket;

    // Home appreciation
    currentHomeValue *= (1 + homeAppreciation);

    // Rent increases for next year
    currentRent *= (1 + annualRentIncrease);

    // Net cost of buying = cumulative cash spent - equity (home value - remaining loan)
    const equity = currentHomeValue - loanBalance;
    const netBuyCost = cumulativeBuyCost - equity;

    // Net cost of renting = cumulative rent - investment gains on down payment
    const investmentGains = downPaymentInvestment - (downPayment + closingCosts);
    const netRentCost = cumulativeRentCost - investmentGains;

    costComparison.push({
      year,
      rentTotal: parseFloat(netRentCost.toFixed(2)),
      buyTotal: parseFloat(netBuyCost.toFixed(2)),
    });

    const difference = parseFloat((netRentCost - netBuyCost).toFixed(2));
    yearByYear.push({
      year,
      rentTotal: parseFloat(netRentCost.toFixed(2)),
      buyTotal: parseFloat(netBuyCost.toFixed(2)),
      difference,
    });

    // Break-even: when buying becomes cheaper than renting
    if (!foundBreakEven && difference > 0) {
      breakEvenYear = year;
      foundBreakEven = true;
    }
  }

  // Final recommendation
  const finalYear = yearByYear[yearByYear.length - 1];
  let recommendation: string;
  if (finalYear && finalYear.difference > 0) {
    recommendation = `Buying saves $${Math.abs(finalYear.difference).toLocaleString('en-US', { maximumFractionDigits: 0 })} over ${yearsToCompare} years`;
  } else if (finalYear && finalYear.difference < 0) {
    recommendation = `Renting saves $${Math.abs(finalYear.difference).toLocaleString('en-US', { maximumFractionDigits: 0 })} over ${yearsToCompare} years`;
  } else {
    recommendation = `Renting and buying cost approximately the same over ${yearsToCompare} years`;
  }

  const totalRentCost = finalYear ? finalYear.rentTotal : 0;
  const totalBuyCost = finalYear ? finalYear.buyTotal : 0;

  // Summary
  const summary: { label: string; value: number | string; format?: string }[] = [
    { label: 'Home Price', value: parseFloat(homePrice.toFixed(2)), format: 'currency' },
    { label: 'Down Payment', value: parseFloat(downPayment.toFixed(2)), format: 'currency' },
    { label: 'Monthly Mortgage (P&I)', value: parseFloat(monthlyMortgage.toFixed(2)), format: 'currency' },
    { label: 'Monthly Rent (starting)', value: parseFloat(monthlyRent.toFixed(2)), format: 'currency' },
    { label: 'Net Cost of Renting', value: parseFloat(totalRentCost.toFixed(2)), format: 'currency' },
    { label: 'Net Cost of Buying', value: parseFloat(totalBuyCost.toFixed(2)), format: 'currency' },
    { label: 'Comparison Period', value: `${yearsToCompare} years` },
  ];

  if (foundBreakEven) {
    summary.push({ label: 'Break-Even Year', value: breakEvenYear });
  } else {
    summary.push({ label: 'Break-Even Year', value: `Not reached in ${yearsToCompare} years` });
  }

  return {
    recommendation,
    totalRentCost: parseFloat(totalRentCost.toFixed(2)),
    totalBuyCost: parseFloat(totalBuyCost.toFixed(2)),
    breakEvenYear: foundBreakEven ? breakEvenYear : 0,
    summary,
    costComparison,
    yearByYear,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'rent-vs-buy': calculateRentVsBuy,
};
