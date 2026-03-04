import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { OrdersStore } from '@core/orders/orders.store';
import { NotificationService } from '@core/notification/notification.service';
import { OrdersTableComponent } from '@app/features/orders/orders-table.component';
import { AddOrderModalComponent } from '@app/features/orders/add-order-modal.component';

@Component({
  selector: 'app-orders-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrdersTableComponent, AddOrderModalComponent],
  template: `
    <div class="min-h-screen p-8">
      <div class="max-w-7xl mx-auto">
        <header class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold mb-2 text-[var(--color-text)]">Orders Table</h1>
            <p class="text-[var(--color-text-muted)]">Manage your trading orders</p>
          </div>
          <div class="flex items-center gap-4">
            <button
              type="button"
              (click)="showModal.set(true)"
              class="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <span aria-hidden="true">+</span>
              Add New Order
            </button>
          </div>
        </header>
        @if (store.loading()) {
          <p class="text-[var(--color-text)]">Loading orders...</p>
        } @else if (store.error()) {
          <p class="text-[var(--color-text)]" role="alert">{{ store.error() }}</p>
        } @else {
          <div class="rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden bg-[var(--color-row-bg)]" role="region" aria-label="Orders table">
            <app-orders-table
              ngSkipHydration
              [groupedOrders]="store.groupedOrders()"
              [orderProfits]="store.orderProfits()"
            />
          </div>
          @if (store.groupedOrders().length > 0) {
            <div class="mt-6 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
              <span>Showing {{ store.groupedOrders().length }} symbol groups with {{ totalOrders() }} total orders</span>
              <span>Total Profit: <strong [style.color]="totalProfitColor()">{{ totalProfitFormatted() }}</strong></span>
            </div>
          }
        }
        @if (showModal()) {
          <app-add-order-modal
            [isOpen]="true"
            [symbols]="store.uniqueSymbols()"
            (closed)="showModal.set(false)"
            (orderAdded)="onOrderAdded($event)"
          />
        }
      </div>
    </div>
  `,
})
export class OrdersPage implements OnInit {
  protected readonly showModal = signal(false);
  protected readonly store = inject(OrdersStore);
  private readonly notification = inject(NotificationService);

  protected readonly totalOrders = computed(() =>
    this.store.groupedOrders().reduce((acc, g) => acc + g.orders.length, 0)
  );

  protected readonly totalProfit = computed(() =>
    this.store.groupedOrders().reduce((acc, g) => acc + g.sumProfit, 0)
  );

  protected readonly totalProfitColor = computed(() =>
    this.totalProfit() >= 0 ? 'var(--color-profit-positive)' : 'var(--color-profit-negative)'
  );

  protected readonly totalProfitFormatted = computed(() => {
    const p = this.totalProfit();
    const f = Math.abs(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (p >= 0 ? '+' : '-') + f;
  });

  ngOnInit(): void {
    this.store.loadOrders();
  }

  protected onOrderAdded(payload: {
    symbol: string;
    side: 'BUY' | 'SELL';
    size: number;
    openPrice: number;
    openTime: number;
  }): void {
    const id = this.store.addOrder(payload);
    this.notification.show(`Order #${id} added successfully`);
  }
}
