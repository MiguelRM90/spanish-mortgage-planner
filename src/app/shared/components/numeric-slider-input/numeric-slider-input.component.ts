import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-numeric-slider-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <label class="text-xs font-semibold text-slate-700 flex items-center gap-1">
          <span>{{ label() }}</span>
          @if (hint()) {
            <span class="text-slate-400 font-normal text-[11px] cursor-help" [title]="hint()">
              ℹ️
            </span>
          }
        </label>
        @if (unit() === '€') {
          <span class="text-xs font-medium text-slate-500">
            {{ formatCurrencyDisplay(value()) }}
          </span>
        } @else if (unit() === '%') {
          <span class="text-xs font-medium text-slate-500">
            {{ value() | number: '1.1-2' }} %
          </span>
        } @else if (unit()) {
          <span class="text-xs font-medium text-slate-500"> {{ value() }} {{ unit() }} </span>
        }
      </div>

      <div class="relative flex items-center">
        @if (prefix()) {
          <span class="absolute left-3 text-sm font-medium text-slate-400 select-none">
            {{ prefix() }}
          </span>
        }

        <input
          type="number"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [value]="value()"
          (input)="onInputChange($event)"
          [class.pl-7]="prefix()"
          [class.pr-8]="suffix()"
          class="w-full h-10 px-3 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />

        @if (suffix()) {
          <span class="absolute right-3 text-sm font-medium text-slate-400 select-none">
            {{ suffix() }}
          </span>
        }
      </div>

      @if (showSlider()) {
        <div class="pt-1 px-1">
          <input
            type="range"
            [min]="min()"
            [max]="max()"
            [step]="step()"
            [value]="value()"
            (input)="onSliderChange($event)"
            class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-hidden"
          />
          <div class="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
            <span>{{ minDisplay() }}</span>
            <span>{{ maxDisplay() }}</span>
          </div>
        </div>
      }
    </div>
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

  public onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const num = parseFloat(target.value);
    if (!isNaN(num)) {
      this.valueChange.emit(num);
    }
  }

  public onSliderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const num = parseFloat(target.value);
    if (!isNaN(num)) {
      this.valueChange.emit(num);
    }
  }

  public formatCurrencyDisplay(val: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  }

  public minDisplay(): string {
    if (this.unit() === '€') {
      return this.formatCurrencyDisplay(this.min());
    }
    return `${this.min()}${this.unit() ? ' ' + this.unit() : ''}`;
  }

  public maxDisplay(): string {
    if (this.unit() === '€') {
      return this.formatCurrencyDisplay(this.max());
    }
    return `${this.max()}${this.unit() ? ' ' + this.unit() : ''}`;
  }
}
