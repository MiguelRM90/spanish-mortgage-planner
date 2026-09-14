import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, StatusBadgeComponent],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- 1. Cuota Mensual Hipotecaria -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div class="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-0 pointer-events-none opacity-60"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Cuota Mensual Hipotecaria</span>
            <app-status-badge
              type="payment"
              [paymentDiagnosis]="results().paymentDiagnosis"
            />
          </div>

          <div class="flex items-baseline gap-1 my-1">
            <span class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {{ results().monthlyPayment | currencyFormat:true }}
            </span>
            <span class="text-xs font-medium text-slate-500">/ mes</span>
          </div>

          <p class="text-xs text-slate-500 mt-1">
            Ratio de esfuerzo: <strong [ngClass]="results().paymentDiagnosis === 'APPROVED' ? 'text-emerald-600' : 'text-rose-600'">{{ results().debtToIncomeRatio | number:'1.1-2' }}%</strong> de los ingresos netos.
          </p>
        </div>

        <div class="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 relative z-10">
          <div>
            <span class="text-slate-400 block text-[11px]">Total Intereses:</span>
            <span class="font-semibold text-slate-700">{{ results().totalInterest | currencyFormat }}</span>
          </div>
          <div class="text-right">
            <span class="text-slate-400 block text-[11px]">Total Devuelto Banco:</span>
            <span class="font-semibold text-slate-700">{{ results().totalLoanCost | currencyFormat }}</span>
          </div>
        </div>
      </div>

      <!-- 2. Aportación Inicial Requerida -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div class="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 pointer-events-none opacity-60"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Aportación Inicial Requerida</span>
            <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              Cash necesario
            </span>
          </div>

          <div class="flex items-baseline gap-1 my-1">
            <span class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {{ results().totalInitialCapitalNeeded | currencyFormat }}
            </span>
          </div>

          <p class="text-xs text-slate-500 mt-1">
            Entrada + Gastos e Impuestos + Reforma
          </p>
        </div>

        <div class="pt-3 mt-3 border-t border-slate-100 grid grid-cols-3 gap-1 text-[11px] text-slate-600 relative z-10">
          <div>
            <span class="text-slate-400 block text-[10px]">Entrada:</span>
            <span class="font-semibold text-slate-700">{{ results().downPayment | currencyFormat }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px]">Gastos:</span>
            <span class="font-semibold text-slate-700">{{ results().totalPurchaseExpenses | currencyFormat }}</span>
          </div>
          <div class="text-right">
            <span class="text-slate-400 block text-[10px]">Reforma (cash):</span>
            <span class="font-semibold text-slate-700">{{ results().unfinancedRenovationAmount | currencyFormat }}</span>
          </div>
        </div>
      </div>

      <!-- 3. Superávit / Déficit de Liquidez -->
      <div
        class="bg-white rounded-2xl p-5 border shadow-xs relative overflow-hidden flex flex-col justify-between"
        [ngClass]="results().liquidityDifference >= 0 ? 'border-emerald-200/80' : 'border-rose-200/80'"
      >
        <div
          class="absolute top-0 right-0 w-24 h-24 rounded-bl-full -z-0 pointer-events-none opacity-40"
          [ngClass]="results().liquidityDifference >= 0 ? 'bg-emerald-100' : 'bg-rose-100'"
        ></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Balance de Liquidez Inicial</span>
            <app-status-badge
              type="liquidity"
              [liquidityDiagnosis]="results().liquidityDiagnosis"
              [cashGap]="results().unfundedInitialCashGap"
            />
          </div>

          <div class="flex items-baseline gap-1 my-1">
            <span
              class="text-3xl sm:text-4xl font-black tracking-tight"
              [ngClass]="results().liquidityDifference >= 0 ? 'text-emerald-700' : 'text-rose-700'"
            >
              {{ results().liquidityDifference >= 0 ? '+' : '' }}{{ results().liquidityDifference | currencyFormat }}
            </span>
          </div>

          @if (results().liquidityDifference >= 0) {
            <p class="text-xs text-emerald-700 font-medium mt-1">
              Superávit: Dispones de capital suficiente para entrada, gastos e inicio de reforma.
            </p>
          } @else {
            <p class="text-xs text-rose-700 font-semibold mt-1">
              Déficit: Faltan {{ results().unfundedInitialCashGap | currencyFormat }} en ahorros o requerirás financiación complementaria de reforma.
            </p>
          }
        </div>

        <div class="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 relative z-10">
          <div>
            <span class="text-slate-400 block text-[11px]">Dinero Ahorrado:</span>
            <span class="font-semibold text-slate-700">{{ inputs().availableSavings | currencyFormat }}</span>
          </div>
          <div class="text-right">
            <span class="text-slate-400 block text-[11px]">Coste Total Operación:</span>
            <span class="font-semibold text-slate-700">{{ results().totalProjectCost | currencyFormat }}</span>
          </div>
        </div>
      </div>

      <!-- 4. Capacidad Familiar y Margen Libre -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 pointer-events-none opacity-60"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Margen Familiar Disponible</span>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Cash flow mensual
            </span>
          </div>

          <div class="flex items-baseline gap-1 my-1">
            <span class="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
              {{ results().netDisposableIncome | currencyFormat:true }}
            </span>
            <span class="text-xs font-medium text-slate-500">/ mes</span>
          </div>

          <p class="text-xs text-slate-500 mt-1">
            Suma neta disponible cada mes para gastos corrientes, ocio y ahorro tras pagar la cuota.
          </p>
        </div>

        <div class="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 relative z-10">
          <div>
            <span class="text-slate-400 block text-[11px]">Ingreso Neto Familiar:</span>
            <span class="font-semibold text-slate-700">{{ results().monthlyNetIncome | currencyFormat:true }}/m</span>
          </div>
          <div class="text-right">
            <span class="text-slate-400 block text-[11px]">Tope Banco (35%):</span>
            <span class="font-semibold text-slate-700">{{ results().recommendedDebtLimit | currencyFormat:true }}/m</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class KpiCardsComponent {
  private readonly scenarioService = inject(ScenarioService);

  public readonly scenario = this.scenarioService.activeScenario;
  public readonly results = this.scenarioService.activeResults;

  public inputs() {
    return this.scenario().inputs;
  }
}

