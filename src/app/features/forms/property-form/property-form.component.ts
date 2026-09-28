import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { NumericSliderInputComponent } from '../../../shared/components/numeric-slider-input/numeric-slider-input.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, NumericSliderInputComponent, CurrencyFormatPipe],
  templateUrl: './property-form.component.html',
})
export class PropertyFormComponent {
  private readonly scenarioService = inject(ScenarioService);

  public readonly scenario = this.scenarioService.activeScenario;
  public readonly results = this.scenarioService.activeResults;

  public inputs() {
    return this.scenario().inputs;
  }

  public onFieldChange(field: string, val: number): void {
    this.scenarioService.updateActiveInputs({ [field]: val });
  }
}

