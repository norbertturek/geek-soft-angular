import { TestBed } from '@angular/core/testing';
import { OrdersTableComponent } from '@app/features/orders/orders-table.component';
import type { GroupedOrder } from '@core/models/order.model';

describe('OrdersTableComponent', () => {
  const mockGroupedOrders: GroupedOrder[] = [
    {
      symbol: 'BTCUSD',
      orders: [
        {
          id: 1,
          symbol: 'BTCUSD',
          side: 'BUY',
          size: 0.05,
          openPrice: 104837.47,
          openTime: 1750740422000,
          swap: -0.00147939,
        },
      ],
      avgOpenPrice: 104837.47,
      sumSize: 0.05,
      sumSwap: -0.00147939,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersTableComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(OrdersTableComponent);
    fixture.componentRef.setInput('groupedOrders', mockGroupedOrders);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render table with grouped order data', () => {
    const fixture = TestBed.createComponent(OrdersTableComponent);
    fixture.componentRef.setInput('groupedOrders', mockGroupedOrders);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('BTCUSD');
    expect(el.textContent).toContain('(1)');
    expect(el.textContent).toMatch(/\d+[.,\s]*837[.,\s]*47/);
    expect(el.textContent).toContain('0.05');
    expect(el.querySelector('tbody tr')).toBeTruthy();
  });

  it('should show empty state when groupedOrders is empty', () => {
    const fixture = TestBed.createComponent(OrdersTableComponent);
    fixture.componentRef.setInput('groupedOrders', []);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No orders');
  });

  it('should not render order rows when group is collapsed', () => {
    const fixture = TestBed.createComponent(OrdersTableComponent);
    fixture.componentRef.setInput('groupedOrders', mockGroupedOrders);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('BTCUSD');
    expect(el.textContent).not.toContain('BUY');
  });

  it('should toggle expanded state and render order rows on group row click', () => {
    const fixture = TestBed.createComponent(OrdersTableComponent);
    fixture.componentRef.setInput('groupedOrders', mockGroupedOrders);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const groupRow = el.querySelector('tbody tr');
    expect(groupRow).toBeTruthy();

    (groupRow as HTMLElement).click();
    fixture.detectChanges();

    expect(el.textContent).toContain('BUY');
    expect(el.textContent).toContain('0.05');

    (groupRow as HTMLElement).click();
    fixture.detectChanges();

    expect(el.textContent).not.toContain('BUY');
  });

  it('should expand on Enter key', () => {
    const fixture = TestBed.createComponent(OrdersTableComponent);
    fixture.componentRef.setInput('groupedOrders', mockGroupedOrders);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const groupRow = el.querySelector('tbody tr') as HTMLElement;
    groupRow.focus();

    groupRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(el.textContent).toContain('BUY');
  });

  it('should expand on Space key', () => {
    const fixture = TestBed.createComponent(OrdersTableComponent);
    fixture.componentRef.setInput('groupedOrders', mockGroupedOrders);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const groupRow = el.querySelector('tbody tr') as HTMLElement;
    groupRow.focus();

    groupRow.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();

    expect(el.textContent).toContain('BUY');
  });
});
