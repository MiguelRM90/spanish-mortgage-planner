import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../core/services/scenario.service';
import { ScenarioManagerComponent } from '../scenarios/scenario-manager/scenario-manager.component';
import { PropertyFormComponent } from '../forms/property-form/property-form.component';
import { ExpensesFormComponent } from '../forms/expenses-form/expenses-form.component';
import { CapacityFormComponent } from '../forms/capacity-form/capacity-form.component';
import { KpiCardsComponent } from '../results/kpi-cards/kpi-cards.component';
import { RiskAssessmentComponent } from '../results/risk-assessment/risk-assessment.component';
import { CapitalBreakdownComponent } from '../results/capital-breakdown/capital-breakdown.component';
import { AmortizationTableComponent } from '../results/amortization-table/amortization-table.component';
import { ScenarioComparisonComponent } from '../scenarios/scenario-comparison/scenario-comparison.component';

type DashboardTab = 'simulator' | 'comparison';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ScenarioManagerComponent,
    PropertyFormComponent,
    ExpensesFormComponent,
    CapacityFormComponent,
    KpiCardsComponent,
    RiskAssessmentComponent,
    CapitalBreakdownComponent,
    AmortizationTableComponent,
    ScenarioComparisonComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Scenario Management Header -->
      <app-scenario-manager />

      <!-- View Selector (Simulador vs Comparativa) -->
      <div class="flex items-center justify-between border-b border-slate-200 pb-3">
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="activeTab.set('simulator')"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
            [ngClass]="activeTab() === 'simulator' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            <span>📊 Simulador y Métricas</span>
          </button>
          <button
            type="button"
            (click)="activeTab.set('comparison')"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
            [ngClass]="activeTab() === 'comparison' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            <span>⚖️ Comparar Escenarios</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold" [ngClass]="activeTab() === 'comparison' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'">
              {{ scenarioService.scenarios().length }}
            </span>
          </button>
        </div>

        <div class="hidden sm:block text-xs text-slate-500 font-medium">
          Edición en tiempo real • Cálculo automático
        </div>
      </div>

      <!-- Tab 1: Simulator & Financial Dashboard -->
      @if (activeTab() === 'simulator') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left Column: Input Forms (5 cols on lg) -->
          <div class="lg:col-span-5 space-y-5">
            <app-property-form />
            <app-expenses-form />
            <app-capacity-form />
          </div>

          <!-- Right Column: Outputs, KPIs, Risk, Breakdown (7 cols on lg) -->
          <div class="lg:col-span-7 space-y-5">
            <!-- 4 Main Financial KPI Cards -->
            <app-kpi-cards />

            <!-- Risk & Debt Assessment Gauge -->
            <app-risk-assessment />

            <!-- Visual Capital & Cost Breakdown -->
            <app-capital-breakdown />

            <!-- Amortization Table (French System) -->
            <app-amortization-table />
          </div>
        </div>
      } @else {
        <!-- Tab 2: Side-by-side Scenarios Comparison -->
        <div>
          <app-scenario-comparison />
        </div>
      }
    </div>
  `,
})
export class DashboardComponent {
  public readonly scenarioService = inject(ScenarioService);
  public readonly activeTab = signal<DashboardTab>('simulator');
}

