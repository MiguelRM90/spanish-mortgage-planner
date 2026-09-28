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
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  public readonly scenarioService = inject(ScenarioService);
  public readonly activeTab = signal<DashboardTab>('simulator');
}
