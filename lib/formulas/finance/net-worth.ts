/**
 * Net Worth Calculator
 *
 * Net Worth = Total Assets - Total Liabilities
 *
 * Categorizes assets (cash, investments, retirement, real estate, vehicles, other)
 * and liabilities (mortgage, student loans, auto loans, credit cards, other)
 * to produce a detailed breakdown with pie charts.
 *
 * Source: Federal Reserve Survey of Consumer Finances (2022)
 */

export function calculateNetWorth(inputs: Record<string, unknown>): Record<string, unknown> {
  // Assets
  const cashSavings = Number(inputs.cashSavings) || 0;
  const investments = Number(inputs.investments) || 0;
  const retirementAccounts = Number(inputs.retirementAccounts) || 0;
  const homeValue = Number(inputs.homeValue) || 0;
  const otherRealEstate = Number(inputs.otherRealEstate) || 0;
  const vehicleValue = Number(inputs.vehicleValue) || 0;
  const otherAssets = Number(inputs.otherAssets) || 0;

  // Liabilities
  const mortgageBalance = Number(inputs.mortgageBalance) || 0;
  const studentLoans = Number(inputs.studentLoans) || 0;
  const autoLoans = Number(inputs.autoLoans) || 0;
  const creditCardDebt = Number(inputs.creditCardDebt) || 0;
  const otherDebts = Number(inputs.otherDebts) || 0;

  const totalAssets = cashSavings + investments + retirementAccounts + homeValue + otherRealEstate + vehicleValue + otherAssets;
  const totalLiabilities = mortgageBalance + studentLoans + autoLoans + creditCardDebt + otherDebts;
  const netWorth = totalAssets - totalLiabilities;

  const debtToAssetRatio = totalAssets > 0
    ? parseFloat(((totalLiabilities / totalAssets) * 100).toFixed(2))
    : 0;

  // Asset breakdown for pie chart (only non-zero entries)
  const assetBreakdown: { name: string; value: number }[] = [];
  if (cashSavings > 0) assetBreakdown.push({ name: 'Cash & Savings', value: parseFloat(cashSavings.toFixed(2)) });
  if (investments > 0) assetBreakdown.push({ name: 'Investments', value: parseFloat(investments.toFixed(2)) });
  if (retirementAccounts > 0) assetBreakdown.push({ name: 'Retirement Accounts', value: parseFloat(retirementAccounts.toFixed(2)) });
  if (homeValue > 0) assetBreakdown.push({ name: 'Home Value', value: parseFloat(homeValue.toFixed(2)) });
  if (otherRealEstate > 0) assetBreakdown.push({ name: 'Other Real Estate', value: parseFloat(otherRealEstate.toFixed(2)) });
  if (vehicleValue > 0) assetBreakdown.push({ name: 'Vehicles', value: parseFloat(vehicleValue.toFixed(2)) });
  if (otherAssets > 0) assetBreakdown.push({ name: 'Other Assets', value: parseFloat(otherAssets.toFixed(2)) });

  // Liability breakdown for pie chart (only non-zero entries)
  const liabilityBreakdown: { name: string; value: number }[] = [];
  if (mortgageBalance > 0) liabilityBreakdown.push({ name: 'Mortgage', value: parseFloat(mortgageBalance.toFixed(2)) });
  if (studentLoans > 0) liabilityBreakdown.push({ name: 'Student Loans', value: parseFloat(studentLoans.toFixed(2)) });
  if (autoLoans > 0) liabilityBreakdown.push({ name: 'Auto Loans', value: parseFloat(autoLoans.toFixed(2)) });
  if (creditCardDebt > 0) liabilityBreakdown.push({ name: 'Credit Card Debt', value: parseFloat(creditCardDebt.toFixed(2)) });
  if (otherDebts > 0) liabilityBreakdown.push({ name: 'Other Debts', value: parseFloat(otherDebts.toFixed(2)) });

  // Summary value group
  const summary: { label: string; value: number | string; format?: string }[] = [
    { label: 'Total Assets', value: parseFloat(totalAssets.toFixed(2)), format: 'currency' },
    { label: 'Total Liabilities', value: parseFloat(totalLiabilities.toFixed(2)), format: 'currency' },
    { label: 'Net Worth', value: parseFloat(netWorth.toFixed(2)), format: 'currency' },
    { label: 'Debt-to-Asset Ratio', value: `${debtToAssetRatio}%` },
  ];

  // Add assessment
  let assessment: string;
  if (netWorth >= 1000000) {
    assessment = 'Millionaire status — strong financial position';
  } else if (netWorth >= 500000) {
    assessment = 'Well above the U.S. median net worth of $192,900';
  } else if (netWorth >= 192900) {
    assessment = 'At or above the U.S. median net worth';
  } else if (netWorth >= 0) {
    assessment = 'Positive net worth — below the U.S. median of $192,900';
  } else {
    assessment = 'Negative net worth — liabilities exceed assets';
  }
  summary.push({ label: 'Assessment', value: assessment });

  return {
    netWorth: parseFloat(netWorth.toFixed(2)),
    totalAssets: parseFloat(totalAssets.toFixed(2)),
    totalLiabilities: parseFloat(totalLiabilities.toFixed(2)),
    debtToAssetRatio,
    summary,
    assetBreakdown,
    liabilityBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'net-worth': calculateNetWorth,
};
