import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaHeaderComponent } from 'pwa-ui-core/components';
import { PwaService } from 'pwa-ui-core/services';
import { ScenarioService } from '../../../core/services/scenario.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, PwaHeaderComponent],
  template: `
    <pwa-header
      title="Simulador Hipoteca y Reforma"
      subtitle="Compra de vivienda, hipoteca francesa, gastos Comunidad de Madrid y reformas"
      badgeText="PWA Offline"
      installButtonText="Instalar App"
      updateMessage="Hay una nueva versión disponible con mejoras de cálculo y rendimiento."
      updateButtonText="Actualizar ahora"
    >
      <div
        header-logo
        style="width: 2.5rem; height: 2.5rem; border-radius: var(--pwa-radius-md); background: linear-gradient(135deg, #4f46e5, #10b981); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #ffffff; box-shadow: var(--pwa-shadow-sm);"
      >
        🏠
      </div>
    </pwa-header>
  `,
})
export class HeaderComponent {
  public readonly pwaService = inject(PwaService);
  public readonly scenarioService = inject(ScenarioService);

  public installApp(): void {
    this.pwaService.promptInstall();
  }
}
