import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SvgIconName =
  | 'chevron-down'
  | 'chevron-right'
  | 'close'
  | 'close-20'
  | 'theme-sun'
  | 'theme-moon';

@Component({
  selector: 'app-svg-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-block shrink-0 align-middle',
    '[attr.role]': 'iconRole()',
    '[attr.aria-hidden]': 'ariaHidden()',
    '[attr.aria-label]': 'ariaLabel()',
  },
  template: `
    <span
      [class]="'inline-block shrink-0 align-middle bg-[currentColor] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [-webkit-mask-size:contain] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center] ' + (iconClass() || '')"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.mask-image]="'url(' + iconSrc() + ')'"
      [style.-webkit-mask-image]="'url(' + iconSrc() + ')'"
      role="presentation"
      aria-hidden="true"
    ></span>
  `,
})
export class SvgIconComponent {
  readonly name = input.required<SvgIconName>();
  readonly size = input<number>(16);
  readonly iconClass = input<string>('');
  readonly ariaHidden = input<boolean>(true);
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Only expose role="img" when we have an aria-label (non-decorative). */
  protected readonly iconRole = computed(() =>
    this.ariaLabel() ? ('img' as const) : null
  );

  protected readonly iconSrc = computed(() => '/icons/' + this.name() + '.svg');
}