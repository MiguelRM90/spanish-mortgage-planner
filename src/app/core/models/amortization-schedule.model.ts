export interface AmortizationPeriod {
  month: number;
  year: number;
  monthlyPayment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  accumulatedPrincipal: number;
  accumulatedInterest: number;
}

export interface YearlyAmortizationSummary {
  year: number;
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  remainingBalance: number;
}

