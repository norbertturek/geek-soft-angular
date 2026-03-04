import { inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { Order } from '@core/models/order.model';
import { OrdersApiService } from '@core/orders/orders-api.service';

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private readonly api = inject(OrdersApiService);
  private readonly cancelLoad$ = new Subject<void>();

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadOrders(): void {
    this.cancelLoad$.next();
    this.loading.set(true);
    this.error.set(null);

    this.api.fetchOrders().pipe(takeUntil(this.cancelLoad$)).subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Failed to load orders');
        this.loading.set(false);
      },
    });
  }
}
