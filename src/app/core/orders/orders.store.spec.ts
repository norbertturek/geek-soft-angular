import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Order } from '@core/models/order.model';
import { OrdersApiService } from '@core/orders/orders-api.service';
import { InstrumentsService } from '@core/orders/instruments.service';
import { QuotesService } from '@core/orders/quotes.service';
import { OrdersStore } from '@core/orders/orders.store';

const mockInstruments = {
  loadContractSizes: () => of(new Map([['BTCUSD', 1], ['EURUSD', 100000]])),
  getContractSize: (s: string) => (s === 'EURUSD' ? 100000 : 1),
} as unknown as InstrumentsService;

const mockQuotes = {
  connect: () => {},
  subscribe: () => {},
  unsubscribe: () => {},
  quotes: () => new Map<string, number>([['BTCUSD', 105], ['EURUSD', 1.06]]),
} as unknown as QuotesService;

describe('OrdersStore', () => {
  let store: OrdersStore;

  const mockOrders: Order[] = [
    {
      id: 1,
      symbol: 'BTCUSD',
      side: 'BUY',
      size: 0.05,
      openPrice: 100,
      openTime: 1750740422000,
      swap: -0.001,
    },
    {
      id: 2,
      symbol: 'BTCUSD',
      side: 'SELL',
      size: 0.03,
      openPrice: 200,
      openTime: 1750740423000,
      swap: 0.002,
    },
    {
      id: 3,
      symbol: 'EURUSD',
      side: 'BUY',
      size: 1,
      openPrice: 1.05,
      openTime: 1750740424000,
      swap: 0,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrdersStore,
        {
          provide: OrdersApiService,
          useValue: { fetchOrders: () => of(mockOrders) },
        },
        { provide: InstrumentsService, useValue: mockInstruments },
        { provide: QuotesService, useValue: mockQuotes },
      ],
    });
    store = TestBed.inject(OrdersStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should have initial empty orders', () => {
    expect(store.orders()).toEqual([]);
  });

  it('should update orders when loadOrders succeeds', () => {
    store.loadOrders();

    expect(store.orders()).toEqual(mockOrders);
  });

  it('should set loading to false after successful load', () => {
    store.loadOrders();

    expect(store.loading()).toBe(false);
    expect(store.error()).toBe(null);
  });

  it('should compute groupedOrders by symbol', () => {
    store.loadOrders();
    const grouped = store.groupedOrders();

    expect(grouped).toHaveLength(2);

    const btc = grouped.find((g) => g.symbol === 'BTCUSD');
    expect(btc).toBeDefined();
    expect(btc!.orders).toHaveLength(2);
    expect(btc!.avgOpenPrice).toBe(150); // (100 + 200) / 2
    expect(btc!.sumSize).toBeCloseTo(0.08); // 0.05 + 0.03
    expect(btc!.sumSwap).toBeCloseTo(0.001); // -0.001 + 0.002
    expect(btc!.sumProfit).toBeDefined();

    const eur = grouped.find((g) => g.symbol === 'EURUSD');
    expect(eur).toBeDefined();
    expect(eur!.orders).toHaveLength(1);
    expect(eur!.avgOpenPrice).toBe(1.05);
    expect(eur!.sumSize).toBe(1);
    expect(eur!.sumSwap).toBe(0);
    expect(eur!.sumProfit).toBeDefined();
  });

  it('should return empty groupedOrders when orders is empty', () => {
    expect(store.groupedOrders()).toEqual([]);
  });

  it('should set error when loadOrders fails', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        OrdersStore,
        {
          provide: OrdersApiService,
          useValue: {
            fetchOrders: () =>
              throwError(() => new Error('Network error')),
          },
        },
        { provide: InstrumentsService, useValue: mockInstruments },
        { provide: QuotesService, useValue: mockQuotes },
      ],
    });
    store = TestBed.inject(OrdersStore);

    store.loadOrders();

    expect(store.error()).toBe('Network error');
    expect(store.orders()).toEqual([]);
  });
});
