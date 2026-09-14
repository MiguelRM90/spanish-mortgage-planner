import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { NumericSliderInputComponent } from './numeric-slider-input.component';

@Component({
  standalone: true,
  imports: [NumericSliderInputComponent],
  template: `
    <app-numeric-slider-input
      label="Precio de compraventa"
      [value]="price()"
      [min]="50000"
      [max]="2000000"
      [step]="5000"
      unit="€"
      prefix="€"
      (valueChange)="price.set($event)"
    />
  `,
})
class TestHostComponent {
  price = signal(350000);
}

describe('NumericSliderInputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize slider with the correct value instead of clamping to 0 or 100', () => {
    const rangeInput: HTMLInputElement | null =
      fixture.nativeElement.querySelector('input[type="range"]');
    const numberInput: HTMLInputElement | null =
      fixture.nativeElement.querySelector('input[type="number"]');

    expect(rangeInput).toBeTruthy();
    expect(numberInput).toBeTruthy();

    expect(Number(numberInput?.value)).toBe(350000);
    expect(Number(rangeInput?.value)).toBe(350000);
  });

  it('should update host price and inputs when slider is moved', () => {
    const rangeInput: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="range"]');

    rangeInput.value = '500000';
    rangeInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.price()).toBe(500000);
    const numberInput: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="number"]');
    expect(Number(numberInput.value)).toBe(500000);
  });

  it('should update slider when host price changes dynamically', () => {
    host.price.set(750000);
    fixture.detectChanges();

    const rangeInput: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="range"]');
    const numberInput: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="number"]');

    expect(Number(rangeInput.value)).toBe(750000);
    expect(Number(numberInput.value)).toBe(750000);
  });
});

