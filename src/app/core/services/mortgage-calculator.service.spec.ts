import { describe, it, expect, beforeEach } from 'vitest';
import { MortgageCalculatorService } from './mortgage-calculator.service';
import { DEFAULT_MORTGAGE_INPUTS } from '../models/mortgage-inputs.model';

describe('MortgageCalculatorService', () => {
  let service: MortgageCalculatorService;

  beforeEach(() => {
    service = new MortgageCalculatorService();
  });

  it('should correctly calculate user baseline scenario', () => {
    const results = service.calculate(DEFAULT_MORTGAGE_INPUTS);

    // 1. Financing
    expect(results.loanCapital).toBe(600000);
    // Cuota: [600000 * (0.025/12) * (1 + 0.025/12)^360] / [(1 + 0.025/12)^360 - 1] ≈ 2370.71
    expect(results.monthlyPayment).toBe(2370.73);
    expect(results.totalInterest).toBe(253461.14);
    expect(results.totalLoanCost).toBe(853461.14);

    // 2. Expenses and Capital
    expect(results.itpAmount).toBe(45000); // 6% of 750,000
    expect(results.totalPurchaseExpenses).toBe(47500); // 45000 + 1000 + 500 + 400 + 600
    expect(results.downPayment).toBe(150000); // 20% of 750,000
    expect(results.totalInitialCapitalNeeded).toBe(347500); // 150000 + 47500 + 150000
    expect(results.totalProjectCost).toBe(947500); // 750000 + 47500 + 150000
    expect(results.liquidityDifference).toBe(-164500); // 183000 - 347500 = -164500 (Déficit)
    expect(results.unfundedInitialCashGap).toBe(164500);

    // 3. Ratios and Diagnostics
    expect(results.monthlyNetIncome).toBeCloseTo(7229.86, 1);
    expect(results.recommendedDebtLimit).toBeCloseTo(2530.45, 1); // 7229.86 * 0.35
    expect(results.debtToIncomeRatio).toBeCloseTo(32.79, 1); // (2370.71 / 7229.86) * 100
    expect(results.netDisposableIncome).toBeCloseTo(4859.15, 1); // 7229.86 - 2370.71

    // Diagnósticos
    expect(results.paymentDiagnosis).toBe('APPROVED');
    expect(results.liquidityDiagnosis).toBe('INSUFFICIENT');
  });

  it('should diagnose RISK when debt-to-income ratio exceeds 35%', () => {
    const inputs = {
      ...DEFAULT_MORTGAGE_INPUTS,
      annualNetIncome: 48000, // 4000 €/month
    };
    const results = service.calculate(inputs);

    // Monthly payment ~2370.71 on 4000 net income -> ~59.27% debt ratio
    expect(results.debtToIncomeRatio).toBeGreaterThan(35);
    expect(results.paymentDiagnosis).toBe('RISK');
  });

  it('should diagnose SUFFICIENT when available savings exceed initial capital needed', () => {
    const inputs = {
      ...DEFAULT_MORTGAGE_INPUTS,
      availableSavings: 400000, // 400k savings > 347.5k needed
    };
    const results = service.calculate(inputs);

    expect(results.liquidityDifference).toBe(52500); // 400000 - 347500
    expect(results.unfundedInitialCashGap).toBe(0);
    expect(results.liquidityDiagnosis).toBe('SUFFICIENT');
  });

  it('should handle 0% interest rate without divide-by-zero error', () => {
    const inputs = {
      ...DEFAULT_MORTGAGE_INPUTS,
      interestRateTin: 0,
    };
    const results = service.calculate(inputs);

    // 600,000 / 360 months = 1666.67 €/month
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
