import { Injectable } from '@angular/core';
import { MortgageInputs } from '../models/mortgage-inputs.model';
import { MortgageResults, PaymentDiagnosis, LiquidityDiagnosis } from '../models/mortgage-results.model';
import { AmortizationPeriod, YearlyAmortizationSummary } from '../models/amortization-schedule.model';

@Injectable({
  providedIn: 'root',
})
export class MortgageCalculatorService {
  /**
   * Calculates comprehensive mortgage metrics and financial diagnostics
   * according to French amortization standard and Spanish property purchase taxation.
   */
  public calculate(inputs: MortgageInputs): MortgageResults {
    const purchasePrice = Math.max(0, inputs.purchasePrice || 0);
    const financingPercentage = Math.max(0, Math.min(100, inputs.financingPercentage || 0));
    const loanTermYears = Math.max(1, inputs.loanTermYears || 1);
    const interestRateTin = Math.max(0, inputs.interestRateTin || 0);

    const itpRate = Math.max(0, inputs.itpRate || 0);
    const notaryFee = Math.max(0, inputs.notaryFee || 0);
    const registryFee = Math.max(0, inputs.registryFee || 0);
    const managementFee = Math.max(0, inputs.managementFee || 0);
    const appraisalFee = Math.max(0, inputs.appraisalFee || 0);
    const renovationBudget = Math.max(0, inputs.renovationBudget || 0);

    const availableSavings = Math.max(0, inputs.availableSavings || 0);
    const annualNetIncome = Math.max(0, inputs.annualNetIncome || 0);

    // 1. Financing outputs
    const loanCapital = purchasePrice * (financingPercentage / 100);
    const totalMonths = Math.round(loanTermYears * 12);
    const monthlyRate = interestRateTin / 100 / 12;

    let monthlyPayment = 0;
    if (loanCapital > 0 && totalMonths > 0) {
      if (monthlyRate === 0) {
        monthlyPayment = loanCapital / totalMonths;
      } else {
        const factor = Math.pow(1 + monthlyRate, totalMonths);
        monthlyPayment = (loanCapital * monthlyRate * factor) / (factor - 1);
      }
    }

    const totalLoanCost = monthlyPayment * totalMonths;
    const totalInterest = Math.max(0, totalLoanCost - loanCapital);

    // 2. Upfront costs and liquidity
    const itpAmount = purchasePrice * (itpRate / 100);
    const totalPurchaseExpenses = itpAmount + notaryFee + registryFee + managementFee + appraisalFee;
    const downPayment = purchasePrice - loanCapital;
    const totalInitialCapitalNeeded = downPayment + totalPurchaseExpenses + renovationBudget;
    const totalProjectCost = purchasePrice + totalPurchaseExpenses + renovationBudget;
    const liquidityDifference = availableSavings - totalInitialCapitalNeeded;
    const unfundedInitialCashGap = liquidityDifference < 0 ? Math.abs(liquidityDifference) : 0;

    // 3. Risk Ratios and Diagnosis
    const monthlyNetIncome = annualNetIncome / 12;
    const recommendedDebtLimit = monthlyNetIncome * 0.35;
    const debtToIncomeRatio = monthlyNetIncome > 0 ? (monthlyPayment / monthlyNetIncome) * 100 : 0;
    const netDisposableIncome = monthlyNetIncome - monthlyPayment;

    const paymentDiagnosis: PaymentDiagnosis = debtToIncomeRatio <= 35 ? 'APPROVED' : 'RISK';
    const liquidityDiagnosis: LiquidityDiagnosis = liquidityDifference >= 0 ? 'SUFFICIENT' : 'INSUFFICIENT';

    return {
      loanCapital: this.round(loanCapital),
      monthlyPayment: this.round(monthlyPayment),
      totalInterest: this.round(totalInterest),
      totalLoanCost: this.round(totalLoanCost),
      downPayment: this.round(downPayment),
      itpAmount: this.round(itpAmount),
      totalPurchaseExpenses: this.round(totalPurchaseExpenses),
      totalInitialCapitalNeeded: this.round(totalInitialCapitalNeeded),
      totalProjectCost: this.round(totalProjectCost),
      liquidityDifference: this.round(liquidityDifference),
      unfundedInitialCashGap: this.round(unfundedInitialCashGap),
      monthlyNetIncome: this.round(monthlyNetIncome),
      recommendedDebtLimit: this.round(recommendedDebtLimit),
      debtToIncomeRatio: this.round(debtToIncomeRatio),
      netDisposableIncome: this.round(netDisposableIncome),
      paymentDiagnosis,
      liquidityDiagnosis,
    };
  }

  /**
   * Generates the detailed monthly French amortization schedule
   */
  public generateAmortizationSchedule(inputs: MortgageInputs): AmortizationPeriod[] {
    const loanCapital = inputs.purchasePrice * (inputs.financingPercentage / 100);
    const totalMonths = Math.round(inputs.loanTermYears * 12);
    const monthlyRate = inputs.interestRateTin / 100 / 12;

    if (loanCapital <= 0 || totalMonths <= 0) {
      return [];
    }

    let monthlyPayment = 0;
    if (monthlyRate === 0) {
      monthlyPayment = loanCapital / totalMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPayment = (loanCapital * monthlyRate * factor) / (factor - 1);
    }

    const schedule: AmortizationPeriod[] = [];
    let remainingBalance = loanCapital;
    let accumulatedPrincipal = 0;
    let accumulatedInterest = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const interestPaid = remainingBalance * monthlyRate;
      let principalPaid = monthlyPayment - interestPaid;

      // Handle final month precision
      if (month === totalMonths || principalPaid > remainingBalance) {
        principalPaid = remainingBalance;
        monthlyPayment = principalPaid + interestPaid;
      }

      remainingBalance = Math.max(0, remainingBalance - principalPaid);
      accumulatedPrincipal += principalPaid;
      accumulatedInterest += interestPaid;

      schedule.push({
        month,
        year: Math.ceil(month / 12),
        monthlyPayment: this.round(monthlyPayment),
        principalPaid: this.round(principalPaid),
        interestPaid: this.round(interestPaid),
        remainingBalance: this.round(remainingBalance),
        accumulatedPrincipal: this.round(accumulatedPrincipal),
        accumulatedInterest: this.round(accumulatedInterest),
      });

      if (remainingBalance <= 0) break;
    }

    return schedule;
  }

  /**
   * Aggregates a monthly amortization schedule into annual summaries
   */
  public generateYearlySummary(schedule: AmortizationPeriod[]): YearlyAmortizationSummary[] {
    const yearMap = new Map<number, YearlyAmortizationSummary>();

    for (const period of schedule) {
      const existing = yearMap.get(period.year);
      if (!existing) {
        yearMap.set(period.year, {
          year: period.year,
          totalPayment: period.monthlyPayment,
          totalPrincipal: period.principalPaid,
          totalInterest: period.interestPaid,
          remainingBalance: period.remainingBalance,
        });
      } else {
        existing.totalPayment = this.round(existing.totalPayment + period.monthlyPayment);
        existing.totalPrincipal = this.round(existing.totalPrincipal + period.principalPaid);
        existing.totalInterest = this.round(existing.totalInterest + period.interestPaid);
        existing.remainingBalance = period.remainingBalance;
      }
    }

    return Array.from(yearMap.values());
  }

  /**
   * Helper to round monetary amounts to 2 decimal places safely
   */
  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}

