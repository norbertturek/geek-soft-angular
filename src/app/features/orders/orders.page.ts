import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { OrdersStore } from '@core/orders/orders.store';
import { OrdersTableComponent } from '@app/features/orders/orders-table.component';

@Component({
  selector: 'app-orders-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrdersTableComponent],
  template: `
    <h1>Zlecenia</h1>
    @if (store.loading()) {
      <p>Ładowanie zleceń...</p>
    } @else if (store.error()) {
      <p role="alert">{{ store.error() }}</p>
    } @else {
      <app-orders-table [orders]="store.orders()" />
    }
  `,
})
export class OrdersPage implements OnInit {
  protected readonly store = inject(OrdersStore);

  ngOnInit(): void {
    this.store.loadOrders();
  }
}
