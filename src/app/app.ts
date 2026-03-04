import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from '@core/theme/theme-toggle.component';
import { NotificationSnackbarComponent } from '@core/notification/notification-snackbar.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ThemeToggleComponent,
    NotificationSnackbarComponent,
  ],
  templateUrl: './app.html',
  host: {
    class: 'block font-sans antialiased box-border',
  },
})
export class App {}
