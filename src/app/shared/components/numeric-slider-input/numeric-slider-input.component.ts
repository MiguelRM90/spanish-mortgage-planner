import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaNumericSliderComponent } from 'pwa-ui-core/components';

@Component({
  selector: 'app-numeric-slider-input',
  standalone: true,
  imports: [CommonModule, PwaNumericSliderComponent],
  template: `
    <pwa-numeric-slider
      [label]="label()"
      [value]="value()"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [unit]="unit()"
      [prefix]="prefix()"
      [suffix]="suffix()"
      [hint]="hint()"
      [showSlider]="showSlider()"
      (valueChange)="valueChange.emit($event)"
    />
  `,
})
export class NumericSliderInputComponent {
  public readonly label = input.required<string>();
  public readonly value = input.required<number>();
  public readonly min = input<number>(0);
  public readonly max = input<number>(1000000);
  public readonly step = input<number>(1);
  public readonly unit = input<string>('');
  public readonly prefix = input<string>('');
  public readonly suffix = input<string>('');
  public readonly hint = input<string>('');
  public readonly showSlider = input<boolean>(true);

  public readonly valueChange = output<number>();
}
