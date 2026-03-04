import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from '@core/theme/theme-toggle.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ThemeToggleComponent],
  templateUrl: './app.html',
  host: {
    class: 'block font-sans antialiased box-border',
  },
})
export class App {
  protected readonly title = signal('geek-soft-angular');
}
