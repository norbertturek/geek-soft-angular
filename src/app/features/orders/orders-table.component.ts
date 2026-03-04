import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import type { GroupedOrder } from '@core/models/order.model';
import type { NotificationService } from '@core/notification/notification.service';
import type { OrdersStore } from '@core/orders/orders.store';

const CELL_CLASS = 'py-2 px-3 text-left text-[var(--color-text)]';
const HEADER_CELL_CLASS = `${CELL_CLASS} font-semibold`;
const ROW_CLASS = 'bg-[var(--color-row-bg)] hover:bg-[var(--color-row-bg-hover)]';
const GROUP_ROW_CLASS =
  'bg-[color-mix(in_srgb,var(--color-text)_8%,var(--color-row-bg))] hover:bg-[color-mix(in_srgb,var(--color-text)_12%,var(--color-row-bg))] font-semibold';

const STICKY_CLOSE_CELL =
  'sticky right-0 w-14 min-w-14 [box-shadow:-4px_0_8px_var(--color-sticky-shadow)]';
const STICKY_HEADER_CELL = `${STICKY_CLOSE_CELL} bg-[var(--color-bg-main)]`;
const STICKY_GROUP_CELL = `${STICKY_CLOSE_CELL} bg-[color-mix(in_srgb,var(--color-text)_8%,var(--color-row-bg))]`;
const STICKY_ORDER_CELL = `${STICKY_CLOSE_CELL} bg-[var(--color-row-bg)]`;

const OPEN_TIME_FORMAT = 'dd.MM.yyyy HH:mm:ss';

@Component({
  selector: 'app-orders-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe],
  template: `
    <table class="w-full border-collapse">
      <caption class="sr-only">Orders list grouped by symbol</caption>
      <thead>
        <tr>
          <th scope="col" [class]="headerCellClass">Symbol</th>
          <th scope="col" [class]="headerCellClass">Open Time</th>
          <th scope="col" [class]="headerCellClass">Open Price</th>
          <th scope="col" [class]="headerCellClass">Side</th>
          <th scope="col" [class]="headerCellClass">Swap</th>
          <th scope="col" [class]="headerCellClass">Size</th>
          <th scope="col" [class]="headerCellClass">Profit</th>
          <th scope="col" [class]="headerCellClass + ' ' + stickyHeaderCellClass">Close</th>
        </tr>
      </thead>
      <tbody>
        @if (groupedOrders().length === 0) {
          <tr [class]="rowClass">
            <td colspan="8" [class]="cellClass">No orders</td>
          </tr>
        } @else {
          @for (group of groupedOrders(); track group.symbol) {
            @let expanded = isExpanded(group.symbol);
            <tr
              [class]="groupRowClass"
              role="button"
              [attr.aria-expanded]="expanded"
              [attr.aria-label]="(expanded ? 'Collapse' : 'Expand') + ' group ' + group.symbol"
              (click)="toggleGroup(group.symbol)"
              (keydown)="handleGroupKeydown($event, group.symbol)"
              tabindex="0"
            >
              <th scope="row" colspan="2" [class]="cellClass">
                {{ group.symbol }} ({{ group.orders.length }})
              </th>
              <td [class]="cellClass">{{ group.avgOpenPrice | number:'1.2-2' }}</td>
              <td [class]="cellClass" aria-hidden="true"></td>
              <td [class]="cellClass">{{ group.sumSwap | number:'1.2-8' }}</td>
              <td [class]="cellClass">{{ group.sumSize | number:'1.2-8' }}</td>
              <td [class]="cellClass" [style.color]="profitColor(group.sumProfit)">
                {{ group.sumProfit | number:'1.2-2' }}
              </td>
              <td [class]="cellClass + ' ' + stickyGroupCellClass">
                <button
                  type="button"
                  [attr.aria-label]="'Close order no. ' + group.orders.map(o => o.id).join(', ')"
                  (click)="$event.stopPropagation(); onCloseGroup(group.symbol)"
                  class="min-w-8 min-h-8 p-1.5 rounded border border-[var(--color-text)]/30 hover:bg-[var(--color-row-bg-hover)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-text)] text-lg leading-none font-medium"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </td>
            </tr>
            @if (expanded) {
              @for (order of group.orders; track order.id) {
                <tr [class]="rowClass">
                  <td [class]="cellClass">{{ order.symbol }}</td>
                  <td [class]="cellClass">{{ order.openTime | date:openTimeFormat }}</td>
                  <td [class]="cellClass">{{ order.openPrice | number:'1.2-2' }}</td>
                  <td [class]="cellClass">{{ order.side }}</td>
                  <td [class]="cellClass">{{ order.swap | number:'1.2-8' }}</td>
                  <td [class]="cellClass">{{ order.size | number:'1.2-8' }}</td>
                  <td [class]="cellClass" [style.color]="profitColor(orderProfits().get(order.id) ?? 0)">
                    {{ (orderProfits().get(order.id) ?? 0) | number:'1.2-2' }}
                  </td>
                  <td [class]="cellClass + ' ' + stickyOrderCellClass">
                    <button
                      type="button"
                      [attr.aria-label]="'Close order no. ' + order.id"
                      (click)="onCloseOrder(order.id)"
                      class="min-w-8 min-h-8 p-1.5 rounded border border-[var(--color-text)]/30 hover:bg-[var(--color-row-bg-hover)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-text)] text-lg leading-none font-medium"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </td>
                </tr>
              }
            }
          }
        }
      </tbody>
    </table>
  `,
})
export class OrdersTableComponent {
  readonly groupedOrders = input.required<GroupedOrder[]>();
  readonly orderProfits = input.required<Map<number, number>>();
  readonly store = input.required<OrdersStore>();
  readonly notification = input.required<NotificationService>();

  protected readonly expandedGroups = signal<Set<string>>(new Set());

  protected profitColor(profit: number): string {
    return profit >= 0
      ? 'var(--color-profit-positive)'
      : 'var(--color-profit-negative)';
  }
  protected readonly cellClass = CELL_CLASS;
  protected readonly headerCellClass = HEADER_CELL_CLASS;
  protected readonly rowClass = ROW_CLASS;
  protected readonly groupRowClass = GROUP_ROW_CLASS;
  protected readonly openTimeFormat = OPEN_TIME_FORMAT;
  protected readonly stickyHeaderCellClass = STICKY_HEADER_CELL;
  protected readonly stickyGroupCellClass = STICKY_GROUP_CELL;
  protected readonly stickyOrderCellClass = STICKY_ORDER_CELL;

  protected isExpanded(symbol: string): boolean {
    return this.expandedGroups().has(symbol);
  }

  protected toggleGroup(symbol: string): void {
    this.expandedGroups.update((set) => {
      const next = new Set(set);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  }

  protected handleGroupKeydown(event: KeyboardEvent, symbol: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleGroup(symbol);
    }
  }

  protected onCloseGroup(symbol: string): void {
    const store = this.store();
    const notification = this.notification();
    const group = this.groupedOrders().find((g) => g.symbol === symbol);
    const ids = group ? group.orders.map((o) => o.id).join(', ') : '';
    store.removeGroup(symbol);
    notification.show('Closed order no. ' + ids);
  }

  protected onCloseOrder(id: number): void {
    const store = this.store();
    const notification = this.notification();
    store.removeOrder(id);
    notification.show('Closed order no. ' + id);
  }
}
