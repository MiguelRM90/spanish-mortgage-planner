import { Injectable } from '@angular/core';
import {
  RenovationCategoryCosts,
  RenovationInputs,
  RenovationResults,
  RENOVATION_QUALITY_PRESETS,
  DEFAULT_RENOVATION_INPUTS,
} from '../models/renovation.model';

@Injectable({
  providedIn: 'root',
})
export class RenovationCalculatorService {
  /**
   * Standard percentage distribution for a complete apartment renovation in Madrid
   */
  private readonly CATEGORY_RATIOS = {
    demolition: 0.08,
    masonryAndPlaster: 0.15,
    electrical: 0.10,
    plumbing: 0.08,
    hvac: 0.14,
    windows: 0.12,
    kitchen: 0.13,
    bathrooms: 0.09,
    flooring: 0.06,
    painting: 0.05,
  };

  /**
   * Calculates detailed renovation costs, taxes (IVA + ICIO Madrid),
   * financing allocation and equity projection.
   */
  public calculate(
    inputs: RenovationInputs = DEFAULT_RENOVATION_INPUTS,
    purchasePrice = 0,
    purchaseExpenses = 0
  ): RenovationResults {
    const squareMeters = Math.max(1, inputs.squareMeters ?? 120);
    const enabled = inputs.enabled ?? true;
    const quality = inputs.quality ?? 'medium';

    if (!enabled || quality === 'none') {
      const projectedMarketValue = this.round(squareMeters * Math.max(0, inputs.projectedMarketValuePerSqMeter ?? 0));
      const totalOperationCost = this.round(purchasePrice + purchaseExpenses);
      const netEquityCreated = this.round(projectedMarketValue - totalOperationCost);
      const equityPercentage = totalOperationCost > 0 ? this.round((netEquityCreated / totalOperationCost) * 100) : 0;

      return {
        squareMeters,
        quality: 'none',
        netBaseBudget: 0,
        vatAmount: 0,
        icioAmount: 0,
        totalRenovationCost: 0,
        costPerSqMeterWithTaxes: 0,
        financedRenovationAmount: 0,
        unfinancedRenovationAmount: 0,
        categoryBreakdown: this.getEmptyCategoryBreakdown(),
        projectedMarketValue,
        totalOperationCost,
        netEquityCreated,
        equityPercentage,
      };
    }

    // 1. Determine unit cost per m²
    let costPerM2 = inputs.costPerSquareMeter;
    if (quality === 'basic' || quality === 'medium' || quality === 'high') {
      costPerM2 = inputs.costPerSquareMeter > 0 ? inputs.costPerSquareMeter : RENOVATION_QUALITY_PRESETS[quality].costPerM2;
    }
    costPerM2 = Math.max(0, costPerM2);

    // 2. Base budget
    const netBaseBudget = squareMeters * costPerM2;

    // 3. Category breakdown
    const categoryBreakdown = this.calculateCategoryBreakdown(netBaseBudget, inputs.customBreakdown);

    // 4. Taxes (IVA 10% reducido + ICIO 4% Ayto Madrid)
    const vatRate = Math.max(0, inputs.vatRate ?? 10.0);
    const icioRate = Math.max(0, inputs.icioRate ?? 4.0);

    const vatAmount = netBaseBudget * (vatRate / 100);
    const icioAmount = netBaseBudget * (icioRate / 100);
    const totalRenovationCost = netBaseBudget + vatAmount + icioAmount;
    const costPerSqMeterWithTaxes = squareMeters > 0 ? totalRenovationCost / squareMeters : 0;

    // 5. Financing allocation (cash vs mortgage loan)
    let financedRenovationAmount = 0;
    if (inputs.financeRenovation) {
      const financingPct = Math.min(100, Math.max(0, inputs.renovationFinancingPercentage ?? 0));
      financedRenovationAmount = totalRenovationCost * (financingPct / 100);
    }
    const unfinancedRenovationAmount = totalRenovationCost - financedRenovationAmount;

    // 6. Market projection & Equity
    const marketPricePerM2 = Math.max(0, inputs.projectedMarketValuePerSqMeter ?? 7300);
    const projectedMarketValue = squareMeters * marketPricePerM2;
    const totalOperationCost = purchasePrice + purchaseExpenses + totalRenovationCost;
    const netEquityCreated = projectedMarketValue - totalOperationCost;
    const equityPercentage = totalOperationCost > 0 ? (netEquityCreated / totalOperationCost) * 100 : 0;

    return {
      squareMeters,
      quality,
      netBaseBudget: this.round(netBaseBudget),
      vatAmount: this.round(vatAmount),
      icioAmount: this.round(icioAmount),
      totalRenovationCost: this.round(totalRenovationCost),
      costPerSqMeterWithTaxes: this.round(costPerSqMeterWithTaxes),
      financedRenovationAmount: this.round(financedRenovationAmount),
      unfinancedRenovationAmount: this.round(unfinancedRenovationAmount),
      categoryBreakdown,
      projectedMarketValue: this.round(projectedMarketValue),
      totalOperationCost: this.round(totalOperationCost),
      netEquityCreated: this.round(netEquityCreated),
      equityPercentage: this.round(equityPercentage),
    };
  }

  private calculateCategoryBreakdown(
    netBaseBudget: number,
    custom?: Partial<RenovationCategoryCosts>
  ): RenovationCategoryCosts {
    return {
      demolition: this.round(custom?.demolition ?? netBaseBudget * this.CATEGORY_RATIOS.demolition),
      masonryAndPlaster: this.round(custom?.masonryAndPlaster ?? netBaseBudget * this.CATEGORY_RATIOS.masonryAndPlaster),
      electrical: this.round(custom?.electrical ?? netBaseBudget * this.CATEGORY_RATIOS.electrical),
      plumbing: this.round(custom?.plumbing ?? netBaseBudget * this.CATEGORY_RATIOS.plumbing),
      hvac: this.round(custom?.hvac ?? netBaseBudget * this.CATEGORY_RATIOS.hvac),
      windows: this.round(custom?.windows ?? netBaseBudget * this.CATEGORY_RATIOS.windows),
      kitchen: this.round(custom?.kitchen ?? netBaseBudget * this.CATEGORY_RATIOS.kitchen),
      bathrooms: this.round(custom?.bathrooms ?? netBaseBudget * this.CATEGORY_RATIOS.bathrooms),
      flooring: this.round(custom?.flooring ?? netBaseBudget * this.CATEGORY_RATIOS.flooring),
      painting: this.round(custom?.painting ?? netBaseBudget * this.CATEGORY_RATIOS.painting),
    };
  }

  private getEmptyCategoryBreakdown(): RenovationCategoryCosts {
    return {
      demolition: 0,
      masonryAndPlaster: 0,
      electrical: 0,
      plumbing: 0,
      hvac: 0,
      windows: 0,
      kitchen: 0,
      bathrooms: 0,
      flooring: 0,
      painting: 0,
    };
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}

