import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { tap } from 'rxjs';
import type { OrderSide } from '@core/models/order.model';

const MIN_POSITIVE = 0.00000001;

export interface NewOrderPayload {
  symbol: string;
  side: OrderSide;
  size: number;
  openPrice: number;
  openTime: number;
}

@Component({
  selector: 'app-new-order-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
      class="mb-6 p-4 rounded-lg bg-[var(--color-row-bg)] flex flex-wrap gap-4 items-end"
    >
      <div class="flex flex-col gap-1">
        <label for="symbol" class="text-sm text-[var(--color-text)]">Symbol</label>
        <select
          id="symbol"
          formControlName="symbol"
          class="px-3 py-2 rounded bg-[var(--color-bg-main)] text-[var(--color-text)] border border-[var(--color-text)]/20 min-w-32"
        >
          <option value="">Select symbol</option>
          @for (s of symbols(); track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
        @if (form.get('symbol')?.invalid && form.get('symbol')?.touched) {
          <span class="text-sm text-[var(--color-profit-negative)]">Required</span>
        }
      </div>
      <div class="flex flex-col gap-1">
        <label for="side" class="text-sm text-[var(--color-text)]">Side</label>
        <select
          id="side"
          formControlName="side"
          class="px-3 py-2 rounded bg-[var(--color-bg-main)] text-[var(--color-text)] border border-[var(--color-text)]/20 min-w-24"
        >
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label for="size" class="text-sm text-[var(--color-text)]">Size</label>
        <input
          id="size"
          type="number"
          formControlName="size"
          step="any"
          min="0"
          class="px-3 py-2 rounded bg-[var(--color-bg-main)] text-[var(--color-text)] border border-[var(--color-text)]/20 w-28"
        />
        @if (form.get('size')?.invalid && form.get('size')?.touched) {
          <span class="text-sm text-[var(--color-profit-negative)]">
            {{ form.get('size')?.errors?.['required'] ? 'Required' : 'Must be > 0' }}
          </span>
        }
      </div>
      <div class="flex flex-col gap-1">
        <label for="openPrice" class="text-sm text-[var(--color-text)]">Open Price</label>
        <input
          id="openPrice"
          type="number"
          formControlName="openPrice"
          step="any"
          min="0"
          class="px-3 py-2 rounded bg-[var(--color-bg-main)] text-[var(--color-text)] border border-[var(--color-text)]/20 w-32"
        />
        @if (form.get('openPrice')?.invalid && form.get('openPrice')?.touched) {
          <span class="text-sm text-[var(--color-profit-negative)]">
            {{ form.get('openPrice')?.errors?.['required'] ? 'Required' : 'Must be > 0' }}
          </span>
        }
      </div>
      <button
        type="submit"
        [disabled]="form.invalid || symbols().length === 0"
        class="px-4 py-2 rounded bg-[var(--color-text)] text-[var(--color-bg-main)] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-text)]"
      >
        Add order
      </button>
    </form>
  `,
})
export class NewOrderFormComponent {
  readonly symbols = input.required<string[]>();
  readonly quotes = input<Map<string, number>>(new Map());
  readonly orderAdded = output<NewOrderPayload>();

  readonly form = inject(FormBuilder).group({
    symbol: ['', Validators.required],
    side: ['BUY' as OrderSide, Validators.required],
    size: [null as number | null, [Validators.required, Validators.min(MIN_POSITIVE)]],
    openPrice: [null as number | null, [Validators.required, Validators.min(MIN_POSITIVE)]],
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Prefill openPrice from current quote when symbol or quotes change
    effect(() => {
      const symbol = this.form.get('symbol')?.value ?? '';
      const quotesMap = this.quotes();
      const bid = symbol ? quotesMap.get(symbol) : undefined;
      if (bid != null && typeof bid === 'number') {
        this.form.patchValue({ openPrice: bid }, { emitEvent: false });
      }
    });
    this.form
      .get('symbol')
      ?.valueChanges?.pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((symbol: string | null) => {
          const s = symbol ?? '';
          const bid = s ? this.quotes().get(s) : undefined;
          if (bid != null && typeof bid === 'number') {
            this.form.patchValue({ openPrice: bid }, { emitEvent: false });
          }
        })
      )
      ?.subscribe();
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const payload: NewOrderPayload = {
      symbol: value.symbol ?? '',
      side: value.side ?? 'BUY',
      size: Number(value.size),
      openPrice: Number(value.openPrice),
      openTime: Date.now(), // client-side only; form runs in browser context
    };
    this.orderAdded.emit(payload);
    this.form.reset({ symbol: '', side: 'BUY', size: null, openPrice: null });
  }
}
