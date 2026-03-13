import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '@core/theme/theme.service';
import { SvgIconComponent } from '@shared/components/svg-icon.component';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex',
  },
  imports: [SvgIconComponent],
  template: `
    <button
      type="button"
      (click)="theme.toggle()"
      [attr.aria-label]="
        theme.effective() === 'dark'
          ? 'Switch to light theme'
          : 'Switch to dark theme'
      "
      class="flex items-center px-3 py-1.5 rounded-full border-0 bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] text-text hover:bg-[color-mix(in_srgb,var(--color-text)_15%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text transition-colors duration-300"
    >
      @if (theme.effective() === 'dark') {
        <app-svg-icon name="theme-sun" [size]="18" />
      } @else {
        <app-svg-icon name="theme-moon" [size]="18" />
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
}
