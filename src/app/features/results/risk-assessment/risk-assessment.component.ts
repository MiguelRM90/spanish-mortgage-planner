import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-risk-assessment',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900">Diagnóstico de Riesgo y Viabilidad Bancaria</h2>
          <p class="text-xs text-slate-500">Evaluación según criterios del Banco de España y solvencia</p>
        </div>
      </div>

      <!-- Debt Ratio Gauge / Meter -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-700">Ratio de Endeudamiento sobre Ingresos</span>
          <span class="font-bold text-sm" [ngClass]="results().paymentDiagnosis === 'APPROVED' ? 'text-emerald-600' : 'text-rose-600'">
            {{ results().debtToIncomeRatio | number:'1.1-2' }} %
          </span>
        </div>

        <!-- Custom visual progress bar -->
        <div class="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 flex">
          <!-- Safe zone: 0% to 35% of income -->
          <div class="h-full bg-emerald-400 rounded-l-full" style="width: 70%;"></div>
          <!-- Warning / Danger zone: >35% -->
          <div class="h-full bg-rose-400 rounded-r-full" style="width: 30%;"></div>

          <!-- Threshold marker at 35% (which is 70% of a 50% scale) -->
          <div class="absolute top-0 bottom-0 left-[70%] w-0.5 bg-slate-800 z-10" title="Límite máximo recomendado: 35%"></div>
        </div>

        <div class="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>0%</span>
          <span class="text-emerald-700 font-semibold">Zona Recomendada (≤ 35%)</span>
          <span class="font-bold text-slate-700">Tope 35%</span>
          <span class="text-rose-700 font-semibold">Zona de Riesgo (&gt; 35%)</span>
          <span>50%+</span>
        </div>
      </div>

      <!-- Detailed Diagnostic Boxes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <!-- Cuota Viability Box -->
        @if (results().paymentDiagnosis === 'APPROVED') {
          <div class="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-emerald-800">
              <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Cuota APROBADA ({{ results().debtToIncomeRatio | number:'1.1-2' }}%)</span>
            </div>
            <p class="text-[11px] leading-relaxed text-emerald-800/90">
              La cuota mensual de <strong>{{ results().monthlyPayment | currencyFormat:true }}</strong> representa menos del 35% de tus ingresos familiares netos (<strong>{{ results().monthlyNetIncome | currencyFormat:true }}/mes</strong>). Cumples los filtros de concesión bancaria estándar.
            </p>
          </div>
        } @else {
          <div class="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs text-rose-900 space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-rose-800">
              <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Cuota EN RIESGO ({{ results().debtToIncomeRatio | number:'1.1-2' }}%)</span>
            </div>
            <p class="text-[11px] leading-relaxed text-rose-800/90">
              La cuota mensual excede el tope recomendado del 35% (<strong>{{ results().recommendedDebtLimit | currencyFormat:true }}/mes</strong>). Las entidades bancarias probablemente exijan mayor entrada, avales o desestimen la concesión.
            </p>
          </div>
        }

        <!-- Liquidity Viability Box -->
        @if (results().liquidityDiagnosis === 'SUFFICIENT') {
          <div class="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-emerald-800">
              <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>FONDOS SUFICIENTES (+{{ results().liquidityDifference | currencyFormat }})</span>
            </div>
            <p class="text-[11px] leading-relaxed text-emerald-800/90">
              Tus ahorros disponibles de <strong>{{ inputs().availableSavings | currencyFormat }}</strong> son suficientes para cubrir la entrada, gastos notariales/fiscales y la reforma planificada, conservando un remanente de liquidez de <strong>{{ results().liquidityDifference | currencyFormat }}</strong>.
            </p>
          </div>
        } @else {
          <div class="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs text-rose-900 space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-rose-800">
              <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>FONDOS INSUFICIENTES (Déficit {{ results().unfundedInitialCashGap | currencyFormat }})</span>
            </div>
            <p class="text-[11px] leading-relaxed text-rose-800/90">
              La aportación inicial necesaria (<strong>{{ results().totalInitialCapitalNeeded | currencyFormat }}</strong>) supera tus ahorros disponibles. Se requiere una fuente adicional de financiación o reducir el presupuesto de reforma en al menos <strong>{{ results().unfundedInitialCashGap | currencyFormat }}</strong>.
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class RiskAssessmentComponent {
  private readonly scenarioService = inject(ScenarioService);

  public readonly scenario = this.scenarioService.activeScenario;
  public readonly results = this.scenarioService.activeResults;

  public inputs() {
    return this.scenario().inputs;
  }
}

