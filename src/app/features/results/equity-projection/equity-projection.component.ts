import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-equity-projection',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm"
            [ngClass]="
              results().netEquityCreated >= 0
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-amber-50 text-amber-600'
            "
          >
            📈
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">Plusvalía y Creación de Patrimonio (Equity)</h3>
            <p class="text-xs text-slate-500">Rentabilidad patrimonial de la compra + reforma en La Guindalera</p>
          </div>
        </div>

        <span
          class="text-xs font-bold px-2.5 py-1 rounded-full border"
          [ngClass]="
            results().netEquityCreated >= 0
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          "
        >
          {{ results().netEquityCreated >= 0 ? '✓ PLUSVALÍA POSITIVA' : '⚠️ RIESGO SOBRECOSTE' }}
        </span>
      </div>

      <!-- Main Numbers Comparison -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- 1. Coste Total Invertido -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span class="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
            1. Coste Total Invertido
          </span>
          <div class="text-lg font-bold text-slate-900">
            {{ results().totalProjectCost | currencyFormat }}
          </div>
          <div class="text-[10px] text-slate-500 leading-tight">
            Compra ({{ scenario().inputs.purchasePrice | currencyFormat }}) + Gastos ({{ results().totalPurchaseExpenses | currencyFormat }}) + Obra ({{ results().renovationResults.totalRenovationCost | currencyFormat }})
          </div>
        </div>

        <!-- 2. Valor Mercado Terminado -->
        <div class="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
          <span class="text-[11px] font-semibold text-indigo-700 block uppercase tracking-wider">
            2. Valor Terminado
          </span>
          <div class="text-lg font-bold text-indigo-950">
            {{ results().projectedMarketValue | currencyFormat }}
          </div>
          <div class="text-[10px] text-indigo-600 leading-tight">
            {{ scenario().inputs.builtSquareMeters || 120 }} m² × {{ scenario().inputs.projectedMarketValuePerSqMeter || 7300 | currencyFormat }}/m² en La Guindalera
          </div>
        </div>

        <!-- 3. Plusvalía Neta / Equity -->
        <div
          class="p-3.5 rounded-xl border space-y-1"
          [ngClass]="
            results().netEquityCreated >= 0
              ? 'bg-emerald-50/60 border-emerald-200'
              : 'bg-rose-50/60 border-rose-200'
          "
        >
          <span
            class="text-[11px] font-semibold block uppercase tracking-wider"
            [ngClass]="results().netEquityCreated >= 0 ? 'text-emerald-700' : 'text-rose-700'"
          >
            3. Plusvalía Neta Latente
          </span>
          <div
            class="text-lg font-extrabold flex items-center gap-1.5"
            [ngClass]="results().netEquityCreated >= 0 ? 'text-emerald-800' : 'text-rose-800'"
          >
            <span>{{ results().netEquityCreated >= 0 ? '+' : '' }}{{ results().netEquityCreated | currencyFormat }}</span>
            <span class="text-xs font-bold px-1.5 py-0.5 rounded-md bg-white/80 border">
              {{ results().equityPercentage >= 0 ? '+' : '' }}{{ results().equityPercentage | number:'1.1-1' }}%
            </span>
          </div>
          <div class="text-[10px] text-slate-600 leading-tight">
            Margen de seguridad patrimonial creado desde el día de finalización
          </div>
        </div>
      </div>

      <!-- Barra visual de relación Coste vs Valor -->
      <div class="space-y-1.5 pt-1">
        <div class="flex items-center justify-between text-xs text-slate-600">
          <span>Relación Inversión vs. Valoración proyectada</span>
          <span class="font-semibold text-slate-800">
            {{ results().totalProjectCost | currencyFormat }} de {{ results().projectedMarketValue | currencyFormat }}
          </span>
        </div>
        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            class="h-full transition-all duration-500"
            [style.width.%]="costBarPercentage()"
            [ngClass]="results().netEquityCreated >= 0 ? 'bg-emerald-500' : 'bg-rose-500'"
            [title]="'Inversión: ' + (results().totalProjectCost | currencyFormat)"
          ></div>
        </div>
      </div>

      <!-- Diagnóstico y Recomendación de Compra -->
      <div
        class="p-3 rounded-xl border text-xs leading-relaxed"
        [ngClass]="
          results().netEquityCreated >= 0
            ? 'bg-emerald-50/30 border-emerald-200/70 text-slate-700'
            : 'bg-amber-50/40 border-amber-200 text-amber-900'
        "
      >
        @if (results().netEquityCreated >= 0) {
          <p>
            ✨ <strong>Operación atractiva:</strong> Con este precio de compra y el presupuesto de reforma previsto, generas una plusvalía latente de
            <strong>+{{ results().netEquityCreated | currencyFormat }}</strong> frente a la tasación media de pisos terminados en La Guindalera.
            Esto amortigua cualquier variación futura de tipos de interés y te protege ante fluctuaciones del ciclo inmobiliario.
          </p>
        } @else {
          <p>
            ⚠️ <strong>Alerta de precio:</strong> El coste total acumulado de la operación supera en
            <strong>{{ results().netEquityCreated | currencyFormat }}</strong> el valor medio de mercado terminado.
            <strong>Recomendación:</strong> Deberías negociar a la baja el precio de compra del inmueble al menos hasta
            <strong>{{ (scenario().inputs.purchasePrice + results().netEquityCreated) | currencyFormat }}</strong>
            para no asumir sobrecoste patrimonial.
          </p>
        }
      </div>
    </div>
  `,
})
export class EquityProjectionComponent {
  private readonly scenarioService = inject(ScenarioService);

  public readonly scenario = this.scenarioService.activeScenario;
  public readonly results = this.scenarioService.activeResults;

  public costBarPercentage(): number {
    const cost = this.results().totalProjectCost;
    const value = this.results().projectedMarketValue;
    if (value <= 0) return 100;
    return Math.min(100, Math.max(5, (cost / value) * 100));
  }
}

