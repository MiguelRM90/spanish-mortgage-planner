import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-equity-projection',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './equity-projection.component.html',
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

