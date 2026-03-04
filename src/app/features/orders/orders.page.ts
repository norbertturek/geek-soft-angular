import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { OrdersStore } from '@core/orders/orders.store';
import { QuotesService } from '@core/orders/quotes.service';
import { NotificationService } from '@core/notification/notification.service';
import { OrdersTableComponent } from '@app/features/orders/orders-table.component';
import { NewOrderFormComponent } from '@app/features/orders/new-order-form.component';

@Component({
  selector: 'app-orders-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrdersTableComponent, NewOrderFormComponent],
  template: `
    <h1 class="text-[var(--color-text)]">Orders</h1>
    @if (store.loading()) {
      <p class="text-[var(--color-text)]">Loading orders...</p>
    } @else if (store.error()) {
      <p class="text-[var(--color-text)]" role="alert">{{ store.error() }}</p>
    } @else {
      <app-new-order-form
        [symbols]="store.uniqueSymbols()"
        (orderAdded)="onOrderAdded($event)"
      />
      <div class="overflow-x-auto" role="region" aria-label="Orders table">
        <app-orders-table
          ngSkipHydration
          [groupedOrders]="store.groupedOrders()"
          [orderProfits]="store.orderProfits()"
          [store]="store"
          [notification]="notification"
        />
      </div>
    }
  `,
})
export class OrdersPage implements OnInit {
  protected readonly store = inject(OrdersStore);
  protected readonly notification = inject(NotificationService);
  private readonly quotes = inject(QuotesService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.store.loadOrders();
  }

  constructor() {
    this.destroyRef.onDestroy(() => this.quotes.disconnect());
  }

  protected onOrderAdded(payload: {
    symbol: string;
    side: 'BUY' | 'SELL';
    size: number;
    openPrice: number;
    openTime: number;
  }): void {
    this.store.addOrder(payload);
  }
}
