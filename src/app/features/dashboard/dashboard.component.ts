import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../core/services/scenario.service';
import { ScenarioManagerComponent } from '../scenarios/scenario-manager/scenario-manager.component';
import { PropertyFormComponent } from '../forms/property-form/property-form.component';
import { ExpensesFormComponent } from '../forms/expenses-form/expenses-form.component';
import { CapacityFormComponent } from '../forms/capacity-form/capacity-form.component';
import { RenovationFormComponent } from '../forms/renovation-form/renovation-form.component';
import { KpiCardsComponent } from '../results/kpi-cards/kpi-cards.component';
import { EquityProjectionComponent } from '../results/equity-projection/equity-projection.component';
import { RiskAssessmentComponent } from '../results/risk-assessment/risk-assessment.component';
import { CapitalBreakdownComponent } from '../results/capital-breakdown/capital-breakdown.component';
import { AmortizationTableComponent } from '../results/amortization-table/amortization-table.component';
import { ScenarioComparisonComponent } from '../scenarios/scenario-comparison/scenario-comparison.component';
import { MarketObservatoryComponent } from '../market/market-observatory/market-observatory.component';
import { PropertyScoutingComponent } from '../scouting/property-scouting/property-scouting.component';

export type DashboardTab = 'simulator' | 'market' | 'scouting' | 'comparison';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ScenarioManagerComponent,
    PropertyFormComponent,
    ExpensesFormComponent,
    RenovationFormComponent,
    CapacityFormComponent,
    KpiCardsComponent,
    EquityProjectionComponent,
    RiskAssessmentComponent,
    CapitalBreakdownComponent,
    AmortizationTableComponent,
    ScenarioComparisonComponent,
    MarketObservatoryComponent,
    PropertyScoutingComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Scenario Management Header -->
      <app-scenario-manager />

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <!-- Tab 1: Simulator -->
          <button
            type="button"
            (click)="activeTab.set('simulator')"
            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5"
            [ngClass]="activeTab() === 'simulator' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            <span>📊 Simulador</span>
          </button>

          <!-- Tab 2: Market Observatory -->
          <button
            type="button"
            (click)="activeTab.set('market')"
            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5"
            [ngClass]="activeTab() === 'market' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            <span>📈 Observatorio La Guindalera</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-slate-900">
              REAL
            </span>
          </button>

          <!-- Tab 3: Scouting Visits -->
          <button
            type="button"
            (click)="activeTab.set('scouting')"
            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5"
            [ngClass]="activeTab() === 'scouting' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            <span>📋 Fichas de Visita</span>
          </button>

          <!-- Tab 4: Scenarios Comparison -->
          <button
            type="button"
            (click)="activeTab.set('comparison')"
            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5"
            [ngClass]="activeTab() === 'comparison' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
          >
            <span>⚖️ Comparar Pisos</span>
            <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold" [ngClass]="activeTab() === 'comparison' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'">
              {{ scenarioService.scenarios().length }}
            </span>
          </button>
        </div>

        <div class="text-[11px] text-slate-500 font-medium hidden sm:block">
          La Guindalera • 100% Offline PWA • Cero Costes
        </div>
      </div>

      <!-- Tab 1: Simulator & Financial Dashboard -->
      @if (activeTab() === 'simulator') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left Column: Input Forms (5 cols on lg) -->
          <div class="lg:col-span-5 space-y-5">
            <app-property-form />
            <app-expenses-form />
            <app-renovation-form />
            <app-capacity-form />
          </div>

          <!-- Right Column: Outputs, KPIs, Risk, Breakdown (7 cols on lg) -->
          <div class="lg:col-span-7 space-y-5">
            <!-- 4 Main Financial KPI Cards -->
            <app-kpi-cards />

            <!-- Equity & Value Creation Projection in La Guindalera -->
            <app-equity-projection />

            <!-- Risk & Debt Assessment Gauge -->
            <app-risk-assessment />

            <!-- Visual Capital & Cost Breakdown -->
            <app-capital-breakdown />

            <!-- Amortization Table (French System) -->
            <app-amortization-table />
          </div>
        </div>
      }

      <!-- Tab 2: Guindalera Real Estate Market Observatory & Euribor -->
      @if (activeTab() === 'market') {
        <app-market-observatory />
      }

      <!-- Tab 3: Scouting Visits -->
      @if (activeTab() === 'scouting') {
        <app-property-scouting (navigateToSimulator)="activeTab.set('simulator')" />
      }

      <!-- Tab 4: Side-by-side Scenarios Comparison -->
      @if (activeTab() === 'comparison') {
        <app-scenario-comparison />
      }
    </div>
  `,
})
export class DashboardComponent {
  public readonly scenarioService = inject(ScenarioService);
  public readonly activeTab = signal<DashboardTab>('simulator');
}
