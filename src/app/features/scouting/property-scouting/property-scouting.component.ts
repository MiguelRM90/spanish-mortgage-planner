import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScoutingService } from '../../../core/services/scouting.service';
import { ScenarioService } from '../../../core/services/scenario.service';
import { PropertyScoutingItem } from '../../../core/models/scouting.model';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { NumericSliderInputComponent } from '../../../shared/components/numeric-slider-input/numeric-slider-input.component';

@Component({
  selector: 'app-property-scouting',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFormatPipe],
  templateUrl: './property-scouting.component.html',
})
export class PropertyScoutingComponent {
  private readonly scoutingService = inject(ScoutingService);
  private readonly scenarioService = inject(ScenarioService);

  public readonly properties = this.scoutingService.properties;
  public readonly showNewModal = signal<boolean>(false);
  public readonly Math = Math;

  public readonly navigateToSimulator = output<void>();

  public readonly currentSavings = computed(() => {
    return this.scenarioService.activeScenario().inputs.availableSavings;
  });

  public readonly maxAffordablePrice = computed(() => {
    return this.scoutingService.calculateMaxViablePrice(
      this.currentSavings(),
      150000,
      20000
    );
  });

  public newProp = {
    title: '',
    address: '',
    askingPrice: 550000,
    squareMeters: 120,
    floor: '3ª Planta',
    orientation: 'Sur',
    communityFeeMonthly: 90,
    annualIbi: 700,
    notes: '',
    hasElevator: true,
    elevatorViable: true,
    hasFavorableIte: true,
    hasPendingAssessments: false,
    structuralType: 'pillars' as const,
    hvacSystem: 'central' as const,
    ceilingHeightMeters: 2.75,
    naturalLightRating: 4 as const,
  };

  public saveNewProperty(): void {
    if (!this.newProp.title.trim()) {
      this.newProp.title = `Piso ${this.newProp.squareMeters}m² Guindalera`;
    }
    const recOffer = Math.round(this.newProp.askingPrice * 0.915); // ~8.5% negotiation spread

    this.scoutingService.addProperty({
      ...this.newProp,
      recommendedOffer: recOffer,
    });

    this.showNewModal.set(false);
  }

  public deleteProperty(id: string): void {
    this.scoutingService.deleteProperty(id);
  }

  public onSimulate(prop: PropertyScoutingItem): void {
    this.scoutingService.createScenarioFromProperty(prop);
    this.navigateToSimulator.emit();
  }

  public formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
