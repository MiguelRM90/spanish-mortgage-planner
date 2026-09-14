import { describe, it, expect, beforeEach } from 'vitest';
import { MortgageCalculatorService } from './mortgage-calculator.service';
import { DEFAULT_MORTGAGE_INPUTS } from '../models/mortgage-inputs.model';

describe('MortgageCalculatorService', () => {
  let service: MortgageCalculatorService;

  beforeEach(() => {
    service = new MortgageCalculatorService();
  });

  it('should correctly calculate baseline scenario with Madrid renovation model', () => {
    const results = service.calculate(DEFAULT_MORTGAGE_INPUTS);

    // 1. Financing
    expect(results.loanCapital).toBe(600000);
    expect(results.monthlyPayment).toBe(2370.73);
    expect(results.totalInterest).toBe(253461.14);
    expect(results.totalLoanCost).toBe(853461.14);

    // 2. Expenses, Renovation (120m² * 1100€/m² + 10% IVA + 4% ICIO = 150,480€) and Capital
    expect(results.itpAmount).toBe(45000); // 6% of 750,000
    expect(results.totalPurchaseExpenses).toBe(47500); // 45000 + 1000 + 500 + 400 + 600
    expect(results.downPayment).toBe(150000); // 20% of 750,000
    expect(results.renovationResults.totalRenovationCost).toBe(150480);
    expect(results.totalInitialCapitalNeeded).toBe(347980); // 150000 + 47500 + 150480
    expect(results.totalProjectCost).toBe(947980); // 750000 + 47500 + 150480
    expect(results.liquidityDifference).toBe(-164980); // 183000 - 347980
    expect(results.unfundedInitialCashGap).toBe(164980);

    // 3. Ratios and Diagnostics
    expect(results.monthlyNetIncome).toBeCloseTo(7229.86, 1);
    expect(results.recommendedDebtLimit).toBeCloseTo(2530.45, 1);
    expect(results.debtToIncomeRatio).toBeCloseTo(32.79, 1);
    expect(results.netDisposableIncome).toBeCloseTo(4859.15, 1);
    expect(results.paymentDiagnosis).toBe('APPROVED');
    expect(results.liquidityDiagnosis).toBe('INSUFFICIENT');

    // 4. Equity projection (120m² * 7300€/m² = 876,000€)
    expect(results.projectedMarketValue).toBe(876000);
    expect(results.netEquityCreated).toBe(-71980); // 876000 - 947980
  });

  it('should calculate realistic Guindalera purchase scenario with positive equity', () => {
    // 540,000 € purchase price for a 120m² flat to renovate (4,500 €/m²)
    const inputs = {
      ...DEFAULT_MORTGAGE_INPUTS,
      purchasePrice: 540000,
      availableSavings: 320000,
    };
    const results = service.calculate(inputs);

    // Down payment: 108,000 € (20%)
    // Purchase expenses (ITP 6% = 32,400 + 2,500 fees): 34,900 €
    // Renovation: 150,480 €
    // Total capital needed: 108,000 + 34,900 + 150,480 = 293,380 €
    // Savings: 320,000 -> Surplus: +26,620 €
    expect(results.downPayment).toBe(108000);
    expect(results.totalPurchaseExpenses).toBe(34900);
    expect(results.totalInitialCapitalNeeded).toBe(293380);
    expect(results.liquidityDifference).toBe(26620);
    expect(results.liquidityDiagnosis).toBe('SUFFICIENT');

    // Market value: 120 * 7300 = 876,000 €
    // Total cost: 540,000 + 34,900 + 150,480 = 725,380 €
    // Net equity created: 876,000 - 725,380 = +150,620 € (+20.76%)
    expect(results.projectedMarketValue).toBe(876000);
    expect(results.netEquityCreated).toBe(150620);
    expect(results.equityPercentage).toBeCloseTo(20.76, 1);
  });

  it('should support Hipoteca Compra + Reforma financing', () => {
    const inputs = {
      ...DEFAULT_MORTGAGE_INPUTS,
      purchasePrice: 500000,
      financingPercentage: 80,
      financeRenovation: true,
      renovationFinancingPercentage: 80,
    };
    const results = service.calculate(inputs);

    // Property loan: 400,000 €
    // Renovation: 150,480 € -> 80% financed = 120,384 €
    // Total loan: 520,384 €
    expect(results.loanCapital).toBe(400000);
    expect(results.financedRenovationAmount).toBe(120384);
    expect(results.totalLoanCapital).toBe(520384);

    // Upfront cash needed: 20% property (100k) + expenses (32.5k) + 20% unfinanced renovation (30,096€) = 162,596 €
    expect(results.unfinancedRenovationAmount).toBe(30096);
    expect(results.totalInitialCapitalNeeded).toBe(162596);
  });

  it('should diagnose RISK when debt-to-income ratio exceeds 35%', () => {
    const inputs = {
      ...DEFAULT_MORTGAGE_INPUTS,
      annualNetIncome: 48000, // 4000 €/month
    };
    const results = service.calculate(inputs);

    expect(results.debtToIncomeRatio).toBeGreaterThan(35);
    expect(results.paymentDiagnosis).toBe('RISK');
  });

  it('should diagnose SUFFICIENT when available savings exceed initial capital needed', () => {
    const inputs = {
      ...DEFAULT_MORTGAGE_INPUTS,
      availableSavings: 400000, // 400k savings > 347,980 needed
    };
    const results = service.calculate(inputs);

    expect(results.liquidityDifference).toBe(52020);
    expect(results.unfundedInitialCashGap).toBe(0);
    expect(results.liquidityDiagnosis).toBe('SUFFICIENT');
  });

  it('should handle 0% interest rate without divide-by-zero error', () => {
    const inputs = {
      ...DEFAULT_MORTGAGE_INPUTS,
      interestRateTin: 0,
    };
    const results = service.calculate(inputs);

    expect(results.monthlyPayment).toBeCloseTo(1666.67, 1);
    expect(results.totalInterest).toBe(0);
    expect(results.totalLoanCost).toBe(600000);
  });

  it('should generate complete amortization schedule and yearly summary', () => {
    const schedule = service.generateAmortizationSchedule(DEFAULT_MORTGAGE_INPUTS);

    expect(schedule.length).toBe(360);
    expect(schedule[0].month).toBe(1);
    expect(schedule[0].year).toBe(1);
    expect(schedule[schedule.length - 1].month).toBe(360);
    expect(schedule[schedule.length - 1].remainingBalance).toBe(0);

    const yearlySummary = service.generateYearlySummary(schedule);
    expect(yearlySummary.length).toBe(30);
    expect(yearlySummary[0].year).toBe(1);
    expect(yearlySummary[29].year).toBe(30);
    expect(yearlySummary[29].remainingBalance).toBe(0);
  });
});
