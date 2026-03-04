import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { OrdersStore } from '@core/orders/orders.store';

@Component({
  selector: 'app-orders-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Zlecenia</h1>
    @if (store.loading()) {
      <p>Ładowanie zleceń...</p>
    } @else if (store.error()) {
      <p role="alert">{{ store.error() }}</p>
    } @else {
      <p>Wczytano {{ store.orders().length }} zleceń</p>
    }
  `,
})
export class OrdersPage implements OnInit {
  protected readonly store = inject(OrdersStore);

  ngOnInit(): void {
    this.store.loadOrders();
  }
}
