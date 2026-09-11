import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  private readonly formatterWithDecimals = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  private readonly formatterWithoutDecimals = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  transform(value: number | null | undefined, forceDecimals: boolean = false): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0 €';
    }

    // If whole number and not forced, display without decimals for clean UI
    if (!forceDecimals && Number.isInteger(value)) {
      return this.formatterWithoutDecimals.format(value);
    }

    return this.formatterWithDecimals.format(value);
  }
}

