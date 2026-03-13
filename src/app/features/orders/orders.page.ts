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
import { OrdersTableComponent } from '@app/features/orders/components/orders-table/orders-table.component';
import { AddOrderModalComponent } from '@app/features/orders/components/add-order-modal/add-order-modal.component';
import { ButtonComponent } from '@shared/components/button.component';
import { formatSigned } from '@shared/utils/format.utils';

@Component({
  selector: 'app-orders-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrdersTableComponent, AddOrderModalComponent, ButtonComponent],
  template: `
    <div class="h-screen overflow-hidden flex flex-col p-4 sm:p-6 lg:p-8">
      <div class="max-w-7xl mx-auto flex-1 flex flex-col min-h-0 w-full">
        <header class="shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 class="text-3xl font-bold mb-2 text-text">Orders Table</h1>
            <p class="text-text-muted">Manage your trading orders</p>
          </div>
          <div class="flex items-center gap-4">
            <app-button variant="primary" (clicked)="showModal.set(true)">
              <span aria-hidden="true">+</span>
              Add New Order
            </app-button>
          </div>
        </header>
        @if (store.loading()) {
          <p class="text-text">Loading orders...</p>
        } @else if (store.error()) {
          <p class="text-text" role="alert">{{ store.error() }}</p>
        } @else {
          <div class="flex-1 min-h-0 max-h-[60vh] flex flex-col rounded-xl shadow-sm border border-border bg-row-bg" role="region" aria-label="Orders table">
            <app-orders-table
              [groupedOrders]="store.groupedOrders()"
              [orderProfits]="store.orderProfits()"
            />
          </div>
          @if (store.groupedOrders().length > 0) {
            <div class="shrink-0 mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-text-muted">
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

  protected readonly totalProfitFormatted = computed(() =>
    formatSigned(this.totalProfit(), 2)
  );

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
