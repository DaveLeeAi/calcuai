/**
 * Closing Cost Calculator
 *
 * Estimates buyer or seller closing costs based on home price, down payment,
 * loan type, and other factors.
 *
 * Buyer closing costs typically range 2%–5% of the home price and include
 * origination fees, title insurance, appraisal, inspection, prepaid items,
 * and government fees. FHA and VA loans add upfront mortgage insurance or
 * funding fees.
 *
 * Seller closing costs typically range 6%–8% and are dominated by agent
 * commissions and transfer taxes.
 *
 * Source: Consumer Financial Protection Bureau (CFPB)
 */
export function calculateClosingCosts(inputs: Record<string, unknown>): Record<string, unknown> {
  const homePrice = Number(inputs.homePrice) || 0;
  const downPaymentPercent = Number(inputs.downPaymentPercent) || 0;
  const loanType = String(inputs.loanType || 'conventional');
  const isNewConstruction = inputs.isNewConstruction === true || inputs.isNewConstruction === 'true';
  const buyerOrSeller = String(inputs.buyerOrSeller || 'buyer');

  if (homePrice <= 0) {
    if (buyerOrSeller === 'seller') {
      return {
        agentCommission: 0,
        transferTax: 0,
        titleInsurance: 0,
        attorneyFee: 0,
        recordingFee: 0,
        proRatedTax: 0,
        totalSellerCosts: 0,
        sellerCostPercent: 0,
        netProceeds: 0,
        costBreakdown: [],
      };
    }
    return {
      loanAmount: 0,
      originationFee: 0,
      appraisalFee: 0,
      creditReportFee: 0,
      titleInsurance: 0,
      titleSearchFee: 0,
      attorneyFee: 0,
      recordingFee: 0,
      surveyFee: 0,
      homeInspection: 0,
      floodCertification: 0,
      prepaidInterest: 0,
      homeownersInsurance: 0,
      propertyTaxEscrow: 0,
      pmiFirstYear: 0,
      fhaUpfrontMIP: 0,
      vaFundingFee: 0,
      totalClosingCosts: 0,
      closingCostPercent: 0,
      totalCashNeeded: 0,
      costBreakdown: [],
    };
  }

  // ── Seller Costs ──
  if (buyerOrSeller === 'seller') {
    const agentCommission = parseFloat((homePrice * 0.05).toFixed(2));
    const transferTax = parseFloat((homePrice * 0.002).toFixed(2));
    const titleInsurance = parseFloat((homePrice * 0.005).toFixed(2));
    const attorneyFee = 750;
    const recordingFee = 125;
    const proRatedTax = parseFloat(((homePrice * 0.012) / 12 * 6).toFixed(2));

    const totalSellerCosts = parseFloat(
      (agentCommission + transferTax + titleInsurance + attorneyFee + recordingFee + proRatedTax).toFixed(2)
    );
    const sellerCostPercent = parseFloat(((totalSellerCosts / homePrice) * 100).toFixed(2));
    const netProceeds = parseFloat((homePrice - totalSellerCosts).toFixed(2));

    const costBreakdown = [
      { label: 'Agent Commission (5%)', value: agentCommission },
      { label: 'Transfer Tax', value: transferTax },
      { label: 'Title Insurance', value: titleInsurance },
      { label: 'Attorney Fee', value: attorneyFee },
      { label: 'Recording Fee', value: recordingFee },
      { label: 'Pro-Rated Property Tax', value: proRatedTax },
    ];

    // Seller cost breakdown chart — {name, value}[] for pie chart rendering
    const costBreakdownChart = [
      { name: 'Agent Commission', value: agentCommission },
      { name: 'Title Insurance', value: titleInsurance },
      { name: 'Pro-Rated Tax', value: proRatedTax },
      { name: 'Transfer Tax', value: transferTax },
      { name: 'Attorney & Recording', value: parseFloat((attorneyFee + recordingFee).toFixed(2)) },
    ].filter(item => item.value > 0);

    return {
      agentCommission,
      transferTax,
      titleInsurance,
      attorneyFee,
      recordingFee,
      proRatedTax,
      totalSellerCosts,
      sellerCostPercent,
      netProceeds,
      costBreakdown,
      costBreakdownChart,
    };
  }

  // ── Buyer Costs ──
  const downPaymentAmount = homePrice * (downPaymentPercent / 100);
  const loanAmount = parseFloat(Math.max(0, homePrice - downPaymentAmount).toFixed(2));

  // Lender fees
  const originationFee = parseFloat((loanAmount * 0.01).toFixed(2));
  const appraisalFee = 400;
  const creditReportFee = 50;

  // Title & legal fees
  const titleInsurance = parseFloat((homePrice * 0.005).toFixed(2));
  const titleSearchFee = 200;
  const attorneyFee = 750;
  const recordingFee = 125;

  // Inspection fees
  const surveyFee = isNewConstruction ? 500 : 0;
  const homeInspection = 350;
  const floodCertification = 25;

  // Prepaid items
  const assumedRate = 0.07; // 7% assumed annual rate for prepaid interest
  const prepaidInterest = parseFloat(((loanAmount * assumedRate / 365) * 15).toFixed(2));
  const homeownersInsurance = parseFloat((homePrice * 0.0035).toFixed(2));
  const propertyTaxEscrow = parseFloat(((homePrice * 0.012) / 12 * 3).toFixed(2));

  // Mortgage insurance / funding fees
  const pmiFirstYear = downPaymentPercent < 20 ? parseFloat((loanAmount * 0.005).toFixed(2)) : 0;
  const fhaUpfrontMIP = loanType === 'fha' ? parseFloat((loanAmount * 0.0175).toFixed(2)) : 0;
  const vaFundingFee = loanType === 'va' ? parseFloat((loanAmount * 0.023).toFixed(2)) : 0;

  const totalClosingCosts = parseFloat(
    (
      originationFee +
      appraisalFee +
      creditReportFee +
      titleInsurance +
      titleSearchFee +
      attorneyFee +
      recordingFee +
      surveyFee +
      homeInspection +
      floodCertification +
      prepaidInterest +
      homeownersInsurance +
      propertyTaxEscrow +
      pmiFirstYear +
      fhaUpfrontMIP +
      vaFundingFee
    ).toFixed(2)
  );

  const closingCostPercent = parseFloat(((totalClosingCosts / homePrice) * 100).toFixed(2));
  const totalCashNeeded = parseFloat((downPaymentAmount + totalClosingCosts).toFixed(2));

  const costBreakdown = [
    { label: 'Loan Origination Fee (1%)', value: originationFee },
    { label: 'Appraisal Fee', value: appraisalFee },
    { label: 'Credit Report Fee', value: creditReportFee },
    { label: 'Title Insurance', value: titleInsurance },
    { label: 'Title Search Fee', value: titleSearchFee },
    { label: 'Attorney Fee', value: attorneyFee },
    { label: 'Recording Fee', value: recordingFee },
    ...(surveyFee > 0 ? [{ label: 'Survey Fee', value: surveyFee }] : []),
    { label: 'Home Inspection', value: homeInspection },
    { label: 'Flood Certification', value: floodCertification },
    { label: 'Prepaid Interest (15 days)', value: prepaidInterest },
    { label: 'Homeowners Insurance (1 yr)', value: homeownersInsurance },
    { label: 'Property Tax Escrow (3 mo)', value: propertyTaxEscrow },
    ...(pmiFirstYear > 0 ? [{ label: 'PMI (1st year)', value: pmiFirstYear }] : []),
    ...(fhaUpfrontMIP > 0 ? [{ label: 'FHA Upfront MIP (1.75%)', value: fhaUpfrontMIP }] : []),
    ...(vaFundingFee > 0 ? [{ label: 'VA Funding Fee (2.3%)', value: vaFundingFee }] : []),
  ];

  // Buyer cost breakdown chart — grouped categories for pie chart
  const lenderFees = parseFloat((originationFee + appraisalFee + creditReportFee).toFixed(2));
  const titleLegalFees = parseFloat((titleInsurance + titleSearchFee + attorneyFee + recordingFee + (surveyFee ?? 0)).toFixed(2));
  const inspectionFees = parseFloat((homeInspection + floodCertification).toFixed(2));
  const prepaidItems = parseFloat((prepaidInterest + homeownersInsurance + propertyTaxEscrow).toFixed(2));
  const mortgageInsurance = parseFloat((pmiFirstYear + fhaUpfrontMIP + vaFundingFee).toFixed(2));

  const costBreakdownChart = [
    { name: 'Lender Fees', value: lenderFees },
    { name: 'Title & Legal', value: titleLegalFees },
    { name: 'Inspection Fees', value: inspectionFees },
    { name: 'Prepaid Items', value: prepaidItems },
    { name: 'Mortgage Insurance', value: mortgageInsurance },
  ].filter(item => item.value > 0);

  return {
    loanAmount,
    originationFee,
    appraisalFee,
    creditReportFee,
    titleInsurance,
    titleSearchFee,
    attorneyFee,
    recordingFee,
    surveyFee,
    homeInspection,
    floodCertification,
    prepaidInterest,
    homeownersInsurance,
    propertyTaxEscrow,
    pmiFirstYear,
    fhaUpfrontMIP,
    vaFundingFee,
    totalClosingCosts,
    closingCostPercent,
    totalCashNeeded,
    costBreakdown,
    costBreakdownChart,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'closing-costs': calculateClosingCosts,
};
