import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-scenario-comparison',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, StatusBadgeComponent],
  templateUrl: './scenario-comparison.component.html',
})
export class ScenarioComparisonComponent {
  public readonly scenarioService = inject(ScenarioService);

  public readonly scenarios = this.scenarioService.scenariosWithResults;
  public readonly activeId = this.scenarioService.activeScenarioId;
}

