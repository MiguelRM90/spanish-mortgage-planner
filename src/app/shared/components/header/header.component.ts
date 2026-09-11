import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaUpdateService } from '../../../core/services/pwa-update.service';
import { ScenarioService } from '../../../core/services/scenario.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <!-- Update Banner if SW has new version -->
      @if (pwaService.updateAvailable()) {
        <div class="bg-indigo-600 px-4 py-2 text-center text-xs font-medium flex items-center justify-center gap-2">
          <span>Hay una nueva versión disponible con mejoras de cálculo y rendimiento.</span>
          <button
            (click)="pwaService.applyUpdate()"
            class="px-2.5 py-1 bg-white text-indigo-700 font-semibold rounded-md shadow-xs hover:bg-slate-100 transition-colors"
          >
            Actualizar ahora
          </button>
        </div>
      }

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl">
            🏠
          </div>
          <div>
            <h1 class="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Simulador Hipoteca y Reforma</span>
              <span class="hidden md:inline-block text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PWA Offline
              </span>
            </h1>
            <p class="text-xs text-slate-400 hidden sm:block">
              Compra de vivienda, hipoteca francesa, gastos Comunidad de Madrid y reformas
            </p>
          </div>
        </div>

        <!-- Actions & Status Badges -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Offline / Online Indicator -->
          <div
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
            [ngClass]="pwaService.isOnline() ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-amber-950/60 border-amber-800 text-amber-300'"
          >
            <span
              class="w-2 h-2 rounded-full animate-pulse"
              [ngClass]="pwaService.isOnline() ? 'bg-emerald-400' : 'bg-amber-400'"
            ></span>
            <span class="text-[11px] font-semibold">{{ pwaService.isOnline() ? 'Online' : 'Offline' }}</span>
          </div>

          <!-- PWA Install Button -->
          @if (pwaService.isInstallable()) {
            <button
              (click)="installApp()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
              title="Instalar en tu pantalla de inicio"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span class="hidden sm:inline">Instalar App</span>
            </button>
          }
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  public readonly pwaService = inject(PwaUpdateService);
  public readonly scenarioService = inject(ScenarioService);

  public installApp(): void {
    this.pwaService.promptInstall();
  }
}

