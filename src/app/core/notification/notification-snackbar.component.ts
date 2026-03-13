import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '@core/notification/notification.service';

@Component({
  selector: 'app-notification-snackbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (notification.visible()) {
      <div
        role="status"
        aria-live="polite"
        class="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg bg-text text-bg-main shadow-lg z-50 max-w-md"
      >
        {{ notification.message() }}
      </div>
    }
  `,
})
export class NotificationSnackbarComponent {
  protected readonly notification = inject(NotificationService);
}
