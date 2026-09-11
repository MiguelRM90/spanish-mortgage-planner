import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { NumericSliderInputComponent } from '../../../shared/components/numeric-slider-input/numeric-slider-input.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, NumericSliderInputComponent, CurrencyFormatPipe],
  template: `
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900">Inmueble y Financiación</h2>
            <p class="text-xs text-slate-500">Precio, % hipoteca, plazo y tipo de interés (TIN)</p>
          </div>
        </div>
      </div>

      <!-- Precio de compraventa -->
      <app-numeric-slider-input
        label="Precio pactado de compraventa"
        [value]="inputs().purchasePrice"
        [min]="50000"
        [max]="2000000"
        [step]="5000"
        unit="€"
        prefix="€"
        hint="Importe final pactado con el vendedor en escritura de compraventa."
        (valueChange)="onFieldChange('purchasePrice', $event)"
      />

      <!-- % Financiación -->
      <app-numeric-slider-input
        label="% Financiación bancaria"
        [value]="inputs().financingPercentage"
        [min]="10"
        [max]="100"
        [step]="1"
        unit="%"
        suffix="%"
        hint="Porcentaje del precio que financiará el banco (habitualmente máx. 80% para vivienda habitual)."
        (valueChange)="onFieldChange('financingPercentage', $event)"
      />

      <!-- Live mini summary pills -->
      <div class="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
        <div>
          <span class="text-slate-500 block text-[11px]">Capital Préstamo:</span>
          <span class="font-bold text-indigo-700 text-sm">
            {{ results().loanCapital | currencyFormat }}
          </span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px]">Entrada no financiada:</span>
          <span class="font-bold text-slate-700 text-sm">
            {{ results().downPayment | currencyFormat }}
          </span>
        </div>
      </div>

      <!-- Plazo en años -->
      <app-numeric-slider-input
        label="Plazo de amortización"
        [value]="inputs().loanTermYears"
        [min]="5"
        [max]="40"
        [step]="1"
        unit="años"
        suffix="años"
        hint="Duración del préstamo. 30 años equivalen a 360 cuotas mensuales."
        (valueChange)="onFieldChange('loanTermYears', $event)"
      />

      <!-- TIN nominal anual -->
      <app-numeric-slider-input
        label="Tipo de Interés Nominal (TIN anual)"
        [value]="inputs().interestRateTin"
        [min]="0"
        [max]="8"
        [step]="0.05"
        unit="%"
        suffix="%"
        hint="Tasa nominal fija o diferencial pactada con la entidad bancaria."
        (valueChange)="onFieldChange('interestRateTin', $event)"
      />
    </div>
  `,
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

