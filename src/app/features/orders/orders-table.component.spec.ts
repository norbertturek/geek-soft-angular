import { TestBed } from '@angular/core/testing';
import { OrdersTableComponent } from '@app/features/orders/orders-table.component';
import type { Order } from '@core/models/order.model';

describe('OrdersTableComponent', () => {
  const mockOrders: Order[] = [
    {
      id: 1,
      symbol: 'BTCUSD',
      side: 'BUY',
      size: 0.05,
      openPrice: 104837.47,
      openTime: 1750740422000,
      swap: -0.00147939,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersTableComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(OrdersTableComponent);
    fixture.componentRef.setInput('orders', mockOrders);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render table with order data', () => {
    const fixture = TestBed.createComponent(OrdersTableComponent);
    fixture.componentRef.setInput('orders', mockOrders);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('BTCUSD');
    expect(el.textContent).toContain('BUY');
    expect(el.querySelector('tbody tr')).toBeTruthy();
  });

  it('should show empty state when orders is empty', () => {
    const fixture = TestBed.createComponent(OrdersTableComponent);
    fixture.componentRef.setInput('orders', []);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No orders');
  });
});
