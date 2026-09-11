import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { MortgageInputs, DEFAULT_MORTGAGE_INPUTS } from '../models/mortgage-inputs.model';
import { Scenario } from '../models/scenario.model';
import { MortgageCalculatorService } from './mortgage-calculator.service';

const STORAGE_KEY_SCENARIOS = 'smp_scenarios_v1';
const STORAGE_KEY_ACTIVE_ID = 'smp_active_id_v1';

@Injectable({
  providedIn: 'root',
})
export class ScenarioService {
  private readonly calculator = inject(MortgageCalculatorService);

  public readonly scenarios = signal<Scenario[]>(this.loadInitialScenarios());
  public readonly activeScenarioId = signal<string>(this.loadInitialActiveId());

  public readonly activeScenario = computed<Scenario>(() => {
    const list = this.scenarios();
    const activeId = this.activeScenarioId();
    const found = list.find((s) => s.id === activeId);
    return found || list[0] || this.createDefaultScenario('Piso A');
  });

  public readonly activeResults = computed(() => {
    return this.calculator.calculate(this.activeScenario().inputs);
  });

  public readonly amortizationSchedule = computed(() => {
    return this.calculator.generateAmortizationSchedule(this.activeScenario().inputs);
  });

  public readonly yearlyAmortization = computed(() => {
    return this.calculator.generateYearlySummary(this.amortizationSchedule());
  });

  public readonly scenariosWithResults = computed(() => {
    return this.scenarios().map((s) => ({
      ...s,
      results: this.calculator.calculate(s.inputs),
    }));
  });

  constructor() {
    // Automatically persist to LocalStorage on changes
    effect(() => {
      const list = this.scenarios();
      const activeId = this.activeScenarioId();
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(STORAGE_KEY_SCENARIOS, JSON.stringify(list));
          localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeId);
        }
      } catch (err) {
        console.warn('Unable to persist scenarios to LocalStorage:', err);
      }
    });
  }

  public updateActiveInputs(changes: Partial<MortgageInputs>): void {
    const activeId = this.activeScenarioId();
    this.scenarios.update((list) =>
      list.map((scenario) => {
        if (scenario.id === activeId) {
          return {
            ...scenario,
            updatedAt: Date.now(),
            inputs: {
              ...scenario.inputs,
              ...changes,
            },
          };
        }
        return scenario;
      })
    );
  }

  public selectScenario(id: string): void {
    if (this.scenarios().some((s) => s.id === id)) {
      this.activeScenarioId.set(id);
    }
  }

  public addScenario(name?: string, initialInputs?: MortgageInputs): Scenario {
    const newName = name?.trim() || `Piso ${String.fromCharCode(65 + this.scenarios().length)}`;
    const newScenario: Scenario = {
      id: this.generateId(),
      name: newName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      inputs: initialInputs ? { ...initialInputs } : { ...this.activeScenario().inputs },
    };

    this.scenarios.update((list) => [...list, newScenario]);
    this.activeScenarioId.set(newScenario.id);
    return newScenario;
  }

  public duplicateScenario(id: string): Scenario | null {
    const target = this.scenarios().find((s) => s.id === id);
    if (!target) return null;

    const cloned: Scenario = {
      id: this.generateId(),
      name: `${target.name} (Copia)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      inputs: { ...target.inputs },
    };

    this.scenarios.update((list) => [...list, cloned]);
    this.activeScenarioId.set(cloned.id);
    return cloned;
  }

  public renameScenario(id: string, newName: string): void {
    const cleanName = newName.trim();
    if (!cleanName) return;

    this.scenarios.update((list) =>
      list.map((s) => (s.id === id ? { ...s, name: cleanName, updatedAt: Date.now() } : s))
    );
  }

  public deleteScenario(id: string): void {
    const currentList = this.scenarios();
    if (currentList.length <= 1) {
      // Always maintain at least one scenario
      return;
    }

    const filtered = currentList.filter((s) => s.id !== id);
    this.scenarios.set(filtered);

    if (this.activeScenarioId() === id) {
      this.activeScenarioId.set(filtered[0].id);
    }
  }

  public resetAllToDefaults(): void {
    const defaultScenarios = this.getDefaultSeedScenarios();
    this.scenarios.set(defaultScenarios);
    this.activeScenarioId.set(defaultScenarios[0].id);
  }

  public exportScenariosJson(): string {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        scenarios: this.scenarios(),
      },
      null,
      2
    );
  }

  public importScenariosJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.scenarios) && parsed.scenarios.length > 0) {
        const validatedScenarios: Scenario[] = parsed.scenarios.map((item: any, index: number) => ({
          id: item.id || this.generateId(),
          name: item.name || `Piso importado ${index + 1}`,
          createdAt: item.createdAt || Date.now(),
          updatedAt: Date.now(),
          inputs: {
            ...DEFAULT_MORTGAGE_INPUTS,
            ...item.inputs,
          },
        }));

        this.scenarios.set(validatedScenarios);
        this.activeScenarioId.set(validatedScenarios[0].id);
        return true;
      }
    } catch (e) {
      console.error('Failed to import scenarios JSON:', e);
    }
    return false;
  }

  private loadInitialScenarios(): Scenario[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_SCENARIOS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Failed reading scenarios from LocalStorage, loading defaults:', e);
    }
    return this.getDefaultSeedScenarios();
  }

  private loadInitialActiveId(): string {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
        if (storedId) {
          return storedId;
        }
      }
    } catch {
      // fallback
    }
    return 'scenario-seed-1';
  }

  private getDefaultSeedScenarios(): Scenario[] {
    const scenarioA: Scenario = {
      id: 'scenario-seed-1',
      name: 'Piso A (750k - Base)',
      notes: 'Escenario base de 750k con reforma de 150k en Madrid',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      inputs: { ...DEFAULT_MORTGAGE_INPUTS },
    };

    const scenarioB: Scenario = {
      id: 'scenario-seed-2',
      name: 'Piso B (680k - Menor reforma)',
      notes: 'Piso de 680k con reforma menor (40k)',
      createdAt: Date.now() + 1,
      updatedAt: Date.now() + 1,
      inputs: {
        ...DEFAULT_MORTGAGE_INPUTS,
        purchasePrice: 680000,
        renovationBudget: 40000,
      },
    };

    return [scenarioA, scenarioB];
  }

  private createDefaultScenario(name: string): Scenario {
    return {
      id: this.generateId(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      inputs: { ...DEFAULT_MORTGAGE_INPUTS },
    };
  }

  private generateId(): string {
    return 'sc_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
  }
}

