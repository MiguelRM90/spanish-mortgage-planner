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
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-indigo-500/10 pointer-events-none blur-2xl"></div>
        <div class="relative z-10 max-w-3xl space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              📍 La Guindalera (Barrio 04.4 - Salamanca, Madrid)
            </span>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
              Datos Abiertos Ayto. Madrid + BCE
            </span>
          </div>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white">
            Observatorio de Precios Reales y Radar de Euríbor
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Monitorización continua de precios escriturados ante notario vs. precios de oferta en portales. Detecta cuándo el mercado de La Guindalera se estanca para negociar tu compra con la máxima ventaja.
          </p>
        </div>
      </div>

      <!-- Termómetro del Ciclo y KPIs de Mercado -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- KPI 1: Precio Real Escriturado -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Precio Real Escriturado
          </span>
          <div class="text-xl font-extrabold text-slate-900">
            {{ report().currentRealPricePerM2 | currencyFormat }}/m²
          </div>
          <span class="text-[11px] text-emerald-600 font-medium block">
            +{{ report().quarterlyGrowthRatePercent }}% este trimestre (fase meseta)
          </span>
        </div>

        <!-- KPI 2: Precio de Oferta Portales -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Precio de Oferta (Portales)
          </span>
          <div class="text-xl font-extrabold text-slate-900">
            {{ report().currentAskingPricePerM2 | currencyFormat }}/m²
          </div>
          <span class="text-[11px] text-slate-500 font-medium block">
            Precios anunciados en Idealista/Fotocasa
          </span>
        </div>

        <!-- KPI 3: Brecha de Negociación Media -->
        <div class="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100 shadow-xs space-y-1">
          <span class="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
            Margen de Regateo Medio
          </span>
          <div class="text-xl font-black text-indigo-900">
            -{{ report().averageNegotiationDiscount }}%
          </div>
          <span class="text-[11px] text-indigo-600 font-medium block">
            Diferencia entre anuncio y firma notarial
          </span>
        </div>

        <!-- KPI 4: Euríbor Oficial Actual -->
        <div class="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 shadow-xs space-y-1">
          <span class="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Euríbor 12M Oficial
          </span>
          <div class="text-xl font-black text-emerald-950">
            {{ report().euribor.currentMonthly }}%
          </div>
          <span class="text-[11px] text-emerald-700 font-medium block">
            Previsión tipos neutrales: ~{{ report().euribor.forecastBase }}%
          </span>
        </div>
      </div>

      <!-- Diagnóstico de Ciclo de Mercado -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">🧭</span>
            <h2 class="text-sm font-bold text-slate-900">Termómetro del Ciclo: Estado en La Guindalera</h2>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            ESTANCAMIENTO / MESETA
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          {{ report().trendDiagnosis }}
        </p>
      </div>

      <!-- Gráfico SVG: Precios de Oferta vs Precios Reales Escriturados -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Evolución Histórica: Oferta vs. Real Escriturado (€/m²)</h3>
            <p class="text-xs text-slate-500">Serie histórica trimestral en La Guindalera (2022 - 2026)</p>
          </div>
          <div class="flex items-center gap-4 text-xs">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span class="text-slate-600">Precio de Oferta</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
              <span class="text-slate-600">Precio Real Notarial</span>
            </div>
          </div>
        </div>

        <!-- SVG Line Chart -->
        <div class="w-full overflow-x-auto">
          <div class="min-w-[650px] h-64 relative">
            <svg viewBox="0 0 700 240" class="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="spreadArea" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#6366f1" stop-opacity="0.05" />
                </linearGradient>
              </defs>

              <!-- Grid Horizontal Lines -->
              <line x1="40" y1="20" x2="680" y2="20" stroke="#f1f5f9" stroke-width="1" />
              <line x1="40" y1="70" x2="680" y2="70" stroke="#f1f5f9" stroke-width="1" />
              <line x1="40" y1="120" x2="680" y2="120" stroke="#f1f5f9" stroke-width="1" />
              <line x1="40" y1="170" x2="680" y2="170" stroke="#f1f5f9" stroke-width="1" />
              <line x1="40" y1="210" x2="680" y2="210" stroke="#e2e8f0" stroke-width="1.5" />

              <!-- Y-Axis Labels -->
              <text x="32" y="24" text-anchor="end" class="text-[9px] fill-slate-400">8.000€</text>
              <text x="32" y="74" text-anchor="end" class="text-[9px] fill-slate-400">7.000€</text>
              <text x="32" y="124" text-anchor="end" class="text-[9px] fill-slate-400">6.000€</text>
              <text x="32" y="174" text-anchor="end" class="text-[9px] fill-slate-400">5.000€</text>

              <!-- Area between curves (Spread) -->
              <polygon [attr.points]="chartPolygonPoints()" fill="url(#spreadArea)" />

              <!-- Asking Price Line (Amber) -->
              <polyline [attr.points]="askingLinePoints()" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" />

              <!-- Real Price Line (Indigo) -->
              <polyline [attr.points]="realLinePoints()" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round" />

              <!-- Data Points and Period Labels -->
              @for (pt of chartPoints(); track pt.period; let idx = $index) {
                <!-- Asking Point -->
                <circle [attr.cx]="pt.x" [attr.cy]="pt.askingY" r="3.5" fill="#f59e0b" class="hover:r-5 transition-all" />
                <!-- Real Point -->
                <circle [attr.cx]="pt.x" [attr.cy]="pt.realY" r="3.5" fill="#4f46e5" class="hover:r-5 transition-all" />

                <!-- Period label (every 2-3 quarters to avoid crowding) -->
                @if (idx % 2 === 0 || idx === chartPoints().length - 1) {
                  <text [attr.x]="pt.x" y="226" text-anchor="middle" class="text-[9px] fill-slate-500 font-medium">
                    {{ pt.period }}
                  </text>
                }
              }
            </svg>
          </div>
        </div>
        <p class="text-[11px] text-slate-500 text-center">
          La franja sombreada representa el <strong>descuento medio de negociación</strong> obtenido entre el anuncio publicado y la escritura notarial en Guindalera.
        </p>
      </div>

      <!-- Calculador de Contraoferta Inteligente -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div class="border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">🎯</span>
            <div>
              <h3 class="text-sm font-bold text-slate-900">Calculador de Contraoferta Inteligente</h3>
              <p class="text-xs text-slate-500">¿Has visto un piso anunciado en La Guindalera? Calcula la oferta óptima basada en el descuento real de cierre.</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div class="space-y-3">
            <app-numeric-slider-input
              label="Precio que pide el vendedor / agencia (€)"
              [value]="probeAskingPrice()"
              [min]="200000"
              [max]="1500000"
              [step]="5000"
              unit="€"
              prefix="€"
              hint="Precio publicado en el portal inmobiliario."
              (valueChange)="probeAskingPrice.set($event)"
            />

            <app-numeric-slider-input
              label="Porcentaje de rebaja a negociar"
              [value]="probeDiscountPercent()"
              [min]="3"
              [max]="20"
              [step]="0.5"
              unit="%"
              suffix="%"
              hint="Descuento medio en Guindalera: 8,6%. En pisos muy deteriorados se puede negociar hasta un 12-15%."
              (valueChange)="probeDiscountPercent.set($event)"
            />
          </div>

          <!-- Resultado de la Oferta -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-slate-50 border border-indigo-100 space-y-3">
            <span class="text-xs font-bold text-indigo-900 block uppercase tracking-wider">
              Contraoferta Sugerida
            </span>
            <div class="text-2xl font-black text-indigo-950">
              {{ offerCalculation().recommendedOffer | currencyFormat }}
            </div>

            <div class="space-y-1.5 text-xs text-slate-700 border-t border-indigo-100 pt-2.5">
              <div class="flex justify-between">
                <span>Ahorro en el precio del piso:</span>
                <span class="font-bold text-emerald-700">-{{ offerCalculation().cashSavings | currencyFormat }}</span>
              </div>
              <div class="flex justify-between">
                <span>Ahorro en ITP (6% Madrid):</span>
                <span class="font-bold text-emerald-700">-{{ offerCalculation().itpSavings | currencyFormat }}</span>
              </div>
              <div class="flex justify-between border-t border-indigo-200/60 pt-1 font-extrabold text-slate-900">
                <span>Ahorro Total para tu bolsillo:</span>
                <span class="text-emerald-800 text-sm">-{{ offerCalculation().totalSavings | currencyFormat }}</span>
              </div>
            </div>

            <button
              type="button"
              (click)="applyOfferToActiveScenario()"
              class="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Aplicar {{ offerCalculation().recommendedOffer | currencyFormat }} al Simulador Hipotecario</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Radar de Euríbor y Test de Estrés -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div class="border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">⚡</span>
            <div>
              <h3 class="text-sm font-bold text-slate-900">Radar de Euríbor y Test de Estrés Financiero</h3>
              <p class="text-xs text-slate-500">¿Qué pasaría con tu cuota mensual si los tipos bajan al 1,75% o suben al 3,65%?</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- Escenario 1: Optimista (1,75%) -->
          <div class="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
            <div class="flex justify-between items-center text-xs font-bold text-emerald-800">
              <span>Escenario Optimista</span>
              <span class="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px]">{{ report().euribor.forecastOptimistic }}%</span>
            </div>
            <div class="text-lg font-extrabold text-emerald-950 pt-1">
              {{ stressPayment(report().euribor.forecastOptimistic) | currencyFormat:true }}/mes
            </div>
            <div class="text-[11px] text-emerald-700">
              Diferencia: {{ paymentDiff(report().euribor.forecastOptimistic) | currencyFormat:true }}/mes vs actual
            </div>
          </div>

          <!-- Escenario 2: Base / Neutral (2,20%) -->
          <div class="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-1">
            <div class="flex justify-between items-center text-xs font-bold text-indigo-800">
              <span>Escenario Consenso (Base)</span>
              <span class="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-[10px]">{{ report().euribor.forecastBase }}%</span>
            </div>
            <div class="text-lg font-extrabold text-indigo-950 pt-1">
              {{ stressPayment(report().euribor.forecastBase) | currencyFormat:true }}/mes
            </div>
            <div class="text-[11px] text-indigo-700">
              Diferencia: {{ paymentDiff(report().euribor.forecastBase) | currencyFormat:true }}/mes vs actual
            </div>
          </div>

          <!-- Escenario 3: Pesimista / Inflación (3,65%) -->
          <div class="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-1">
            <div class="flex justify-between items-center text-xs font-bold text-rose-800">
              <span>Escenario Pesimista</span>
              <span class="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-900 text-[10px]">{{ report().euribor.forecastPessimistic }}%</span>
            </div>
            <div class="text-lg font-extrabold text-rose-950 pt-1">
              {{ stressPayment(report().euribor.forecastPessimistic) | currencyFormat:true }}/mes
            </div>
            <div class="text-[11px] text-rose-700">
              Diferencia: +{{ paymentDiff(report().euribor.forecastPessimistic) | currencyFormat:true }}/mes vs actual
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
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

