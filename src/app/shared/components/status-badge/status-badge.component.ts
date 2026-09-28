import { Component, input } from '@angular/core';
import { PwaBadgeComponent } from 'pwa-ui-core/components';
import { PaymentDiagnosis, LiquidityDiagnosis } from '../../../core/models/mortgage-results.model';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [PwaBadgeComponent, CurrencyFormatPipe],
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  public readonly type = input.required<'payment' | 'liquidity'>();
  public readonly paymentDiagnosis = input<PaymentDiagnosis>('APPROVED');
  public readonly liquidityDiagnosis = input<LiquidityDiagnosis>('SUFFICIENT');
  public readonly cashGap = input<number>(0);
}
