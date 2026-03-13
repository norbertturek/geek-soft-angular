import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeToggleComponent } from '@core/theme/theme-toggle.component';

@Component({
  selector: 'app-app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, ThemeToggleComponent],
  template: `
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-20 focus:px-4 focus:py-2 focus:bg-bg-main focus:text-text focus:underline focus:outline-none focus:ring-2 focus:ring-text"
    >
      Skip to main content
    </a>
    <header
      class="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-bg-main border-b border-border"
    >
      <nav class="flex gap-4" aria-label="Main navigation">
        <a
          routerLink="/"
          routerLinkActive="font-semibold"
          [routerLinkActiveOptions]="{ exact: true }"
          class="text-text no-underline hover:underline"
        >
          Home
        </a>
        <a
          routerLink="/orders"
          routerLinkActive="font-semibold"
          class="text-text no-underline hover:underline"
        >
          Orders
        </a>
      </nav>
      <app-theme-toggle />
    </header>
  `,
})
export class AppHeaderComponent {}
