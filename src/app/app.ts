import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from '@shared/components/app-header.component';
import { NotificationSnackbarComponent } from '@core/notification/notification-snackbar.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    AppHeaderComponent,
    NotificationSnackbarComponent,
  ],
  templateUrl: './app.html',
  host: {
    class: 'block box-border',
  },
})
export class App {}
