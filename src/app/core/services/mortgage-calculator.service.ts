import { Injectable, Optional } from '@angular/core';
import { MortgageInputs } from '../models/mortgage-inputs.model';
import { MortgageResults, PaymentDiagnosis, LiquidityDiagnosis } from '../models/mortgage-results.model';
import { AmortizationPeriod, YearlyAmortizationSummary } from '../models/amortization-schedule.model';
import { RenovationCalculatorService } from './renovation-calculator.service';
import { RenovationInputs, RenovationResults } from '../models/renovation.model';

@Injectable({
  providedIn: 'root',
})
export class MortgageCalculatorService {
  private readonly renovationCalculator: RenovationCalculatorService;

  constructor(@Optional() renovationCalc?: RenovationCalculatorService) {
    this.renovationCalculator = renovationCalc ?? new RenovationCalculatorService();
  }

  /**
   * Calculates comprehensive mortgage metrics, renovation costs, taxation (Madrid),
   * risk diagnostics and equity creation.
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

    const availableSavings = Math.max(0, inputs.availableSavings || 0);
    const annualNetIncome = Math.max(0, inputs.annualNetIncome || 0);

    // 1. Purchase expenses
    const itpAmount = purchasePrice * (itpRate / 100);
    const totalPurchaseExpenses = itpAmount + notaryFee + registryFee + managementFee + appraisalFee;

    // 2. Renovation calculations
    const renovationResults = this.resolveRenovationResults(inputs, purchasePrice, totalPurchaseExpenses);

    // 3. Financing outputs (Property loan + Optional financed renovation)
    const loanCapital = purchasePrice * (financingPercentage / 100);
    const financedRenovationAmount = renovationResults.financedRenovationAmount;
    const totalLoanCapital = loanCapital + financedRenovationAmount;

    const totalMonths = Math.round(loanTermYears * 12);
    const monthlyRate = interestRateTin / 100 / 12;

    let monthlyPayment = 0;
    if (totalLoanCapital > 0 && totalMonths > 0) {
      if (monthlyRate === 0) {
        monthlyPayment = totalLoanCapital / totalMonths;
      } else {
        const factor = Math.pow(1 + monthlyRate, totalMonths);
        monthlyPayment = (totalLoanCapital * monthlyRate * factor) / (factor - 1);
      }
    }

    const totalLoanCost = monthlyPayment * totalMonths;
    const totalInterest = Math.max(0, totalLoanCost - totalLoanCapital);

    // 4. Upfront costs and liquidity requirements
    const downPayment = purchasePrice - loanCapital;
    const unfinancedRenovationAmount = renovationResults.unfinancedRenovationAmount;
    const totalInitialCapitalNeeded = downPayment + totalPurchaseExpenses + unfinancedRenovationAmount;
    const totalProjectCost = purchasePrice + totalPurchaseExpenses + renovationResults.totalRenovationCost;
    const liquidityDifference = availableSavings - totalInitialCapitalNeeded;
    const unfundedInitialCashGap = liquidityDifference < 0 ? Math.abs(liquidityDifference) : 0;

    // 5. Risk Ratios and Diagnostics
    const monthlyNetIncome = annualNetIncome / 12;
    const recommendedDebtLimit = monthlyNetIncome * 0.35;
    const debtToIncomeRatio = monthlyNetIncome > 0 ? (monthlyPayment / monthlyNetIncome) * 100 : 0;
    const netDisposableIncome = monthlyNetIncome - monthlyPayment;

    const paymentDiagnosis: PaymentDiagnosis = debtToIncomeRatio <= 35 ? 'APPROVED' : 'RISK';
    const liquidityDiagnosis: LiquidityDiagnosis = liquidityDifference >= 0 ? 'SUFFICIENT' : 'INSUFFICIENT';

    return {
      loanCapital: this.round(loanCapital),
      totalLoanCapital: this.round(totalLoanCapital),
      financedRenovationAmount: this.round(financedRenovationAmount),
      monthlyPayment: this.round(monthlyPayment),
      totalInterest: this.round(totalInterest),
      totalLoanCost: this.round(totalLoanCost),
      downPayment: this.round(downPayment),
      itpAmount: this.round(itpAmount),
      totalPurchaseExpenses: this.round(totalPurchaseExpenses),
      unfinancedRenovationAmount: this.round(unfinancedRenovationAmount),
      totalInitialCapitalNeeded: this.round(totalInitialCapitalNeeded),
      totalProjectCost: this.round(totalProjectCost),
      liquidityDifference: this.round(liquidityDifference),
      unfundedInitialCashGap: this.round(unfundedInitialCashGap),
      renovationResults,
      projectedMarketValue: this.round(renovationResults.projectedMarketValue),
      netEquityCreated: this.round(renovationResults.netEquityCreated),
      equityPercentage: this.round(renovationResults.equityPercentage),
      monthlyNetIncome: this.round(monthlyNetIncome),
      recommendedDebtLimit: this.round(recommendedDebtLimit),
      debtToIncomeRatio: this.round(debtToIncomeRatio),
      netDisposableIncome: this.round(netDisposableIncome),
      paymentDiagnosis,
      liquidityDiagnosis,
    };
  }

  /**
   * Generates the detailed monthly French amortization schedule based on total loan amount
   */
  public generateAmortizationSchedule(inputs: MortgageInputs): AmortizationPeriod[] {
    const results = this.calculate(inputs);
    const loanCapital = results.totalLoanCapital;
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

      // Final month precision
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
   * Resolves RenovationResults, either from detailed inputs or backwards-compatible renovationBudget.
   */
  private resolveRenovationResults(
    inputs: MortgageInputs,
    purchasePrice: number,
    purchaseExpenses: number
  ): RenovationResults {
    const squareMeters = inputs.builtSquareMeters ?? inputs.renovationDetails?.squareMeters ?? 120;
    const marketPricePerM2 = inputs.projectedMarketValuePerSqMeter ?? inputs.renovationDetails?.projectedMarketValuePerSqMeter ?? 7300;
    const financeRenovation = inputs.financeRenovation ?? inputs.renovationDetails?.financeRenovation ?? false;
    const renovationFinancingPct = inputs.renovationFinancingPercentage ?? inputs.renovationDetails?.renovationFinancingPercentage ?? 0;

    if (inputs.renovationDetails) {
      const normalizedRenovationInputs: RenovationInputs = {
        ...inputs.renovationDetails,
        squareMeters,
        financeRenovation,
        renovationFinancingPercentage: renovationFinancingPct,
        projectedMarketValuePerSqMeter: marketPricePerM2,
      };
      return this.renovationCalculator.calculate(normalizedRenovationInputs, purchasePrice, purchaseExpenses);
    }

    // Fallback if only renovationBudget was provided (e.g. in tests or legacy scenarios)
    const rawBudget = Math.max(0, inputs.renovationBudget || 0);
    const projectedMarketValue = squareMeters * marketPricePerM2;
    const totalOperationCost = purchasePrice + purchaseExpenses + rawBudget;
    const netEquityCreated = projectedMarketValue - totalOperationCost;
    const equityPercentage = totalOperationCost > 0 ? (netEquityCreated / totalOperationCost) * 100 : 0;

    let financedRenovationAmount = 0;
    if (financeRenovation) {
      financedRenovationAmount = rawBudget * (renovationFinancingPct / 100);
    }
    const unfinancedRenovationAmount = rawBudget - financedRenovationAmount;

    return {
      squareMeters,
      quality: 'custom',
      netBaseBudget: this.round(rawBudget / 1.14),
      vatAmount: this.round((rawBudget / 1.14) * 0.10),
      icioAmount: this.round((rawBudget / 1.14) * 0.04),
      totalRenovationCost: this.round(rawBudget),
      costPerSqMeterWithTaxes: squareMeters > 0 ? this.round(rawBudget / squareMeters) : 0,
      financedRenovationAmount: this.round(financedRenovationAmount),
      unfinancedRenovationAmount: this.round(unfinancedRenovationAmount),
      categoryBreakdown: {
        demolition: this.round(rawBudget * 0.08),
        masonryAndPlaster: this.round(rawBudget * 0.15),
        electrical: this.round(rawBudget * 0.10),
        plumbing: this.round(rawBudget * 0.08),
        hvac: this.round(rawBudget * 0.14),
        windows: this.round(rawBudget * 0.12),
        kitchen: this.round(rawBudget * 0.13),
        bathrooms: this.round(rawBudget * 0.09),
        flooring: this.round(rawBudget * 0.06),
        painting: this.round(rawBudget * 0.05),
      },
      projectedMarketValue: this.round(projectedMarketValue),
      totalOperationCost: this.round(totalOperationCost),
      netEquityCreated: this.round(netEquityCreated),
      equityPercentage: this.round(equityPercentage),
    };
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
