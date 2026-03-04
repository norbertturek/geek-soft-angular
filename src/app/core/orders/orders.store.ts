import { computed, inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { GroupedOrder, Order } from '@core/models/order.model';
import { OrdersApiService } from '@core/orders/orders-api.service';

function groupOrdersBySymbol(orders: Order[]): GroupedOrder[] {
  const bySymbol = new Map<string, Order[]>();
  for (const o of orders) {
    const list = bySymbol.get(o.symbol) ?? [];
    list.push(o);
    bySymbol.set(o.symbol, list);
  }
  return Array.from(bySymbol.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([symbol, symbolOrders]) => {
      const sumSize = symbolOrders.reduce((acc, o) => acc + o.size, 0);
      const sumSwap = symbolOrders.reduce((acc, o) => acc + o.swap, 0);
      const avgOpenPrice =
        symbolOrders.length > 0
          ? symbolOrders.reduce((acc, o) => acc + o.openPrice, 0) /
            symbolOrders.length
          : 0;
      return {
        symbol,
        orders: [...symbolOrders],
        avgOpenPrice,
        sumSize,
        sumSwap,
      };
    });
}

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private readonly api = inject(OrdersApiService);
  private readonly cancelLoad$ = new Subject<void>();

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly groupedOrders = computed<GroupedOrder[]>(() =>
    groupOrdersBySymbol(this.orders())
  );

  readonly uniqueSymbols = computed<string[]>(() => {
    const seen = new Set<string>();
    for (const o of this.orders()) {
      seen.add(o.symbol);
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  });

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

  addOrder(payload: Omit<Order, 'id' | 'swap'>): void {
    const maxId = Math.max(0, ...this.orders().map((o) => o.id));
    const order: Order = {
      ...payload,
      id: maxId + 1,
      swap: 0,
    };
    this.orders.update((list) => [...list, order]);
  }
}
