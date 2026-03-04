import { TestBed } from '@angular/core/testing';
import { OrdersTableComponent } from '@app/features/orders/orders-table.component';
import type { GroupedOrder } from '@core/models/order.model';
import { OrdersStore } from '@core/orders/orders.store';
import { NotificationService } from '@core/notification/notification.service';

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
      sumProfit: 100,
    },
  ];

  const mockOrderProfits = new Map<number, number>([[1, 100]]);

  const mockStore = {
    removeOrder: vi.fn(),
    removeGroup: vi.fn(),
  } as unknown as OrdersStore;

  const mockNotification = {
    show: vi.fn(),
  } as unknown as NotificationService;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [OrdersTableComponent],
    }).compileComponents();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(OrdersTableComponent);
    fixture.componentRef.setInput('groupedOrders', mockGroupedOrders);
    fixture.componentRef.setInput('orderProfits', mockOrderProfits);
    fixture.componentRef.setInput('store', mockStore);
    fixture.componentRef.setInput('notification', mockNotification);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render table with grouped order data', () => {
    const fixture = createFixture();
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
    fixture.componentRef.setInput('orderProfits', new Map());
    fixture.componentRef.setInput('store', mockStore);
    fixture.componentRef.setInput('notification', mockNotification);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No orders');
  });

  it('should not render order rows when group is collapsed', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('BTCUSD');
    expect(el.textContent).not.toContain('BUY');
  });

  it('should toggle expanded state and render order rows on group row click', () => {
    const fixture = createFixture();

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
    const fixture = createFixture();

    const el = fixture.nativeElement as HTMLElement;
    const groupRow = el.querySelector('tbody tr') as HTMLElement;
    groupRow.focus();

    groupRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(el.textContent).toContain('BUY');
  });

  it('should expand on Space key', () => {
    const fixture = createFixture();

    const el = fixture.nativeElement as HTMLElement;
    const groupRow = el.querySelector('tbody tr') as HTMLElement;
    groupRow.focus();

    groupRow.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();

    expect(el.textContent).toContain('BUY');
  });

  it('should call removeGroup and notification.show when close group button clicked', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    const closeBtn = el.querySelector('tbody tr button[type="button"]') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();

    closeBtn.click();
    fixture.detectChanges();

    expect(mockStore.removeGroup).toHaveBeenCalledWith('BTCUSD');
    expect(mockNotification.show).toHaveBeenCalledWith('Closed order no. 1');
  });

  it('should call removeOrder and notification.show when close order button clicked', () => {
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    const groupRow = el.querySelector('tbody tr') as HTMLElement;
    groupRow.click();
    fixture.detectChanges();

    const orderCloseBtns = el.querySelectorAll('tbody tr button[type="button"]');
    const orderRowCloseBtn = orderCloseBtns[orderCloseBtns.length - 1] as HTMLButtonElement;
    orderRowCloseBtn.click();
    fixture.detectChanges();

    expect(mockStore.removeOrder).toHaveBeenCalledWith(1);
    expect(mockNotification.show).toHaveBeenCalledWith('Closed order no. 1');
  });
});
