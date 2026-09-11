import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-capital-breakdown',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900">Desglose Visual de la Inversión y Fondos</h2>
          <p class="text-xs text-slate-500">Distribución de capital entre banco, fondos propios, impuestos y obra</p>
        </div>
      </div>

      <!-- Total Operation Visual Bar -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Coste Total de la Operación Inmueble</span>
          <span class="text-sm font-bold text-slate-900">{{ results().totalProjectCost | currencyFormat }}</span>
        </div>

        <div class="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <!-- Financed Capital -->
          <div
            class="h-full bg-indigo-600 transition-all duration-300"
            [style.width.%]="(results().loanCapital / results().totalProjectCost) * 100"
            [title]="'Préstamo Hipotecario: ' + (results().loanCapital | currencyFormat)"
          ></div>
          <!-- Down Payment -->
          <div
            class="h-full bg-indigo-300 transition-all duration-300"
            [style.width.%]="(results().downPayment / results().totalProjectCost) * 100"
            [title]="'Entrada Comprador: ' + (results().downPayment | currencyFormat)"
          ></div>
          <!-- Purchase Expenses -->
          <div
            class="h-full bg-amber-400 transition-all duration-300"
            [style.width.%]="(results().totalPurchaseExpenses / results().totalProjectCost) * 100"
            [title]="'Gastos e Impuestos: ' + (results().totalPurchaseExpenses | currencyFormat)"
          ></div>
          <!-- Renovation -->
          <div
            class="h-full bg-emerald-500 transition-all duration-300"
            [style.width.%]="(inputs().renovationBudget / results().totalProjectCost) * 100"
            [title]="'Reforma: ' + (inputs().renovationBudget | currencyFormat)"
          ></div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-indigo-600 shrink-0"></span>
            <span class="text-slate-600">Hipoteca: <strong>{{ results().loanCapital | currencyFormat }}</strong></span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-indigo-300 shrink-0"></span>
            <span class="text-slate-600">Entrada: <strong>{{ results().downPayment | currencyFormat }}</strong></span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-amber-400 shrink-0"></span>
            <span class="text-slate-600">Gastos: <strong>{{ results().totalPurchaseExpenses | currencyFormat }}</strong></span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-emerald-500 shrink-0"></span>
            <span class="text-slate-600">Reforma: <strong>{{ inputs().renovationBudget | currencyFormat }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Detailed Expenses Breakdown Table -->
      <div class="pt-2 border-t border-slate-100">
        <h3 class="text-xs font-bold text-slate-800 mb-2">Desglose Detallado de Gastos de Compraventa</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <th class="py-1.5 pr-2">Concepto</th>
                <th class="py-1.5 px-2 text-right">Porcentaje / Base</th>
                <th class="py-1.5 pl-2 text-right">Importe</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td class="py-1.5 pr-2 font-medium">ITP (Impuesto Transmisiones Madrid)</td>
                <td class="py-1.5 px-2 text-right text-slate-500">{{ inputs().itpRate }}% sobre compra</td>
                <td class="py-1.5 pl-2 text-right font-semibold text-slate-900">{{ results().itpAmount | currencyFormat }}</td>
              </tr>
              <tr>
                <td class="py-1.5 pr-2 font-medium">Arancel de Notaría</td>
                <td class="py-1.5 px-2 text-right text-slate-500">Escritura pública</td>
                <td class="py-1.5 pl-2 text-right font-semibold text-slate-900">{{ inputs().notaryFee | currencyFormat }}</td>
              </tr>
              <tr>
                <td class="py-1.5 pr-2 font-medium">Registro de la Propiedad</td>
                <td class="py-1.5 px-2 text-right text-slate-500">Inscripción registral</td>
                <td class="py-1.5 pl-2 text-right font-semibold text-slate-900">{{ inputs().registryFee | currencyFormat }}</td>
              </tr>
              <tr>
                <td class="py-1.5 pr-2 font-medium">Gestoría Administrativa</td>
                <td class="py-1.5 px-2 text-right text-slate-500">Tramitación de escritura</td>
                <td class="py-1.5 pl-2 text-right font-semibold text-slate-900">{{ inputs().managementFee | currencyFormat }}</td>
              </tr>
              <tr>
                <td class="py-1.5 pr-2 font-medium">Tasación Oficial Homologada</td>
                <td class="py-1.5 px-2 text-right text-slate-500">Valoración ECO banco</td>
                <td class="py-1.5 pl-2 text-right font-semibold text-slate-900">{{ inputs().appraisalFee | currencyFormat }}</td>
              </tr>
              <tr class="font-bold bg-slate-50/70">
                <td class="py-2 pr-2 text-slate-900">Subtotal Gastos e Impuestos</td>
                <td class="py-2 px-2 text-right text-slate-500">Total gastos</td>
                <td class="py-2 pl-2 text-right text-indigo-700">{{ results().totalPurchaseExpenses | currencyFormat }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class CapitalBreakdownComponent {
  private readonly scenarioService = inject(ScenarioService);

  public readonly scenario = this.scenarioService.activeScenario;
  public readonly results = this.scenarioService.activeResults;

  public inputs() {
    return this.scenario().inputs;
  }
}

