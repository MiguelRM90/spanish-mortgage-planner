import { Injectable, signal, effect, Optional } from '@angular/core';
import { PropertyScoutingItem } from '../models/scouting.model';
import { ScenarioService } from './scenario.service';
import { DEFAULT_MORTGAGE_INPUTS } from '../models/mortgage-inputs.model';

const STORAGE_KEY_SCOUTING = 'smp_scouting_v1';

@Injectable({
  providedIn: 'root',
})
export class ScoutingService {
  private readonly scenarioService: ScenarioService;

  public readonly properties = signal<PropertyScoutingItem[]>(this.loadInitialProperties());

  constructor(@Optional() scenarioSvc?: ScenarioService) {
    this.scenarioService = scenarioSvc ?? new ScenarioService();
    effect(() => {
      const items = this.properties();
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(STORAGE_KEY_SCOUTING, JSON.stringify(items));
        }
      } catch (err) {
        console.warn('Unable to persist scouting properties to LocalStorage:', err);
      }
    });
  }

  public addProperty(item: Omit<PropertyScoutingItem, 'id' | 'createdAt'>): PropertyScoutingItem {
    const newItem: PropertyScoutingItem = {
      ...item,
      id: 'scout_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
      createdAt: Date.now(),
    };
    this.properties.update((list) => [newItem, ...list]);
    return newItem;
  }

  public updateProperty(id: string, changes: Partial<PropertyScoutingItem>): void {
    this.properties.update((list) =>
      list.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  }

  public deleteProperty(id: string): void {
    this.properties.update((list) => list.filter((p) => p.id !== id));
  }

  /**
   * Transfers a scouted property into an active simulation scenario in the mortgage calculator.
   */
  public createScenarioFromProperty(property: PropertyScoutingItem): void {
    const activeInputs = this.scenarioService.activeScenario().inputs;
    this.scenarioService.addScenario(property.title, {
      ...DEFAULT_MORTGAGE_INPUTS,
      purchasePrice: property.recommendedOffer || property.askingPrice,
      builtSquareMeters: property.squareMeters,
      availableSavings: activeInputs.availableSavings,
      annualNetIncome: activeInputs.annualNetIncome,
      renovationBudget: Math.round(property.squareMeters * 1100 * 1.14),
    });
  }

  /**
   * Calculates maximum viable purchase price to preserve an emergency cushion
   * (e.g. 20,000 € minimum savings remaining) after 20% down payment, 8% purchase expenses, and renovation.
   */
  public calculateMaxViablePrice(
    availableSavings: number,
    renovationCost: number,
    cushionGoal = 20000
  ): number {
    const usableSavings = Math.max(0, availableSavings - cushionGoal - renovationCost);
    // Down payment (20%) + purchase expenses (~8%) = ~28% of purchase price
    // PurchasePrice * 0.28 = usableSavings  =>  PurchasePrice = usableSavings / 0.28
    const maxPrice = usableSavings / 0.28;
    return Math.max(0, Math.round(maxPrice / 5000) * 5000);
  }

  private loadInitialProperties(): PropertyScoutingItem[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_SCOUTING);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // fallback
    }

    return [
      {
        id: 'seed-guindalera-1',
        title: 'Piso Cartagena 120m² exterior',
        address: 'Calle de Cartagena (cerca de Av. América / Diego de León)',
        askingPrice: 590000,
        squareMeters: 120,
        floor: '4ª Planta con ascensor',
        orientation: 'Sur / Suroeste',
        communityFeeMonthly: 110,
        annualIbi: 750,
        notes: 'Piso muy luminoso, techos altos (2.80m). Estructura de pilares de hormigón: permite tirar todo el tabique central y hacer salón con cocina abierta de 45m².',
        createdAt: Date.now() - 86400000 * 3,
        hasElevator: true,
        elevatorViable: true,
        hasFavorableIte: true,
        hasPendingAssessments: false,
        structuralType: 'pillars',
        hvacSystem: 'central',
        ceilingHeightMeters: 2.80,
        naturalLightRating: 5,
        recommendedOffer: 540000,
      },
      {
        id: 'seed-guindalera-2',
        title: 'Piso Martínez Izquierdo 110m²',
        address: 'Calle de Martínez Izquierdo (zona residencial tranquila)',
        askingPrice: 515000,
        squareMeters: 110,
        floor: '2ª Planta exterior',
        orientation: 'Este',
        communityFeeMonthly: 85,
        annualIbi: 680,
        notes: 'Finca clásica de los 60. Muros de carga en pasillo: hay que consultar con arquitecto para abrir hueco con viga de refuerzo (IPE). Sin ascensor actualmente pero hueco viable en ojo de escalera.',
        createdAt: Date.now() - 86400000 * 7,
        hasElevator: false,
        elevatorViable: true,
        hasFavorableIte: true,
        hasPendingAssessments: true,
        structuralType: 'mixed',
        hvacSystem: 'individual_gas',
        ceilingHeightMeters: 2.65,
        naturalLightRating: 4,
        recommendedOffer: 460000,
      },
    ];
  }
}
