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
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="space-y-2 max-w-2xl">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/20">
              📋 Scouting In-Situ
            </span>
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
              La Guindalera (Madrid)
            </span>
          </div>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white">
            Fichas de Visita e Inspección de Pisos
          </h1>
          <p class="text-xs sm:text-sm text-slate-300">
            Anota las características reales de cada piso que vayas a ver (ascensor, ITE, derramas, pilares vs muros de carga) y calcula la oferta máxima para no romper tu liquidez.
          </p>
        </div>

        <button
          type="button"
          (click)="showNewModal.set(true)"
          class="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 shrink-0"
        >
          <span>＋ Nueva Visita a Piso</span>
        </button>
      </div>

      <!-- Live Purchase Capacity Alert based on user savings -->
      <div class="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
        <div class="space-y-0.5">
          <span class="font-bold text-indigo-950 block">
            Capacidad Máxima de Compra Estimada: {{ maxAffordablePrice() | currencyFormat }}
          </span>
          <p class="text-indigo-800/80 text-[11px]">
            Calculada con tus <strong>{{ currentSavings() | currencyFormat }}</strong> de ahorro disponible, reservando un colchón de 20.000 € y considerando una reforma integral (~150.000 €).
          </p>
        </div>
        <span class="px-3 py-1.5 rounded-xl bg-white font-bold text-indigo-700 border border-indigo-200 shrink-0">
          Tope Compra: {{ maxAffordablePrice() | currencyFormat }}
        </span>
      </div>

      <!-- Properties Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        @for (prop of properties(); track prop.id) {
          <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
            <div class="space-y-3">
              <!-- Top Row -->
              <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 class="text-base font-bold text-slate-900">{{ prop.title }}</h2>
                  <p class="text-xs text-slate-500">{{ prop.address }}</p>
                </div>
                <button
                  type="button"
                  (click)="deleteProperty(prop.id)"
                  class="text-slate-400 hover:text-rose-600 transition-colors p-1 text-xs"
                  title="Eliminar piso"
                >
                  ✕
                </button>
              </div>

              <!-- Key Badges -->
              <div class="flex flex-wrap gap-1.5 text-[11px]">
                <span class="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">
                  📐 {{ prop.squareMeters }} m²
                </span>
                <span
                  class="px-2 py-0.5 rounded-md font-semibold"
                  [ngClass]="prop.hasElevator ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
                >
                  {{ prop.hasElevator ? '🛗 Con Ascensor' : '🚫 Sin Ascensor' }}
                </span>
                <span
                  class="px-2 py-0.5 rounded-md font-semibold"
                  [ngClass]="
                    prop.structuralType === 'pillars'
                      ? 'bg-emerald-50 text-emerald-700'
                      : prop.structuralType === 'mixed'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                  "
                >
                  {{ prop.structuralType === 'pillars' ? '🧱 Pilares (abrir espacios)' : prop.structuralType === 'mixed' ? '🧱 Estructura Mixta' : '🧱 Muros de carga' }}
                </span>
                <span class="px-2 py-0.5 rounded-md font-semibold bg-indigo-50 text-indigo-700">
                  ☀️ Luz: {{ prop.naturalLightRating }}/5
                </span>
                <span
                  class="px-2 py-0.5 rounded-md font-semibold"
                  [ngClass]="prop.hasFavorableIte ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
                >
                  {{ prop.hasFavorableIte ? '✓ ITE Favorable' : '⚠️ ITE Desfavorable / Pendiente' }}
                </span>
              </div>

              <!-- Pricing & Negotiation Section -->
              <div class="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span class="text-slate-500 block text-[11px]">Precio que piden:</span>
                  <span class="font-bold text-slate-800 text-sm">
                    {{ prop.askingPrice | currencyFormat }}
                  </span>
                  <span class="text-[10px] text-slate-400 block">
                    {{ Math.round(prop.askingPrice / prop.squareMeters) | currencyFormat }}/m²
                  </span>
                </div>
                <div>
                  <span class="text-indigo-700 block text-[11px] font-semibold">Oferta Máxima Sugerida:</span>
                  <span class="font-extrabold text-indigo-900 text-sm">
                    {{ prop.recommendedOffer | currencyFormat }}
                  </span>
                  <span class="text-[10px] text-emerald-700 font-semibold block">
                    Rebaja: -{{ prop.askingPrice - prop.recommendedOffer | currencyFormat }}
                  </span>
                </div>
              </div>

              <!-- Notes & Inspection Details -->
              @if (prop.notes) {
                <p class="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                  "{{ prop.notes }}"
                </p>
              }

              <!-- Technical Details list -->
              <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                <div>Planta: <strong class="text-slate-800">{{ prop.floor }}</strong></div>
                <div>Orientación: <strong class="text-slate-800">{{ prop.orientation }}</strong></div>
                <div>Comunidad: <strong class="text-slate-800">{{ prop.communityFeeMonthly | currencyFormat:true }}/mes</strong></div>
                <div>IBI: <strong class="text-slate-800">{{ prop.annualIbi | currencyFormat:true }}/año</strong></div>
                <div>Altura Techos: <strong class="text-slate-800">{{ prop.ceilingHeightMeters }} m</strong></div>
                <div>Calefacción: <strong class="text-slate-800">{{ prop.hvacSystem === 'central' ? 'Central' : prop.hvacSystem === 'individual_gas' ? 'Individual Gas' : 'Eléctrica / Sin' }}</strong></div>
              </div>
            </div>

            <!-- Action: Load into Simulator -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span class="text-[11px] text-slate-400">
                Guardado el {{ formatDate(prop.createdAt) }}
              </span>
              <button
                type="button"
                (click)="onSimulate(prop)"
                class="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Simular Hipoteca</span>
                <span>→</span>
              </button>
            </div>
          </div>
        }
      </div>

      <!-- New Property Modal -->
      @if (showNewModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 class="text-base font-bold text-slate-900">Nueva Ficha de Inspección</h2>
              <button (click)="showNewModal.set(false)" class="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="font-semibold text-slate-700 block mb-1">Nombre / Identificador</label>
                <input
                  type="text"
                  [(ngModel)]="newProp.title"
                  placeholder="ej: Piso Francisco Silvela 120m²"
                  class="w-full h-9 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="font-semibold text-slate-700 block mb-1">Dirección exacta / Zona en Guindalera</label>
                <input
                  type="text"
                  [(ngModel)]="newProp.address"
                  placeholder="ej: Calle de Francisco Silvela, 42"
                  class="w-full h-9 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="font-semibold text-slate-700 block mb-1">Precio pedido (€)</label>
                  <input
                    type="number"
                    [(ngModel)]="newProp.askingPrice"
                    step="5000"
                    class="w-full h-9 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label class="font-semibold text-slate-700 block mb-1">Superficie (m²)</label>
                  <input
                    type="number"
                    [(ngModel)]="newProp.squareMeters"
                    step="1"
                    class="w-full h-9 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="font-semibold text-slate-700 block mb-1">Planta</label>
                  <input
                    type="text"
                    [(ngModel)]="newProp.floor"
                    placeholder="ej: 3º Exterior"
                    class="w-full h-9 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="font-semibold text-slate-700 block mb-1">Orientación</label>
                  <input
                    type="text"
                    [(ngModel)]="newProp.orientation"
                    placeholder="ej: Sur / Sureste"
                    class="w-full h-9 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <!-- Checklist Toggles -->
              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <label class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="newProp.hasElevator" class="rounded text-indigo-600" />
                  <span>¿Tiene Ascensor?</span>
                </label>
                <label class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="newProp.hasFavorableIte" class="rounded text-indigo-600" />
                  <span>¿ITE Favorable?</span>
                </label>
              </div>

              <div>
                <label class="font-semibold text-slate-700 block mb-1">Tipo de Estructura</label>
                <select [(ngModel)]="newProp.structuralType" class="w-full h-9 px-3 border border-slate-200 rounded-xl">
                  <option value="pillars">Pilares de hormigón (ideal: permite abrir espacios)</option>
                  <option value="mixed">Estructura mixta (pilares + muro)</option>
                  <option value="load_bearing_walls">Muros de carga (limitación de distribución)</option>
                </select>
              </div>

              <div>
                <label class="font-semibold text-slate-700 block mb-1">Notas de la visita</label>
                <textarea
                  [(ngModel)]="newProp.notes"
                  rows="3"
                  placeholder="Detalles de la visita, estado de fontanería, portero físico, sensación de ruidos..."
                  class="w-full p-3 border border-slate-200 rounded-xl"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                (click)="showNewModal.set(false)"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="saveNewProperty()"
                class="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Guardar Ficha
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
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
