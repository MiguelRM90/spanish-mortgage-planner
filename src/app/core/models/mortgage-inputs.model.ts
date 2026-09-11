export interface MortgageInputs {
  // Property and Financing
  purchasePrice: number;
  financingPercentage: number;
  loanTermYears: number;
  interestRateTin: number;

  // Expenses and Taxes (Comunidad de Madrid defaults)
  itpRate: number;
  notaryFee: number;
  registryFee: number;
  managementFee: number;
  appraisalFee: number;
  renovationBudget: number;

  // Liquidity and Household Income
  availableSavings: number;
  annualNetIncome: number;
}

export const DEFAULT_MORTGAGE_INPUTS: Readonly<MortgageInputs> = {
  purchasePrice: 750000,
  financingPercentage: 80,
  loanTermYears: 30,
  interestRateTin: 2.50,
  itpRate: 6.0,
  notaryFee: 1000,
  registryFee: 500,
  managementFee: 400,
  appraisalFee: 600,
  renovationBudget: 150000,
  availableSavings: 183000,
  annualNetIncome: 86758.34,
};

