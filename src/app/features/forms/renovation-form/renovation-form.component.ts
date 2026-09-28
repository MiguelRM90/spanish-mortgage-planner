import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { NumericSliderInputComponent } from '../../../shared/components/numeric-slider-input/numeric-slider-input.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import {
  RenovationQuality,
  RENOVATION_QUALITY_PRESETS,
  RenovationInputs,
} from '../../../core/models/renovation.model';

@Component({
  selector: 'app-renovation-form',
  standalone: true,
  imports: [CommonModule, NumericSliderInputComponent, CurrencyFormatPipe],
  templateUrl: './renovation-form.component.html',
})
export class RenovationFormComponent {
  private readonly scenarioService = inject(ScenarioService);

  public readonly scenario = this.scenarioService.activeScenario;
  public readonly results = this.scenarioService.activeResults;
  public readonly showBreakdown = signal<boolean>(false);

  public inputs() {
    return this.scenario().inputs;
  }

  public currentQuality(): RenovationQuality {
    return this.inputs().renovationDetails?.quality ?? (this.inputs().renovationBudget > 0 ? 'medium' : 'none');
  }

  public currentCostPerM2(): number {
    const details = this.inputs().renovationDetails;
    if (details?.costPerSquareMeter !== undefined) {
      return details.costPerSquareMeter;
    }
    const q = this.currentQuality();
    if (q === 'none') return 0;
    if (q === 'custom') return 1100;
    return RENOVATION_QUALITY_PRESETS[q].costPerM2;
  }

  public onSquareMetersChange(sqm: number): void {
    const prevDetails = this.inputs().renovationDetails || {
      enabled: true,
      squareMeters: sqm,
      quality: 'medium',
      costPerSquareMeter: 1100,
      vatRate: 10,
      icioRate: 4,
      financeRenovation: false,
      renovationFinancingPercentage: 0,
      projectedMarketValuePerSqMeter: 7300,
    };

    const costPerM2 = this.currentCostPerM2();
    const newTotal = sqm * costPerM2 * 1.14;

    this.scenarioService.updateActiveInputs({
      builtSquareMeters: sqm,
      renovationBudget: Math.round(newTotal),
      renovationDetails: {
        ...prevDetails,
        squareMeters: sqm,
      },
    });
  }

  public onSelectQuality(quality: RenovationQuality): void {
    const sqm = this.inputs().builtSquareMeters || 120;
    const costPerM2 = quality === 'none' ? 0 : RENOVATION_QUALITY_PRESETS[quality === 'custom' ? 'medium' : quality].costPerM2;
    const newTotal = quality === 'none' ? 0 : Math.round(sqm * costPerM2 * 1.14);

    this.scenarioService.updateActiveInputs({
      renovationBudget: newTotal,
      renovationDetails: {
        ...(this.inputs().renovationDetails || {}),
        enabled: quality !== 'none',
        squareMeters: sqm,
        quality,
        costPerSquareMeter: costPerM2,
        vatRate: 10,
        icioRate: 4,
        financeRenovation: this.inputs().financeRenovation || false,
        renovationFinancingPercentage: this.inputs().renovationFinancingPercentage || 0,
        projectedMarketValuePerSqMeter: this.inputs().projectedMarketValuePerSqMeter || 7300,
      },
    });
  }

  public onCostPerM2Change(cost: number): void {
    const sqm = this.inputs().builtSquareMeters || 120;
    const newTotal = Math.round(sqm * cost * 1.14);

    this.scenarioService.updateActiveInputs({
      renovationBudget: newTotal,
      renovationDetails: {
        ...(this.inputs().renovationDetails || {}),
        enabled: true,
        squareMeters: sqm,
        quality: 'custom',
        costPerSquareMeter: cost,
        vatRate: 10,
        icioRate: 4,
        financeRenovation: this.inputs().financeRenovation || false,
        renovationFinancingPercentage: this.inputs().renovationFinancingPercentage || 0,
        projectedMarketValuePerSqMeter: this.inputs().projectedMarketValuePerSqMeter || 7300,
      },
    });
  }

  public onToggleFinanceRenovation(): void {
    const nextVal = !this.inputs().financeRenovation;
    const currentPct = this.inputs().renovationFinancingPercentage || 80;
    this.scenarioService.updateActiveInputs({
      financeRenovation: nextVal,
      renovationFinancingPercentage: nextVal ? currentPct : 0,
      renovationDetails: {
        ...(this.inputs().renovationDetails || {}),
        enabled: true,
        squareMeters: this.inputs().builtSquareMeters || 120,
        quality: this.currentQuality(),
        costPerSquareMeter: this.currentCostPerM2(),
        vatRate: 10,
        icioRate: 4,
        financeRenovation: nextVal,
        renovationFinancingPercentage: nextVal ? currentPct : 0,
        projectedMarketValuePerSqMeter: this.inputs().projectedMarketValuePerSqMeter || 7300,
      },
    });
  }

  public onFinancingPercentageChange(pct: number): void {
    this.scenarioService.updateActiveInputs({
      financeRenovation: true,
      renovationFinancingPercentage: pct,
      renovationDetails: {
        ...(this.inputs().renovationDetails || {}),
        enabled: true,
        squareMeters: this.inputs().builtSquareMeters || 120,
        quality: this.currentQuality(),
        costPerSquareMeter: this.currentCostPerM2(),
        vatRate: 10,
        icioRate: 4,
        financeRenovation: true,
        renovationFinancingPercentage: pct,
        projectedMarketValuePerSqMeter: this.inputs().projectedMarketValuePerSqMeter || 7300,
      },
    });
  }

  public onMarketPriceChange(pricePerM2: number): void {
    this.scenarioService.updateActiveInputs({
      projectedMarketValuePerSqMeter: pricePerM2,
      renovationDetails: {
        ...(this.inputs().renovationDetails || {}),
        enabled: true,
        squareMeters: this.inputs().builtSquareMeters || 120,
        quality: this.currentQuality(),
        costPerSquareMeter: this.currentCostPerM2(),
        vatRate: 10,
        icioRate: 4,
        financeRenovation: this.inputs().financeRenovation || false,
        renovationFinancingPercentage: this.inputs().renovationFinancingPercentage || 0,
        projectedMarketValuePerSqMeter: pricePerM2,
      },
    });
  }
}

