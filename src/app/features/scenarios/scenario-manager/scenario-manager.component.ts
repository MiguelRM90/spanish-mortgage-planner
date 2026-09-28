import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScenarioService } from '../../../core/services/scenario.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-scenario-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFormatPipe],
  templateUrl: './scenario-manager.component.html',
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

