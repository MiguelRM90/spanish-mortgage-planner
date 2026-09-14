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
  template: `
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900">Reforma Integral y Creación de Valor</h2>
            <p class="text-xs text-slate-500">Superficie (m²), calidades, impuestos de obra e hipoteca</p>
          </div>
        </div>

        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          Total Obra: {{ results().renovationResults.totalRenovationCost | currencyFormat }}
        </span>
      </div>

      <!-- Superficie en m² (Totalmente variable) -->
      <app-numeric-slider-input
        label="Superficie de la vivienda"
        [value]="inputs().builtSquareMeters || 120"
        [min]="30"
        [max]="300"
        [step]="1"
        unit="m²"
        suffix="m²"
        hint="Metros cuadrados construidos. Modifícalo libremente para cualquier tamaño de piso."
        (valueChange)="onSquareMetersChange($event)"
      />

      <!-- Selector de Calidad de Reforma -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold text-slate-700">Nivel de Calidades</label>
          <span class="text-xs text-slate-500">
            {{ currentCostPerM2() | currencyFormat }}/m² (base)
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <!-- Sin reforma -->
          <button
            type="button"
            (click)="onSelectQuality('none')"
            class="p-2.5 text-left rounded-xl border text-xs transition-all flex flex-col justify-between"
            [ngClass]="
              currentQuality() === 'none'
                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-900 font-bold shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            "
          >
            <span class="block font-bold">Sin Reforma</span>
            <span class="text-[11px] text-slate-500 mt-1">0 € / Conservar</span>
          </button>

          <!-- Básica -->
          <button
            type="button"
            (click)="onSelectQuality('basic')"
            class="p-2.5 text-left rounded-xl border text-xs transition-all flex flex-col justify-between"
            [ngClass]="
              currentQuality() === 'basic'
                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-900 font-bold shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            "
          >
            <span class="block font-bold">Básica</span>
            <span class="text-[11px] text-slate-500 mt-1">~850 €/m²</span>
          </button>

          <!-- Media (Recomendada) -->
          <button
            type="button"
            (click)="onSelectQuality('medium')"
            class="p-2.5 text-left rounded-xl border text-xs transition-all flex flex-col justify-between"
            [ngClass]="
              currentQuality() === 'medium'
                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-900 font-bold shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            "
          >
            <span class="block font-bold">Media / Confort</span>
            <span class="text-[11px] text-emerald-700 font-semibold mt-1">~1.100 €/m² ★</span>
          </button>

          <!-- Alta / Diseño -->
          <button
            type="button"
            (click)="onSelectQuality('high')"
            class="p-2.5 text-left rounded-xl border text-xs transition-all flex flex-col justify-between"
            [ngClass]="
              currentQuality() === 'high'
                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-900 font-bold shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            "
          >
            <span class="block font-bold">Alta / Diseño</span>
            <span class="text-[11px] text-slate-500 mt-1">~1.350 €/m²</span>
          </button>
        </div>
      </div>

      @if (currentQuality() !== 'none') {
        <!-- Ajuste fino del coste por m² -->
        <app-numeric-slider-input
          label="Coste base por m² (sin impuestos)"
          [value]="currentCostPerM2()"
          [min]="300"
          [max]="2500"
          [step]="25"
          unit="€/m²"
          prefix="€"
          suffix="/m²"
          hint="Puedes ajustar manualmente el coste unitario por metro cuadrado."
          (valueChange)="onCostPerM2Change($event)"
        />

        <!-- Resumen fiscal de la obra (Madrid) -->
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
          <div class="flex items-center justify-between font-semibold text-slate-700">
            <span>Presupuesto neto de ejecución:</span>
            <span>{{ results().renovationResults.netBaseBudget | currencyFormat }}</span>
          </div>
          <div class="flex items-center justify-between text-slate-600 text-[11px]">
            <span>+ IVA reducido vivienda habitual (10%):</span>
            <span class="font-medium">{{ results().renovationResults.vatAmount | currencyFormat }}</span>
          </div>
          <div class="flex items-center justify-between text-slate-600 text-[11px]">
            <span>+ Impuesto ICIO Ayto. Madrid (4%):</span>
            <span class="font-medium">{{ results().renovationResults.icioAmount | currencyFormat }}</span>
          </div>
          <div class="border-t border-slate-200 pt-1.5 flex items-center justify-between font-bold text-slate-900">
            <span>Coste Total Obra (con impuestos):</span>
            <span class="text-emerald-700 text-sm">
              {{ results().renovationResults.totalRenovationCost | currencyFormat }}
              <span class="text-[11px] font-normal text-slate-500">
                ({{ results().renovationResults.costPerSqMeterWithTaxes | currencyFormat }}/m²)
              </span>
            </span>
          </div>
        </div>

        <!-- Botón para ver u ocultar desglose de partidas -->
        <div>
          <button
            type="button"
            (click)="showBreakdown.set(!showBreakdown())"
            class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>{{ showBreakdown() ? '▲ Ocultar' : '▼ Ver' }} estimación detallada por partidas (albañilería, cocina, fontanería...)</span>
          </button>

          @if (showBreakdown()) {
            <div class="mt-2 grid grid-cols-2 gap-2 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs animate-in fade-in">
              <div class="flex justify-between">
                <span class="text-slate-600">Albañilería y tabiques (15%):</span>
                <span class="font-semibold text-slate-800">{{ results().renovationResults.categoryBreakdown.masonryAndPlaster | currencyFormat }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Clima / Aerotermia (14%):</span>
                <span class="font-semibold text-slate-800">{{ results().renovationResults.categoryBreakdown.hvac | currencyFormat }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Cocina y muebles (13%):</span>
                <span class="font-semibold text-slate-800">{{ results().renovationResults.categoryBreakdown.kitchen | currencyFormat }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Ventanas Climalit (12%):</span>
                <span class="font-semibold text-slate-800">{{ results().renovationResults.categoryBreakdown.windows | currencyFormat }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Electricidad REBT (10%):</span>
                <span class="font-semibold text-slate-800">{{ results().renovationResults.categoryBreakdown.electrical | currencyFormat }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Baños y sanitarios (9%):</span>
                <span class="font-semibold text-slate-800">{{ results().renovationResults.categoryBreakdown.bathrooms | currencyFormat }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Demolición y residuos (8%):</span>
                <span class="font-semibold text-slate-800">{{ results().renovationResults.categoryBreakdown.demolition | currencyFormat }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Fontanería (8%):</span>
                <span class="font-semibold text-slate-800">{{ results().renovationResults.categoryBreakdown.plumbing | currencyFormat }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Suelos (6%):</span>
                <span class="font-semibold text-slate-800">{{ results().renovationResults.categoryBreakdown.flooring | currencyFormat }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Pintura lisa (5%):</span>
                <span class="font-semibold text-slate-800">{{ results().renovationResults.categoryBreakdown.painting | currencyFormat }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Financiación de la Obra: ¿Hipoteca Compra + Reforma? -->
        <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-slate-800 block">¿Financiar reforma con hipoteca?</span>
              <span class="text-[11px] text-slate-500">Modalidad Hipoteca Compra + Reforma (disposiciones por obra)</span>
            </div>
            <button
              type="button"
              (click)="onToggleFinanceRenovation()"
              class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden"
              [ngClass]="inputs().financeRenovation ? 'bg-indigo-600' : 'bg-slate-300'"
            >
              <span
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                [ngClass]="inputs().financeRenovation ? 'translate-x-5' : 'translate-x-0'"
              ></span>
            </button>
          </div>

          @if (inputs().financeRenovation) {
            <app-numeric-slider-input
              label="% de la reforma financiado en el préstamo"
              [value]="inputs().renovationFinancingPercentage || 80"
              [min]="10"
              [max]="100"
              [step]="5"
              unit="%"
              suffix="%"
              hint="Habitualmente entre el 50% y el 80% según tasación de proyecto."
              (valueChange)="onFinancingPercentageChange($event)"
            />

            <div class="grid grid-cols-2 gap-2 text-xs pt-1">
              <div class="p-2 rounded-lg bg-indigo-50 text-indigo-900">
                <span class="text-[10px] text-indigo-600 block">Financiado por el banco:</span>
                <span class="font-bold">{{ results().financedRenovationAmount | currencyFormat }}</span>
              </div>
              <div class="p-2 rounded-lg bg-amber-50 text-amber-900">
                <span class="text-[10px] text-amber-700 block">Efectivo propio a aportar:</span>
                <span class="font-bold">{{ results().unfinancedRenovationAmount | currencyFormat }}</span>
              </div>
            </div>
          } @else {
            <p class="text-[11px] text-slate-500">
              💡 Sin hipoteca de reforma: La obra completa ({{ results().renovationResults.totalRenovationCost | currencyFormat }}) se aporta <strong>100% de tus ahorros líquidos</strong>.
            </p>
          }
        </div>
      }

      <!-- Valor de mercado proyectado del piso reformado -->
      <div class="pt-2 border-t border-slate-100">
        <app-numeric-slider-input
          label="Precio de mercado estimado tras reforma (€/m² en La Guindalera)"
          [value]="inputs().projectedMarketValuePerSqMeter || 7300"
          [min]="3000"
          [max]="12000"
          [step]="50"
          unit="€/m²"
          prefix="€"
          suffix="/m²"
          hint="Precio medio actual escriturado/mercado de pisos reformados en La Guindalera (~7.200 - 7.500 €/m²)."
          (valueChange)="onMarketPriceChange($event)"
        />

        <div class="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-600">Valor estimado del piso reformado:</span>
          <span class="font-bold text-slate-900 text-sm">
            {{ results().projectedMarketValue | currencyFormat }}
          </span>
        </div>
      </div>
    </div>
  `,
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

