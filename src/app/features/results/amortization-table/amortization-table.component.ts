import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-amortization-table',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './amortization-table.component.html',
})
export class AmortizationTableComponent {
  private readonly scenarioService = inject(ScenarioService);

  public readonly results = this.scenarioService.activeResults;
  public readonly yearlySummary = this.scenarioService.yearlyAmortization;
  public readonly isExpanded = signal<boolean>(false);

  public toggleExpanded(): void {
    this.isExpanded.update((v) => !v);
  }
}

