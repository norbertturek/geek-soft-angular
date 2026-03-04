import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { OrdersStore } from '@core/orders/orders.store';
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
      <app-orders-table [groupedOrders]="store.groupedOrders()" />
    }
  `,
})
export class OrdersPage implements OnInit {
  protected readonly store = inject(OrdersStore);

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
    this.store.addOrder(payload);
  }
}
