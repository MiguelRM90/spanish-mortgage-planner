import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-capital-breakdown',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './capital-breakdown.component.html',
})
export class CapitalBreakdownComponent {
  private readonly scenarioService = inject(ScenarioService);

  public readonly scenario = this.scenarioService.activeScenario;
  public readonly results = this.scenarioService.activeResults;

  public inputs() {
    return this.scenario().inputs;
  }
}

