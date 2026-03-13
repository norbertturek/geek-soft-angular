import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary hover:bg-primary-hover text-white focus:ring-primary disabled:hover:bg-primary',
  secondary:
    'bg-row-bg text-text hover:bg-row-bg-hover focus:ring-text',
  ghost:
    'bg-transparent text-text hover:bg-row-bg-hover focus:ring-text',
  danger:
    'bg-profit-negative hover:opacity-90 text-white focus:ring-profit-negative',
  success:
    'bg-profit-positive hover:opacity-90 text-white focus:ring-profit-positive',
};

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed',
  },
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="buttonClass()"
      [attr.aria-label]="ariaLabel()"
      (click)="clicked.emit()"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit'>('button');
  readonly variant = input<ButtonVariant>('primary');
  readonly disabled = input(false);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly clicked = output<void>();

  protected readonly buttonClass = () => {
    const base = 'rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:hover:bg-inherit w-full';
    const sizeClass =
      this.size() === 'sm'
        ? 'px-3 py-1.5 text-sm'
        : this.size() === 'lg'
          ? 'px-6 py-3 text-base'
          : 'px-6 py-2.5 text-sm';
    return `${base} ${sizeClass} ${VARIANT_CLASSES[this.variant()]}`;
  };
}
