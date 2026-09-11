import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-amortization-table',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900">Cuadro de Amortización (Sistema Francés)</h2>
          <p class="text-xs text-slate-500">Evolución de cuotas, amortización de capital e intereses acumulados</p>
        </div>

        <button
          type="button"
          (click)="toggleExpanded()"
          class="px-3 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          {{ isExpanded() ? 'Ocultar tabla' : 'Ver cuadro completo' }}
        </button>
      </div>

      <!-- Quick preview summary / chart simulation -->
      <div class="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
        <div>
          <span class="text-slate-500 block text-[11px]">Capital Inicial:</span>
          <span class="font-bold text-slate-900 text-sm">
            {{ results().loanCapital | currencyFormat }}
          </span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px]">Intereses Totales:</span>
          <span class="font-bold text-amber-600 text-sm">
            {{ results().totalInterest | currencyFormat }}
          </span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px]">Coste Total Préstamo:</span>
          <span class="font-bold text-indigo-700 text-sm">
            {{ results().totalLoanCost | currencyFormat }}
          </span>
        </div>
      </div>

      @if (isExpanded()) {
        <div class="overflow-x-auto max-h-96 border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="sticky top-0 bg-slate-100 text-slate-600 font-semibold text-[11px] shadow-xs">
              <tr class="border-b border-slate-200">
                <th class="py-2.5 px-3">Año</th>
                <th class="py-2.5 px-3 text-right">Cuotas Totales</th>
                <th class="py-2.5 px-3 text-right">Capital Amortizado</th>
                <th class="py-2.5 px-3 text-right">Intereses Pagados</th>
                <th class="py-2.5 px-3 text-right">Capital Pendiente</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              @for (item of yearlySummary(); track item.year) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-2 px-3 font-semibold text-slate-900">Año {{ item.year }}</td>
                  <td class="py-2 px-3 text-right font-medium">{{ item.totalPayment | currencyFormat }}</td>
                  <td class="py-2 px-3 text-right text-emerald-700 font-medium">+{{ item.totalPrincipal | currencyFormat }}</td>
                  <td class="py-2 px-3 text-right text-amber-700 font-medium">{{ item.totalInterest | currencyFormat }}</td>
                  <td class="py-2 px-3 text-right font-semibold text-slate-800">{{ item.remainingBalance | currencyFormat }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
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

