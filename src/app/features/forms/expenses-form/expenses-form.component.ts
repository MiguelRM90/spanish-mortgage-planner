import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { NumericSliderInputComponent } from '../../../shared/components/numeric-slider-input/numeric-slider-input.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-expenses-form',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h2 class="text-sm font-bold text-slate-900">Gastos e Impuestos de Compraventa</h2>
            <p class="text-xs text-slate-500">ITP de Madrid (6% o 4%) y aranceles notariales y registrales</p>
          </div>
        </div>

        <!-- Subtotal Badge -->
        <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
          Escrituración: {{ results().totalPurchaseExpenses | currencyFormat }}
        </span>
      </div>

      <!-- ITP (Comunidad de Madrid) -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <span>ITP (Impuesto Transmisiones Patrimoniales)</span>
            <span class="text-slate-400 font-normal text-[11px] cursor-help" title="Tipo general en Comunidad de Madrid: 6.0%. Familias numerosas o jóvenes pueden tener tipo reducido (4%).">ℹ️</span>
          </label>
          <span class="text-xs font-bold text-slate-800">
            {{ results().itpAmount | currencyFormat }} ({{ inputs().itpRate }}%)
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            (click)="onFieldChange('itpRate', 6.0)"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg border text-left transition-colors flex items-center justify-between"
            [ngClass]="inputs().itpRate === 6.0 ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'"
          >
            <span>Madrid General</span>
            <span class="font-bold">6%</span>
          </button>
          <button
            type="button"
            (click)="onFieldChange('itpRate', 4.0)"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg border text-left transition-colors flex items-center justify-between"
            [ngClass]="inputs().itpRate === 4.0 ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'"
          >
            <span>Reducido / Fam. Num.</span>
            <span class="font-bold">4%</span>
          </button>
        </div>
      </div>

      <!-- Costes fijos y aranceles configurables -->
      <div class="grid grid-cols-2 gap-3 pt-1">
        <!-- Notaría -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-slate-600 block">Notaría (€)</label>
          <input
            type="number"
            [value]="inputs().notaryFee"
            (input)="onInputManual('notaryFee', $event)"
            min="0"
            step="50"
            class="w-full h-9 px-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- Registro de la Propiedad -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-slate-600 block">Registro Propiedad (€)</label>
          <input
            type="number"
            [value]="inputs().registryFee"
            (input)="onInputManual('registryFee', $event)"
            min="0"
            step="50"
            class="w-full h-9 px-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- Gestoría Bancaria -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-slate-600 block">Gestoría (€)</label>
          <input
            type="number"
            [value]="inputs().managementFee"
            (input)="onInputManual('managementFee', $event)"
            min="0"
            step="50"
            class="w-full h-9 px-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- Tasación Oficial -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-slate-600 block">Tasación oficial (€)</label>
          <input
            type="number"
            [value]="inputs().appraisalFee"
            (input)="onInputManual('appraisalFee', $event)"
            min="0"
            step="50"
            class="w-full h-9 px-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <!-- Resumen Reforma vinculada al bloque 3 -->
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
        <span class="flex items-center gap-1.5">
          <span>🔨 Reforma estimada (Bloque 3):</span>
          <span class="font-bold text-slate-800">{{ results().renovationResults.totalRenovationCost | currencyFormat }}</span>
        </span>
        <span class="text-[11px] text-indigo-600 font-semibold">Configurable en Bloque 3 ↓</span>
      </div>
    </div>
  `,
})
export class ExpensesFormComponent {
  private readonly scenarioService = inject(ScenarioService);

  public readonly scenario = this.scenarioService.activeScenario;
  public readonly results = this.scenarioService.activeResults;

  public inputs() {
    return this.scenario().inputs;
  }

  public onFieldChange(field: string, val: number): void {
    this.scenarioService.updateActiveInputs({ [field]: val });
  }

  public onInputManual(field: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const num = parseFloat(target.value);
    if (!isNaN(num)) {
      this.scenarioService.updateActiveInputs({ [field]: num });
    }
  }
}

