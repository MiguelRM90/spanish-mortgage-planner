import { RenovationResults } from './renovation.model';

export type PaymentDiagnosis = 'APPROVED' | 'RISK';
export type LiquidityDiagnosis = 'SUFFICIENT' | 'INSUFFICIENT';

export interface MortgageResults {
  // Financing outputs
  loanCapital: number; // Préstamo para el inmueble
  totalLoanCapital: number; // Préstamo total (inmueble + parte de reforma financiada)
  financedRenovationAmount: number; // Importe de reforma financiada en hipoteca
  monthlyPayment: number;
  totalInterest: number;
  totalLoanCost: number;

  // Expenses & Upfront Capital outputs
  downPayment: number;
  itpAmount: number;
  totalPurchaseExpenses: number;
  unfinancedRenovationAmount: number; // Reforma a pagar de fondos propios
  totalInitialCapitalNeeded: number;
  totalProjectCost: number;
  liquidityDifference: number; // positive = surplus, negative = deficit
  unfundedInitialCashGap: number; // 0 if sufficient, or abs(liquidityDifference) if insufficient

  // Renovation & Equity Projections
  renovationResults: RenovationResults;
  projectedMarketValue: number; // Valor de mercado del piso terminado
  netEquityCreated: number; // Plusvalía neta latente
  equityPercentage: number; // Margen sobre coste total (%)

  // Income, Risk Ratios & Diagnostics
  monthlyNetIncome: number;
  recommendedDebtLimit: number; // 35% of net monthly income
  debtToIncomeRatio: number; // in %
  netDisposableIncome: number; // monthly net income - monthly payment
  paymentDiagnosis: PaymentDiagnosis;
  liquidityDiagnosis: LiquidityDiagnosis;
}

