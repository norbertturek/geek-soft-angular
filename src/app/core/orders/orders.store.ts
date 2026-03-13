import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { GroupedOrder, Order } from '@core/models/order.model';
import { APP_CONFIG } from '@core/config/app-config.token';
import { OrdersApiService } from '@core/orders/orders-api.service';
import { InstrumentsService } from '@core/orders/instruments.service';
import { QuotesService } from '@core/quotes/quotes.service';
import { groupOrdersBySymbol, orderProfit } from '@core/utils/order-utils';

const QUOTE_SYNC_DEBOUNCE_MS = 80;

@Injectable({ providedIn: 'root' })
export class OrdersStore {
  private readonly api = inject(OrdersApiService);
  private readonly config = inject(APP_CONFIG);
  private readonly instruments = inject(InstrumentsService);
  private readonly quotesService = inject(QuotesService);
  private readonly cancelLoad$ = new Subject<void>();

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly uniqueSymbols = computed<string[]>(() => {
    const seen = new Set<string>();
    for (const order of this.orders()) {
      seen.add(order.symbol);
    }
    return Array.from(seen).sort((first, second) => first.localeCompare(second));
  });

  readonly groupedOrders = computed<GroupedOrder[]>(() =>
    groupOrdersBySymbol(
      this.orders(),
      this.quotesService.quotes(),
      (symbol) => this.instruments.getContractSize(symbol)
    )
  );

  readonly orderProfits = computed<Map<number, number>>(() => {
    const orders = this.orders();
    const quotesMap = this.quotesService.quotes();
    const getContractSize = (symbol: string) =>
      this.instruments.getContractSize(symbol);
    const profitMap = new Map<number, number>();
    for (const order of orders) {
      const bid = quotesMap.get(order.symbol) ?? 0;
      const contractSize = getContractSize(order.symbol);
      profitMap.set(order.id, orderProfit(order, bid, contractSize));
    }
    return profitMap;
  });

  private prevQuoteSymbols: string[] = [];
  private quoteSyncTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const symbols = this.uniqueSymbols();
      this.quotesService.connect();
      const isConnected = this.quotesService.connected();
      const max = this.config.wsMaxSubscribedSymbols ?? Infinity;
      const capped = max < Infinity ? symbols.slice(0, max) : symbols;

      const performSync = () => {
        const toRemove = this.prevQuoteSymbols.filter((s) => !capped.includes(s));
        const toAdd = capped.filter((s) => !this.prevQuoteSymbols.includes(s));
        if (toRemove.length > 0) this.quotesService.unsubscribe(toRemove);
        if (toAdd.length > 0) this.quotesService.subscribe(toAdd);
        if (isConnected || (toAdd.length === 0 && toRemove.length === 0)) {
          this.prevQuoteSymbols = [...capped];
        }
      };

      this.clearQuoteSyncTimer();
      if (isConnected) {
        this.quoteSyncTimer = setTimeout(() => {
          this.quoteSyncTimer = null;
          performSync();
        }, QUOTE_SYNC_DEBOUNCE_MS);
      } else {
        performSync();
      }
    });
  }

  private clearQuoteSyncTimer(): void {
    if (this.quoteSyncTimer) {
      clearTimeout(this.quoteSyncTimer);
      this.quoteSyncTimer = null;
    }
  }

  loadOrders(): void {
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
        error: (error) => {
          this.error.set(error?.message ?? 'Failed to load orders');
          this.loading.set(false);
        },
      });
  }

  removeOrder(id: number): void {
    this.orders.update((list) => list.filter((order) => order.id !== id));
  }

  removeGroup(symbol: string): void {
    this.orders.update((list) => list.filter((order) => order.symbol !== symbol));
  }

  addOrder(payload: Omit<Order, 'id' | 'swap'>): number {
    const maxId = Math.max(0, ...this.orders().map((order) => order.id));
    const order: Order = {
      ...payload,
      id: maxId + 1,
      swap: 0,
    };
    this.orders.update((list) => [...list, order]);
    return order.id;
  }
}
