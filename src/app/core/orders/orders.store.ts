import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { forkJoin, map, switchMap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { GroupedOrder, Order, OrderSide } from '@core/models/order.model';
import { OrdersApiService } from '@core/orders/orders-api.service';
import { InstrumentsService } from '@core/orders/instruments.service';
import { QuotesService } from '@core/orders/quotes.service';

function sideMultiplier(side: OrderSide): number {
  return side === 'BUY' ? 1 : -1;
}

function orderProfit(
  order: Order,
  bid: number,
  contractSize: number
): number {
  return (
    (bid - order.openPrice) *
    order.size *
    contractSize *
    sideMultiplier(order.side)
  );
}

function groupOrdersBySymbol(
  orders: Order[],
  quotes: Map<string, number>,
  getContractSize: (s: string) => number
): GroupedOrder[] {
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
      const bid = quotes.get(symbol) ?? 0;
      const contractSize = getContractSize(symbol);
      const sumProfit = symbolOrders.reduce(
        (acc, o) => acc + orderProfit(o, bid, contractSize),
        0
      );
      return {
        symbol,
        orders: [...symbolOrders],
        avgOpenPrice,
        sumSize,
        sumSwap,
        sumProfit,
      };
    });
}

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private readonly api = inject(OrdersApiService);
  private readonly instruments = inject(InstrumentsService);
  private readonly quotesService = inject(QuotesService);
  private readonly cancelLoad$ = new Subject<void>();

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly uniqueSymbols = computed<string[]>(() => {
    const seen = new Set<string>();
    for (const o of this.orders()) {
      seen.add(o.symbol);
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  });

  readonly groupedOrders = computed<GroupedOrder[]>(() =>
    groupOrdersBySymbol(
      this.orders(),
      this.quotesService.quotes(),
      (s) => this.instruments.getContractSize(s)
    )
  );

  readonly orderProfits = computed<Map<number, number>>(() => {
    const orders = this.orders();
    const quotesMap = this.quotesService.quotes();
    const getContractSize = (s: string) =>
      this.instruments.getContractSize(s);
    const map = new Map<number, number>();
    for (const o of orders) {
      const bid = quotesMap.get(o.symbol) ?? 0;
      const contractSize = getContractSize(o.symbol);
      map.set(o.id, orderProfit(o, bid, contractSize));
    }
    return map;
  });

  private prevQuoteSymbols: string[] = [];

  constructor() {
    effect(() => {
      const symbols = this.uniqueSymbols();
      this.quotesService.connect();
      const toRemove = this.prevQuoteSymbols.filter(
        (s) => !symbols.includes(s)
      );
      const toAdd = symbols.filter(
        (s) => !this.prevQuoteSymbols.includes(s)
      );
      if (toRemove.length > 0) this.quotesService.unsubscribe(toRemove);
      if (toAdd.length > 0) this.quotesService.subscribe(toAdd);
      this.prevQuoteSymbols = [...symbols];
    });
  }

  loadAll(): void {
    this.cancelLoad$.next();
    this.loading.set(true);
    this.error.set(null);

    this.instruments
      .loadContractSizes()
      .pipe(
        switchMap(() => this.api.fetchOrders()),
        takeUntil(this.cancelLoad$)
      )
      .subscribe({
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

  loadOrders(): void {
    this.loadAll();
  }

  removeOrder(id: number): void {
    this.orders.update((list) => list.filter((o) => o.id !== id));
  }

  removeGroup(symbol: string): void {
    this.orders.update((list) => list.filter((o) => o.symbol !== symbol));
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
