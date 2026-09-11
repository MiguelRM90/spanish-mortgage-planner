export type PaymentDiagnosis = 'APPROVED' | 'RISK';
export type LiquidityDiagnosis = 'SUFFICIENT' | 'INSUFFICIENT';

export interface MortgageResults {
  // Financing outputs
  loanCapital: number;
  monthlyPayment: number;
  totalInterest: number;
  totalLoanCost: number;

  // Expenses & Upfront Capital outputs
  downPayment: number;
  itpAmount: number;
  totalPurchaseExpenses: number;
  totalInitialCapitalNeeded: number;
  totalProjectCost: number;
  liquidityDifference: number; // positive = surplus, negative = deficit
  unfundedInitialCashGap: number; // 0 if sufficient, or abs(liquidityDifference) if insufficient

  // Income, Risk Ratios & Diagnostics
  monthlyNetIncome: number;
  recommendedDebtLimit: number; // 35% of net monthly income
  debtToIncomeRatio: number; // in %
  netDisposableIncome: number; // monthly net income - monthly payment
  paymentDiagnosis: PaymentDiagnosis;
  liquidityDiagnosis: LiquidityDiagnosis;
}

