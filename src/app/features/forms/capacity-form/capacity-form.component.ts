import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { NumericSliderInputComponent } from '../../../shared/components/numeric-slider-input/numeric-slider-input.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-capacity-form',
  standalone: true,
  imports: [CommonModule, NumericSliderInputComponent, CurrencyFormatPipe],
  template: `
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900">Liquidez y Capacidad Familiar</h2>
            <p class="text-xs text-slate-500">Ahorros disponibles e ingresos netos familiares</p>
          </div>
        </div>
      </div>

      <!-- Dinero ahorrado disponible -->
      <app-numeric-slider-input
        label="Dinero ahorrado disponible (Colchón y entrada)"
        [value]="inputs().availableSavings"
        [min]="0"
        [max]="600000"
        [step]="1000"
        unit="€"
        prefix="€"
        hint="Total de fondos líquidos disponibles en cuentas corrientes, depósitos o fondos rescatables."
        (valueChange)="onFieldChange('availableSavings', $event)"
      />

      <!-- Ingresos netos anuales -->
      <app-numeric-slider-input
        label="Ingresos netos anuales unidad familiar"
        [value]="inputs().annualNetIncome"
        [min]="12000"
        [max]="300000"
        [step]="1000"
        unit="€"
        prefix="€"
        hint="Suma de nóminas netas o ingresos profesionales anuales después de IRPF y Seguridad Social."
        (valueChange)="onFieldChange('annualNetIncome', $event)"
      />

      <!-- Breakdown pills -->
      <div class="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
        <div>
          <span class="text-slate-500 block text-[11px]">Ingreso neto mensual (anual/12):</span>
          <span class="font-bold text-slate-900 text-sm">
            {{ results().monthlyNetIncome | currencyFormat }} / mes
          </span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px]">Límite endeudamiento (35%):</span>
          <span class="font-bold text-emerald-700 text-sm">
            {{ results().recommendedDebtLimit | currencyFormat }} / mes
          </span>
        </div>
      </div>
    </div>
  `,
})
export class CapacityFormComponent {
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

