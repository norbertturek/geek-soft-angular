import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OrdersPage } from '@app/features/orders/orders.page';
import { OrdersStore } from '@core/orders/orders.store';

describe('OrdersPage', () => {
  let loadOrdersCalled: boolean;

  beforeEach(async () => {
    loadOrdersCalled = false;
    const store = {
      orders: signal([]),
      groupedOrders: signal([]),
      orderProfits: signal(new Map<number, number>()),
      uniqueSymbols: signal<string[]>([]),
      loading: signal(false),
      error: signal<string | null>(null),
      loadOrders: () => {
        loadOrdersCalled = true;
      },
      addOrder: () => {},
    };

    await TestBed.configureTestingModule({
      imports: [OrdersPage],
      providers: [{ provide: OrdersStore, useValue: store }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(OrdersPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call loadOrders on init', () => {
    const fixture = TestBed.createComponent(OrdersPage);
    fixture.detectChanges();
    expect(loadOrdersCalled).toBe(true);
  });
});
