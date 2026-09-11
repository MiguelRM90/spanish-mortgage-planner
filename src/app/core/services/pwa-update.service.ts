import { Injectable, signal, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PwaUpdateService {
  private readonly swUpdate = inject(SwUpdate, { optional: true });

  public readonly isOnline = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  public readonly updateAvailable = signal<boolean>(false);
  public readonly isInstallable = signal<boolean>(false);

  private deferredPrompt: any = null;

  constructor() {
    this.setupNetworkListeners();
    this.setupServiceWorkerUpdates();
    this.setupInstallPromptListener();
  }

  public promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return Promise.resolve(false);
    }

    this.deferredPrompt.prompt();
    return this.deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      const accepted = choiceResult.outcome === 'accepted';
      this.deferredPrompt = null;
      this.isInstallable.set(false);
      return accepted;
    });
  }

  public applyUpdate(): void {
    if (this.swUpdate) {
      this.swUpdate.activateUpdate().then(() => {
        document.location.reload();
      });
    } else {
      document.location.reload();
    }
  }

  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.isOnline.set(true));
      window.addEventListener('offline', () => this.isOnline.set(false));
    }
  }

  private setupServiceWorkerUpdates(): void {
    if (this.swUpdate && this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.updateAvailable.set(true);
        });
    }
  }

  private setupInstallPromptListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.isInstallable.set(true);
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.isInstallable.set(false);
      });
    }
  }
}

