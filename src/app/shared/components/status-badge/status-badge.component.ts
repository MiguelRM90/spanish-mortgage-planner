import { Component, input } from '@angular/core';
import { PwaBadgeComponent } from 'pwa-ui-core/components';
import { PaymentDiagnosis, LiquidityDiagnosis } from '../../../core/models/mortgage-results.model';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [PwaBadgeComponent, CurrencyFormatPipe],
  template: `
    @if (type() === 'payment') {
      @if (paymentDiagnosis() === 'APPROVED') {
        <pwa-badge variant="success" [showDot]="true">
          <svg style="width: 1rem; height: 1rem; flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>APROBADO (≤ 35%)</span>
        </pwa-badge>
      } @else {
        <pwa-badge variant="danger" [showDot]="true">
          <svg style="width: 1rem; height: 1rem; flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>EN RIESGO / DESACONSEJADO (> 35%)</span>
        </pwa-badge>
      }
    } @else if (type() === 'liquidity') {
      @if (liquidityDiagnosis() === 'SUFFICIENT') {
        <pwa-badge variant="success" [showDot]="true">
          <svg style="width: 1rem; height: 1rem; flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>FONDOS SUFICIENTES</span>
        </pwa-badge>
      } @else {
        <pwa-badge variant="danger" [showDot]="true">
          <svg style="width: 1rem; height: 1rem; flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>FONDOS INSUFICIENTES (Faltan {{ cashGap() | currencyFormat }})</span>
        </pwa-badge>
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
