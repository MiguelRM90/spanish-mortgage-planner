import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaHeaderComponent } from 'pwa-ui-core/components';
import { PwaService } from 'pwa-ui-core/services';
import { ScenarioService } from '../../../core/services/scenario.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, PwaHeaderComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  public readonly pwaService = inject(PwaService);
  public readonly scenarioService = inject(ScenarioService);

  public installApp(): void {
    this.pwaService.promptInstall();
  }
}
