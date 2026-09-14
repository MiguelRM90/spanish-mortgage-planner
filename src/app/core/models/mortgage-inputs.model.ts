import { RenovationInputs, DEFAULT_RENOVATION_INPUTS } from './renovation.model';

export interface MortgageInputs {
  // Property and Financing
  purchasePrice: number;
  financingPercentage: number;
  loanTermYears: number;
  interestRateTin: number;
  builtSquareMeters?: number; // Superficie construida en m² (default: 120 m², totalmente variable)

  // Expenses and Taxes (Comunidad de Madrid defaults)
  itpRate: number;
  notaryFee: number;
  registryFee: number;
  managementFee: number;
  appraisalFee: number;
  renovationBudget: number; // Presupuesto total de reforma (sincronizado)

  // Renovation and Market Projection
  renovationDetails?: RenovationInputs;
  financeRenovation?: boolean;
  renovationFinancingPercentage?: number;
  projectedMarketValuePerSqMeter?: number;

  // Liquidity and Household Income
  availableSavings: number;
  annualNetIncome: number;
}

export const DEFAULT_MORTGAGE_INPUTS: Readonly<MortgageInputs> = {
  purchasePrice: 750000,
  financingPercentage: 80,
  loanTermYears: 30,
  interestRateTin: 2.50,
  builtSquareMeters: 120,
  itpRate: 6.0,
  notaryFee: 1000,
  registryFee: 500,
  managementFee: 400,
  appraisalFee: 600,
  renovationBudget: 150480, // 120m² * 1100€/m² + 10% IVA + 4% ICIO
  renovationDetails: { ...DEFAULT_RENOVATION_INPUTS },
  financeRenovation: false,
  renovationFinancingPercentage: 0,
  projectedMarketValuePerSqMeter: 7300,
  availableSavings: 183000,
  annualNetIncome: 86758.34,
};

