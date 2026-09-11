import { Component, input } from '@angular/core';
import { PaymentDiagnosis, LiquidityDiagnosis } from '../../../core/models/mortgage-results.model';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CurrencyFormatPipe],
  template: `
    @if (type() === 'payment') {
      @if (paymentDiagnosis() === 'APPROVED') {
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>APROBADO (≤ 35%)</span>
        </div>
      } @else {
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>EN RIESGO / DESACONSEJADO (> 35%)</span>
        </div>
      }
    } @else if (type() === 'liquidity') {
      @if (liquidityDiagnosis() === 'SUFFICIENT') {
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>FONDOS SUFICIENTES</span>
        </div>
      } @else {
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>FONDOS INSUFICIENTES (Faltan {{ cashGap() | currencyFormat }})</span>
        </div>
      }
    }
  `,
})
export class StatusBadgeComponent {
  public readonly type = input.required<'payment' | 'liquidity'>();
  public readonly paymentDiagnosis = input<PaymentDiagnosis>('APPROVED');
  public readonly liquidityDiagnosis = input<LiquidityDiagnosis>('SUFFICIENT');
  public readonly cashGap = input<number>(0);
}

