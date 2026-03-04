import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { OrdersStore } from '@core/orders/orders.store';
import { NotificationService } from '@core/notification/notification.service';
import { OrdersTableComponent } from '@app/features/orders/orders-table.component';

@Component({
  selector: 'app-orders-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrdersTableComponent],
  template: `
    <h1 class="text-[var(--color-text)]">Orders</h1>
    @if (store.loading()) {
      <p class="text-[var(--color-text)]">Loading orders...</p>
    } @else if (store.error()) {
      <p class="text-[var(--color-text)]" role="alert">{{ store.error() }}</p>
    } @else {
      <app-orders-table
        [groupedOrders]="store.groupedOrders()"
        [store]="store"
        [notification]="notification"
      />
    }
  `,
})
export class OrdersPage implements OnInit {
  protected readonly store = inject(OrdersStore);
  protected readonly notification = inject(NotificationService);

  ngOnInit(): void {
    this.store.loadOrders();
  }
}
