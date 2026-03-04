import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Order } from '@core/models/order.model';
import { OrdersApiService } from '@core/orders/orders-api.service';
import { OrdersStore } from '@core/orders/orders.store';

describe('OrdersStore', () => {
  let store: OrdersStore;

  const mockOrders: Order[] = [
    {
      id: 1203384,
      symbol: 'BTCUSD',
      side: 'BUY',
      size: 0.05,
      openPrice: 104837.47,
      openTime: 1750740422000,
      swap: -0.00147939,
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
      ],
    });
    store = TestBed.inject(OrdersStore);

    store.loadOrders();

    expect(store.error()).toBe('Network error');
    expect(store.orders()).toEqual([]);
  });
});
