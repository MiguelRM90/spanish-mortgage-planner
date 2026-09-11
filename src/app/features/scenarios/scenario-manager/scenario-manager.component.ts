import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-scenario-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFormatPipe],
  template: `
    <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Scenarios Tabs / Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          @for (item of scenariosWithResults(); track item.id) {
            <button
              type="button"
              (click)="scenarioService.selectScenario(item.id)"
              class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0"
              [ngClass]="item.id === activeId() ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'"
            >
              <span>{{ item.name }}</span>
              <span
                class="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                [ngClass]="item.id === activeId() ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'"
              >
                {{ item.results?.monthlyPayment | currencyFormat }}
              </span>
            </button>
          }

          <!-- New Scenario Button -->
          <button
            type="button"
            (click)="addNewScenario()"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/60 transition-colors whitespace-nowrap shrink-0"
            title="Crear un nuevo escenario de compra"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Añadir Piso</span>
          </button>
        </div>

        <!-- Scenario Actions (Rename, Duplicate, Delete) -->
        <div class="flex items-center gap-1.5 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
          <!-- Rename Modal / Inline input -->
          @if (isRenaming()) {
            <div class="flex items-center gap-1">
              <input
                type="text"
                [(ngModel)]="renameInput"
                (keydown.enter)="saveRename()"
                class="h-8 px-2 text-xs font-medium border border-indigo-400 rounded-lg focus:outline-hidden"
                placeholder="Nombre del piso..."
              />
              <button
                (click)="saveRename()"
                class="px-2 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"
              >
                ✓
              </button>
              <button
                (click)="isRenaming.set(false)"
                class="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                ✕
              </button>
            </div>
          } @else {
            <button
              (click)="startRename()"
              class="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Renombrar escenario activo"
            >
              ✏️ Renombrar
            </button>
          }

          <button
            (click)="duplicateCurrent()"
            class="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Duplicar escenario activo"
          >
            📋 Duplicar
          </button>

          @if (scenariosWithResults().length > 1) {
            <button
              (click)="deleteCurrent()"
              class="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              title="Eliminar este escenario"
            >
              🗑️
            </button>
          }

          <!-- More options dropdown trigger / modal -->
          <button
            (click)="toggleBackupMenu()"
            class="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors relative"
            title="Copias de seguridad y opciones"
          >
            ⚙️
          </button>
        </div>
      </div>

      <!-- Backup options bar -->
      @if (showBackupMenu()) {
        <div class="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <button
            (click)="exportData()"
            class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
          >
            📥 Exportar escenarios (JSON)
          </button>
          <label class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer">
            📤 Importar escenarios (JSON)
            <input type="file" accept=".json" (change)="onFileImport($event)" class="hidden" />
          </label>
          <button
            (click)="resetAll()"
            class="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg ml-auto"
          >
            🔄 Restablecer a valores iniciales
          </button>
        </div>
      }
    </div>
  `,
})
export class ScenarioManagerComponent {
  public readonly scenarioService = inject(ScenarioService);

  public readonly scenariosWithResults = this.scenarioService.scenariosWithResults;
  public readonly activeId = this.scenarioService.activeScenarioId;
  public readonly activeScenario = this.scenarioService.activeScenario;

  public readonly isRenaming = signal<boolean>(false);
  public readonly showBackupMenu = signal<boolean>(false);
  public renameInput = '';

  public addNewScenario(): void {
    this.scenarioService.addScenario();
  }

  public duplicateCurrent(): void {
    this.scenarioService.duplicateScenario(this.activeId());
  }

  public startRename(): void {
    this.renameInput = this.activeScenario().name;
    this.isRenaming.set(true);
  }

  public saveRename(): void {
    if (this.renameInput.trim()) {
      this.scenarioService.renameScenario(this.activeId(), this.renameInput.trim());
    }
    this.isRenaming.set(false);
  }

  public deleteCurrent(): void {
    if (confirm(`¿Estás seguro de eliminar el escenario "${this.activeScenario().name}"?`)) {
      this.scenarioService.deleteScenario(this.activeId());
    }
  }

  public toggleBackupMenu(): void {
    this.showBackupMenu.update((v) => !v);
  }

  public exportData(): void {
    const jsonStr = this.scenarioService.exportScenariosJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hipotecas-escenarios-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public onFileImport(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          const success = this.scenarioService.importScenariosJson(text);
          if (success) {
            alert('Escenarios importados con éxito.');
          } else {
            alert('El archivo seleccionado no tiene un formato válido.');
          }
        }
      };
      reader.readAsText(file);
    }
  }

  public resetAll(): void {
    if (confirm('¿Deseas restaurar los dos escenarios predeterminados (Piso A y Piso B)? Se perderán los cambios actuales.')) {
      this.scenarioService.resetAllToDefaults();
    }
  }
}

