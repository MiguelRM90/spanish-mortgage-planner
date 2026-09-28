import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketDataService } from '../../../core/services/market-data.service';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { NumericSliderInputComponent } from '../../../shared/components/numeric-slider-input/numeric-slider-input.component';

@Component({
  selector: 'app-market-observatory',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFormatPipe, NumericSliderInputComponent],
  templateUrl: './market-observatory.component.html',
})
export class MarketObservatoryComponent {
  private readonly marketDataService = inject(MarketDataService);
  private readonly scenarioService = inject(ScenarioService);

  public readonly report = this.marketDataService.report;
  public readonly probeAskingPrice = signal<number>(600000);
  public readonly probeDiscountPercent = signal<number>(8.6);

  public readonly offerCalculation = computed(() => {
    return this.marketDataService.calculateRecommendedOffer(
      this.probeAskingPrice(),
      this.probeDiscountPercent()
    );
  });

  public readonly chartPoints = computed(() => {
    const series = this.report().historicalSeries;
    const minX = 60;
    const maxX = 670;
    const minY = 20;  // corresponds to 8000 €/m²
    const maxY = 210; // corresponds to 4500 €/m²
    const priceMin = 4500;
    const priceMax = 8000;

    const count = series.length;
    const stepX = (maxX - minX) / Math.max(1, count - 1);

    return series.map((item, idx) => {
      const x = Math.round(minX + idx * stepX);
      const askingY = Math.round(maxY - ((item.askingPricePerM2 - priceMin) / (priceMax - priceMin)) * (maxY - minY));
      const realY = Math.round(maxY - ((item.realPricePerM2 - priceMin) / (priceMax - priceMin)) * (maxY - minY));

      return {
        period: item.period,
        x,
        askingY,
        realY,
      };
    });
  });

  public readonly askingLinePoints = computed(() => {
    return this.chartPoints().map((p) => `${p.x},${p.askingY}`).join(' ');
  });

  public readonly realLinePoints = computed(() => {
    return this.chartPoints().map((p) => `${p.x},${p.realY}`).join(' ');
  });

  public readonly chartPolygonPoints = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    const forward = pts.map((p) => `${p.x},${p.askingY}`).join(' ');
    const backward = [...pts].reverse().map((p) => `${p.x},${p.realY}`).join(' ');
    return `${forward} ${backward}`;
  });

  public applyOfferToActiveScenario(): void {
    const offer = this.offerCalculation().recommendedOffer;
    this.scenarioService.updateActiveInputs({ purchasePrice: offer });
  }

  public stressPayment(tinRate: number): number {
    const capital = this.scenarioService.activeResults().totalLoanCapital;
    const years = this.scenarioService.activeScenario().inputs.loanTermYears || 30;
    const months = years * 12;
    const r = tinRate / 100 / 12;

    if (capital <= 0 || months <= 0) return 0;
    if (r === 0) return capital / months;
    const factor = Math.pow(1 + r, months);
    return Math.round(((capital * r * factor) / (factor - 1)) * 100) / 100;
  }

  public paymentDiff(tinRate: number): number {
    const stress = this.stressPayment(tinRate);
    const current = this.scenarioService.activeResults().monthlyPayment;
    return Math.round((stress - current) * 100) / 100;
  }
}

