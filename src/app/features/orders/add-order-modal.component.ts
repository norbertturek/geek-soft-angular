import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { OrderSide } from '@core/models/order.model';
import { QuotesService } from '@core/orders/quotes.service';

const MIN_POSITIVE = 0.00000001;

export interface AddOrderPayload {
  symbol: string;
  side: OrderSide;
  size: number;
  openPrice: number;
  openTime: number;
}

@Component({
  selector: 'app-add-order-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-order-title"
    >
      <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        (click)="onOverlayClick()"
        aria-hidden="true"
      ></div>
      <div
        #dialogPanel
        class="relative z-10 w-full max-w-lg rounded-xl shadow-2xl p-6 bg-[var(--color-card-bg)] border border-[var(--color-border)]"
        (keydown)="onTrapFocus($event)"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 id="add-order-title" class="text-2xl font-bold text-[var(--color-text)]">
            Add New Order
          </h2>
          <button
            type="button"
            (click)="onClose()"
            class="p-2 rounded-lg hover:bg-[var(--color-row-bg-hover)] text-[var(--color-text)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label for="modal-symbol" class="block text-sm font-medium text-[var(--color-text)] mb-2">
              Symbol <span class="text-[var(--color-profit-negative)]">*</span>
            </label>
            <select
              id="modal-symbol"
              formControlName="symbol"
              [class]="'w-full px-4 py-2.5 rounded-lg bg-[var(--color-input-bg)] text-[var(--color-text)] border ' + (form.get('symbol')?.invalid && form.get('symbol')?.touched ? 'border-[var(--color-profit-negative)]' : 'border-[var(--color-border)]') + ' focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors'"
            >
              <option value="">Select a symbol</option>
              @for (s of uniqueSymbols(); track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
            @if (form.get('symbol')?.invalid && form.get('symbol')?.touched) {
              <p class="text-[var(--color-profit-negative)] text-sm mt-1">Symbol is required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-[var(--color-text)] mb-2">
              Side <span class="text-[var(--color-profit-negative)]">*</span>
            </label>
            <div class="flex gap-3">
              <button
                type="button"
                (click)="form.patchValue({ side: 'BUY' })"
                [class]="'flex-1 py-2.5 rounded-lg font-medium transition-colors ' + (form.get('side')?.value === 'BUY' ? 'bg-[var(--color-profit-positive)] text-white' : 'bg-[var(--color-row-bg)] text-[var(--color-text)] hover:bg-[var(--color-row-bg-hover)]')"
              >
                BUY
              </button>
              <button
                type="button"
                (click)="form.patchValue({ side: 'SELL' })"
                [class]="'flex-1 py-2.5 rounded-lg font-medium transition-colors ' + (form.get('side')?.value === 'SELL' ? 'bg-[var(--color-profit-negative)] text-white' : 'bg-[var(--color-row-bg)] text-[var(--color-text)] hover:bg-[var(--color-row-bg-hover)]')"
              >
                SELL
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="modal-size" class="block text-sm font-medium text-[var(--color-text)] mb-2">
                Size <span class="text-[var(--color-profit-negative)]">*</span>
              </label>
              <input
                id="modal-size"
                type="number"
                formControlName="size"
                step="0.01"
                placeholder="0.00"
                [class]="'w-full px-4 py-2.5 rounded-lg bg-[var(--color-input-bg)] text-[var(--color-text)] border ' + (form.get('size')?.invalid && form.get('size')?.touched ? 'border-[var(--color-profit-negative)]' : 'border-[var(--color-border)]') + ' placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'"
              />
              @if (form.get('size')?.invalid && form.get('size')?.touched) {
                <p class="text-[var(--color-profit-negative)] text-sm mt-1">
                  {{ form.get('size')?.errors?.['required'] ? 'Required' : 'Must be greater than 0' }}
                </p>
              }
            </div>
            <div>
              <label for="modal-openPrice" class="block text-sm font-medium text-[var(--color-text)] mb-2">
                Open Price <span class="text-[var(--color-profit-negative)]">*</span>
              </label>
              <input
                id="modal-openPrice"
                type="number"
                formControlName="openPrice"
                step="0.01"
                placeholder="0.00"
                [class]="'w-full px-4 py-2.5 rounded-lg bg-[var(--color-input-bg)] text-[var(--color-text)] border ' + (form.get('openPrice')?.invalid && form.get('openPrice')?.touched ? 'border-[var(--color-profit-negative)]' : 'border-[var(--color-border)]') + ' placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'"
              />
              @if (form.get('openPrice')?.invalid && form.get('openPrice')?.touched) {
                <p class="text-[var(--color-profit-negative)] text-sm mt-1">
                  {{ form.get('openPrice')?.errors?.['required'] ? 'Required' : 'Must be greater than 0' }}
                </p>
              }
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              (click)="onClose()"
              class="flex-1 px-6 py-2.5 bg-[var(--color-row-bg)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-row-bg-hover)] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="form.invalid || uniqueSymbols().length === 0"
              class="flex-1 px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-primary)]"
            >
              Add Order
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AddOrderModalComponent implements AfterViewInit {
  readonly isOpen = input.required<boolean>();
  readonly symbols = input.required<string[]>();
  readonly closed = output<void>();
  readonly orderAdded = output<AddOrderPayload>();

  private readonly quotesService = inject(QuotesService);
  private readonly dialogPanel = viewChild<ElementRef<HTMLElement>>('dialogPanel');

  protected readonly form = inject(FormBuilder).group({
    symbol: ['', Validators.required],
    side: ['BUY' as OrderSide, Validators.required],
    size: [null as number | null, [Validators.required, Validators.min(MIN_POSITIVE)]],
    openPrice: [null as number | null, [Validators.required, Validators.min(MIN_POSITIVE)]],
  });

  private static readonly BASE_SYMBOLS = ['BTCUSD', 'ETHUSD', 'GBPUSD', 'USDJPY', 'EURUSD', 'GOLD', 'SILVER'];

  protected readonly uniqueSymbols = computed(() => {
    const existing = this.symbols();
    return [...new Set([...existing, ...AddOrderModalComponent.BASE_SYMBOLS])].sort((a, b) => a.localeCompare(b));
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.form
      .get('symbol')
      ?.valueChanges?.pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((symbol: string | null) => {
          const s = symbol ?? '';
          const bid = s ? this.quotesService.quotes().get(s) : undefined;
          if (bid != null && typeof bid === 'number') {
            this.form.patchValue({ openPrice: bid }, { emitEvent: false });
          }
        })
      )
      ?.subscribe();
  }

  ngAfterViewInit(): void {
    const panel = this.dialogPanel()?.nativeElement;
    if (panel) {
      const firstFocusable = panel.querySelector<HTMLElement>(
        'select, input, button, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }

  protected onClose(): void {
    this.form.reset({ symbol: '', side: 'BUY', size: null, openPrice: null });
    this.closed.emit();
  }

  protected onOverlayClick(): void {
    this.onClose();
  }

  protected onEscape(): void {
    if (this.isOpen()) this.onClose();
  }

  protected onTrapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const panel = this.dialogPanel()?.nativeElement;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'select:not([disabled]), input:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.orderAdded.emit({
      symbol: (v.symbol ?? '').toUpperCase(),
      side: v.side ?? 'BUY',
      size: Number(v.size),
      openPrice: Number(v.openPrice),
      openTime: Date.now(),
    });
    this.form.reset({ symbol: '', side: 'BUY', size: null, openPrice: null });
    this.closed.emit();
  }
}
