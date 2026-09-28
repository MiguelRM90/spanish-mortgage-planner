import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, StatusBadgeComponent],
  templateUrl: './kpi-cards.component.html',
})
export class KpiCardsComponent {
  private readonly scenarioService = inject(ScenarioService);

  public readonly scenario = this.scenarioService.activeScenario;
  public readonly results = this.scenarioService.activeResults;

  public inputs() {
    return this.scenario().inputs;
  }
}

