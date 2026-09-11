import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-scenario-comparison',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, StatusBadgeComponent],
  template: `
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900">Comparativa Directa de Pisos y Escenarios</h2>
          <p class="text-xs text-slate-500">Compara cuotas, aportaciones y viabilidad entre todos tus inmuebles guardados</p>
        </div>
      </div>

      <div class="overflow-x-auto border border-slate-200 rounded-xl">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th class="py-3 px-4 w-48 text-[11px] uppercase tracking-wider text-slate-400">Métrica Financiera</th>
              @for (item of scenarios(); track item.id) {
                <th class="py-3 px-4 text-right" [class.bg-indigo-50]="item.id === activeId()">
                  <div class="flex items-center justify-end gap-1.5">
                    <span class="font-bold text-slate-900">{{ item.name }}</span>
                    @if (item.id === activeId()) {
                      <span class="px-1.5 py-0.5 rounded-sm text-[9px] font-extrabold bg-indigo-600 text-white uppercase">
                        Activo
                      </span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 text-slate-700">
            <!-- Precio de compraventa -->
            <tr class="hover:bg-slate-50/60">
              <td class="py-2.5 px-4 font-semibold text-slate-800">Precio pactado compra</td>
              @for (item of scenarios(); track item.id) {
                <td class="py-2.5 px-4 text-right font-bold text-slate-900" [class.bg-indigo-50/40]="item.id === activeId()">
                  {{ item.inputs.purchasePrice | currencyFormat }}
                </td>
              }
            </tr>

            <!-- Financiación -->
            <tr class="hover:bg-slate-50/60">
              <td class="py-2.5 px-4 font-medium text-slate-600">Financiación (% y Capital)</td>
              @for (item of scenarios(); track item.id) {
                <td class="py-2.5 px-4 text-right" [class.bg-indigo-50/40]="item.id === activeId()">
                  <span class="font-semibold text-slate-800">{{ item.results?.loanCapital | currencyFormat }}</span>
                  <span class="text-slate-400 text-[11px] block">({{ item.inputs.financingPercentage }}% a {{ item.inputs.loanTermYears }} años)</span>
                </td>
              }
            </tr>

            <!-- TIN -->
            <tr class="hover:bg-slate-50/60">
              <td class="py-2.5 px-4 font-medium text-slate-600">Tipo de interés (TIN)</td>
              @for (item of scenarios(); track item.id) {
                <td class="py-2.5 px-4 text-right font-medium" [class.bg-indigo-50/40]="item.id === activeId()">
                  {{ item.inputs.interestRateTin }} %
                </td>
              }
            </tr>

            <!-- Gastos e impuestos -->
            <tr class="hover:bg-slate-50/60">
              <td class="py-2.5 px-4 font-medium text-slate-600">Gastos de compraventa</td>
              @for (item of scenarios(); track item.id) {
                <td class="py-2.5 px-4 text-right font-medium" [class.bg-indigo-50/40]="item.id === activeId()">
                  {{ item.results?.totalPurchaseExpenses | currencyFormat }}
                </td>
              }
            </tr>

            <!-- Presupuesto reforma -->
            <tr class="hover:bg-slate-50/60">
              <td class="py-2.5 px-4 font-medium text-slate-600">Presupuesto reforma</td>
              @for (item of scenarios(); track item.id) {
                <td class="py-2.5 px-4 text-right font-medium text-emerald-700" [class.bg-indigo-50/40]="item.id === activeId()">
                  {{ item.inputs.renovationBudget | currencyFormat }}
                </td>
              }
            </tr>

            <!-- Total Aportación Inicial Requerida -->
            <tr class="bg-amber-50/40 hover:bg-amber-50/80 font-bold border-y border-amber-200/50">
              <td class="py-3 px-4 text-amber-900">Aportación Inicial Necesaria</td>
              @for (item of scenarios(); track item.id) {
                <td class="py-3 px-4 text-right text-amber-950 font-black text-sm" [class.bg-amber-100/50]="item.id === activeId()">
                  {{ item.results?.totalInitialCapitalNeeded | currencyFormat }}
                </td>
              }
            </tr>

            <!-- Superávit / Déficit de Liquidez -->
            <tr class="hover:bg-slate-50/60 font-semibold">
              <td class="py-2.5 px-4 text-slate-800">Superávit / Déficit de Liquidez</td>
              @for (item of scenarios(); track item.id) {
                <td
                  class="py-2.5 px-4 text-right font-bold text-sm"
                  [ngClass]="(item.results?.liquidityDifference ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'"
                  [class.bg-indigo-50/40]="item.id === activeId()"
                >
                  {{ (item.results?.liquidityDifference ?? 0) >= 0 ? '+' : '' }}{{ item.results?.liquidityDifference | currencyFormat }}
                </td>
              }
            </tr>

            <!-- Cuota Mensual Hipotecaria -->
            <tr class="bg-indigo-50/60 hover:bg-indigo-50 font-black border-y border-indigo-200/60">
              <td class="py-3.5 px-4 text-indigo-950">Cuota Mensual Hipotecaria</td>
              @for (item of scenarios(); track item.id) {
                <td class="py-3.5 px-4 text-right text-indigo-700 font-black text-base" [class.bg-indigo-100/60]="item.id === activeId()">
                  {{ item.results?.monthlyPayment | currencyFormat:true }} / m
                </td>
              }
            </tr>

            <!-- Ratio de Esfuerzo -->
            <tr class="hover:bg-slate-50/60">
              <td class="py-2.5 px-4 font-semibold text-slate-800">Ratio de Esfuerzo (% s/ingreso)</td>
              @for (item of scenarios(); track item.id) {
                <td
                  class="py-2.5 px-4 text-right font-bold"
                  [ngClass]="item.results?.paymentDiagnosis === 'APPROVED' ? 'text-emerald-600' : 'text-rose-600'"
                  [class.bg-indigo-50/40]="item.id === activeId()"
                >
                  {{ item.results?.debtToIncomeRatio | number:'1.1-2' }} %
                </td>
              }
            </tr>

            <!-- Margen familiar mensual -->
            <tr class="hover:bg-slate-50/60">
              <td class="py-2.5 px-4 font-medium text-slate-600">Margen neto mensual disponible</td>
              @for (item of scenarios(); track item.id) {
                <td class="py-2.5 px-4 text-right font-semibold text-slate-900" [class.bg-indigo-50/40]="item.id === activeId()">
                  {{ item.results?.netDisposableIncome | currencyFormat:true }} / m
                </td>
              }
            </tr>

            <!-- Diagnóstico de Cuota -->
            <tr class="hover:bg-slate-50/60">
              <td class="py-2.5 px-4 font-semibold text-slate-800">Diagnóstico Viabilidad</td>
              @for (item of scenarios(); track item.id) {
                <td class="py-2.5 px-4 text-right" [class.bg-indigo-50/40]="item.id === activeId()">
                  <app-status-badge
                    type="payment"
                    [paymentDiagnosis]="item.results?.paymentDiagnosis || 'APPROVED'"
                  />
                </td>
              }
            </tr>

            <!-- Diagnóstico de Liquidez -->
            <tr class="hover:bg-slate-50/60">
              <td class="py-2.5 px-4 font-semibold text-slate-800">Diagnóstico Liquidez</td>
              @for (item of scenarios(); track item.id) {
                <td class="py-2.5 px-4 text-right" [class.bg-indigo-50/40]="item.id === activeId()">
                  <app-status-badge
                    type="liquidity"
                    [liquidityDiagnosis]="item.results?.liquidityDiagnosis || 'SUFFICIENT'"
                    [cashGap]="item.results?.unfundedInitialCashGap || 0"
                  />
                </td>
              }
            </tr>

            <!-- Switch button -->
            <tr class="bg-slate-50/80">
              <td class="py-3 px-4 text-slate-400 font-medium">Seleccionar como activo</td>
              @for (item of scenarios(); track item.id) {
                <td class="py-3 px-4 text-right" [class.bg-indigo-50/40]="item.id === activeId()">
                  @if (item.id === activeId()) {
                    <span class="text-xs font-bold text-indigo-700">En edición</span>
                  } @else {
                    <button
                      (click)="scenarioService.selectScenario(item.id)"
                      class="px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-600 font-semibold border border-indigo-200 rounded-lg text-xs shadow-2xs transition-colors"
                    >
                      Cargar en simulador
                    </button>
                  }
                </td>
              }
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ScenarioComparisonComponent {
  public readonly scenarioService = inject(ScenarioService);

  public readonly scenarios = this.scenarioService.scenariosWithResults;
  public readonly activeId = this.scenarioService.activeScenarioId;
}

