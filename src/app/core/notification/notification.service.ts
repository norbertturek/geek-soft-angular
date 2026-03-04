import { inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly message = signal<string | null>(null);
  readonly visible = signal(false);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly autoDismissMs = 3000;

  show(text: string): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.message.set(text);
    this.visible.set(true);
    this.timeoutId = setTimeout(() => {
      this.visible.set(false);
      this.message.set(null);
      this.timeoutId = null;
    }, this.autoDismissMs);
  }
}
