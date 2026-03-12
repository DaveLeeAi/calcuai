/**
 * AUTO-GENERATED — Do not edit manually.
 * Run: npm run generate:registry
 * Source: scripts/generate-formula-registry.ts
 *
 * 87 modules, 89 formula IDs
 * Generated: 2026-03-12
 */
import type { FormulaFunction } from '@/lib/types';

// Business
import { FORMULA_REGISTRY as business_break_even } from './business/break-even';
import { FORMULA_REGISTRY as business_business_sales_tax } from './business/business-sales-tax';
import { FORMULA_REGISTRY as business_commission } from './business/commission';
import { FORMULA_REGISTRY as business_employee_cost } from './business/employee-cost';
import { FORMULA_REGISTRY as business_gross_margin } from './business/gross-margin';
import { FORMULA_REGISTRY as business_markup } from './business/markup';
import { FORMULA_REGISTRY as business_overtime } from './business/overtime';
import { FORMULA_REGISTRY as business_payroll } from './business/payroll';
import { FORMULA_REGISTRY as business_profit } from './business/profit';
import { FORMULA_REGISTRY as business_revenue } from './business/revenue';
import { FORMULA_REGISTRY as business_roi } from './business/roi';

// Construction
import { FORMULA_REGISTRY as construction_board_foot } from './construction/board-foot';
import { FORMULA_REGISTRY as construction_concrete_volume } from './construction/concrete-volume';
import { FORMULA_REGISTRY as construction_drywall } from './construction/drywall';
import { FORMULA_REGISTRY as construction_fence } from './construction/fence';
import { FORMULA_REGISTRY as construction_flooring } from './construction/flooring';
import { FORMULA_REGISTRY as construction_paint_coverage } from './construction/paint-coverage';
import { FORMULA_REGISTRY as construction_roofing } from './construction/roofing';
import { FORMULA_REGISTRY as construction_square_footage } from './construction/square-footage';
import { FORMULA_REGISTRY as construction_volume_material } from './construction/volume-material';

// Conversion
import { FORMULA_REGISTRY as conversion_unit_convert } from './conversion/unit-convert';

// Everyday
import { FORMULA_REGISTRY as everyday_date_diff } from './everyday/date-diff';
import { FORMULA_REGISTRY as everyday_discount } from './everyday/discount';
import { FORMULA_REGISTRY as everyday_electricity_cost } from './everyday/electricity-cost';
import { FORMULA_REGISTRY as everyday_final_grade } from './everyday/final-grade';
import { FORMULA_REGISTRY as everyday_fuel_cost } from './everyday/fuel-cost';
import { FORMULA_REGISTRY as everyday_gpa } from './everyday/gpa';
import { FORMULA_REGISTRY as everyday_grade } from './everyday/grade';
import { FORMULA_REGISTRY as everyday_time_math } from './everyday/time-math';
import { FORMULA_REGISTRY as everyday_timezone } from './everyday/timezone';
import { FORMULA_REGISTRY as everyday_tip_calc } from './everyday/tip-calc';

// Finance
import { FORMULA_REGISTRY as finance_401k_growth } from './finance/401k-growth';
import { FORMULA_REGISTRY as finance_amortization } from './finance/amortization';
import { FORMULA_REGISTRY as finance_annuity } from './finance/annuity';
import { FORMULA_REGISTRY as finance_auto_loan } from './finance/auto-loan';
import { FORMULA_REGISTRY as finance_cd_return } from './finance/cd-return';
import { FORMULA_REGISTRY as finance_compound_interest } from './finance/compound-interest';
import { FORMULA_REGISTRY as finance_debt_payoff } from './finance/debt-payoff';
import { FORMULA_REGISTRY as finance_down_payment } from './finance/down-payment';
import { FORMULA_REGISTRY as finance_future_value } from './finance/future-value';
import { FORMULA_REGISTRY as finance_home_affordability } from './finance/home-affordability';
import { FORMULA_REGISTRY as finance_income_tax } from './finance/income-tax';
import { FORMULA_REGISTRY as finance_inflation } from './finance/inflation';
import { FORMULA_REGISTRY as finance_interest_rate_solve } from './finance/interest-rate-solve';
import { FORMULA_REGISTRY as finance_investment_growth } from './finance/investment-growth';
import { FORMULA_REGISTRY as finance_loan_payment } from './finance/loan-payment';
import { FORMULA_REGISTRY as finance_mortgage_payment } from './finance/mortgage-payment';
import { FORMULA_REGISTRY as finance_net_worth } from './finance/net-worth';
import { FORMULA_REGISTRY as finance_present_value } from './finance/present-value';
import { FORMULA_REGISTRY as finance_refinance_breakeven } from './finance/refinance-breakeven';
import { FORMULA_REGISTRY as finance_rent_vs_buy } from './finance/rent-vs-buy';
import { FORMULA_REGISTRY as finance_retirement_projection } from './finance/retirement-projection';
import { FORMULA_REGISTRY as finance_salary_convert } from './finance/salary-convert';
import { FORMULA_REGISTRY as finance_sales_tax } from './finance/sales-tax';
import { FORMULA_REGISTRY as finance_savings_growth } from './finance/savings-growth';
import { FORMULA_REGISTRY as finance_simple_interest } from './finance/simple-interest';
import { FORMULA_REGISTRY as finance_tax_brackets } from './finance/tax-brackets';

// Health
import { FORMULA_REGISTRY as health_bmi } from './health/bmi';
import { FORMULA_REGISTRY as health_bmr } from './health/bmr';
import { FORMULA_REGISTRY as health_body_fat } from './health/body-fat';
import { FORMULA_REGISTRY as health_calorie_needs } from './health/calorie-needs';
import { FORMULA_REGISTRY as health_conception } from './health/conception';
import { FORMULA_REGISTRY as health_due_date } from './health/due-date';
import { FORMULA_REGISTRY as health_heart_rate_zones } from './health/heart-rate-zones';
import { FORMULA_REGISTRY as health_ideal_weight } from './health/ideal-weight';
import { FORMULA_REGISTRY as health_lean_body_mass } from './health/lean-body-mass';
import { FORMULA_REGISTRY as health_macros } from './health/macros';
import { FORMULA_REGISTRY as health_one_rep_max } from './health/one-rep-max';
import { FORMULA_REGISTRY as health_pace } from './health/pace';
import { FORMULA_REGISTRY as health_pregnancy } from './health/pregnancy';

// Math
import { FORMULA_REGISTRY as math_central_tendency } from './math/central-tendency';
import { FORMULA_REGISTRY as math_circle } from './math/circle';
import { FORMULA_REGISTRY as math_exponents } from './math/exponents';
import { FORMULA_REGISTRY as math_fractions } from './math/fractions';
import { FORMULA_REGISTRY as math_gcf_lcm } from './math/gcf-lcm';
import { FORMULA_REGISTRY as math_logarithm } from './math/logarithm';
import { FORMULA_REGISTRY as math_percentage } from './math/percentage';
import { FORMULA_REGISTRY as math_probability } from './math/probability';
import { FORMULA_REGISTRY as math_quadratic } from './math/quadratic';
import { FORMULA_REGISTRY as math_ratio } from './math/ratio';
import { FORMULA_REGISTRY as math_standard_deviation } from './math/standard-deviation';
import { FORMULA_REGISTRY as math_triangle_solver } from './math/triangle-solver';

// Science
import { FORMULA_REGISTRY as science_density } from './science/density';
import { FORMULA_REGISTRY as science_energy } from './science/energy';
import { FORMULA_REGISTRY as science_ohms_law } from './science/ohms-law';
import { FORMULA_REGISTRY as science_pressure } from './science/pressure';
import { FORMULA_REGISTRY as science_velocity } from './science/velocity';

const formulaRegistry: Record<string, FormulaFunction> = {
  // Business
  ...business_break_even,
  ...business_business_sales_tax,
  ...business_commission,
  ...business_employee_cost,
  ...business_gross_margin,
  ...business_markup,
  ...business_overtime,
  ...business_payroll,
  ...business_profit,
  ...business_revenue,
  ...business_roi,
  // Construction
  ...construction_board_foot,
  ...construction_concrete_volume,
  ...construction_drywall,
  ...construction_fence,
  ...construction_flooring,
  ...construction_paint_coverage,
  ...construction_roofing,
  ...construction_square_footage,
  ...construction_volume_material,
  // Conversion
  ...conversion_unit_convert,
  // Everyday
  ...everyday_date_diff,
  ...everyday_discount,
  ...everyday_electricity_cost,
  ...everyday_final_grade,
  ...everyday_fuel_cost,
  ...everyday_gpa,
  ...everyday_grade,
  ...everyday_time_math,
  ...everyday_timezone,
  ...everyday_tip_calc,
  // Finance
  ...finance_401k_growth,
  ...finance_amortization,
  ...finance_annuity,
  ...finance_auto_loan,
  ...finance_cd_return,
  ...finance_compound_interest,
  ...finance_debt_payoff,
  ...finance_down_payment,
  ...finance_future_value,
  ...finance_home_affordability,
  ...finance_income_tax,
  ...finance_inflation,
  ...finance_interest_rate_solve,
  ...finance_investment_growth,
  ...finance_loan_payment,
  ...finance_mortgage_payment,
  ...finance_net_worth,
  ...finance_present_value,
  ...finance_refinance_breakeven,
  ...finance_rent_vs_buy,
  ...finance_retirement_projection,
  ...finance_salary_convert,
  ...finance_sales_tax,
  ...finance_savings_growth,
  ...finance_simple_interest,
  ...finance_tax_brackets,
  // Health
  ...health_bmi,
  ...health_bmr,
  ...health_body_fat,
  ...health_calorie_needs,
  ...health_conception,
  ...health_due_date,
  ...health_heart_rate_zones,
  ...health_ideal_weight,
  ...health_lean_body_mass,
  ...health_macros,
  ...health_one_rep_max,
  ...health_pace,
  ...health_pregnancy,
  // Math
  ...math_central_tendency,
  ...math_circle,
  ...math_exponents,
  ...math_fractions,
  ...math_gcf_lcm,
  ...math_logarithm,
  ...math_percentage,
  ...math_probability,
  ...math_quadratic,
  ...math_ratio,
  ...math_standard_deviation,
  ...math_triangle_solver,
  // Science
  ...science_density,
  ...science_energy,
  ...science_ohms_law,
  ...science_pressure,
  ...science_velocity,
};

export function getFormula(id: string): FormulaFunction {
  const fn = formulaRegistry[id];
  if (!fn) {
    throw new Error(
      `Formula not found: "${id}". Run "npm run generate:registry" to rebuild the formula index.`
    );
  }
  return fn;
}

export default formulaRegistry;
