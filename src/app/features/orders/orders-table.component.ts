import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import type { GroupedOrder } from '@core/models/order.model';
import { NotificationService } from '@core/notification/notification.service';
import { OrdersStore } from '@core/orders/orders.store';

const CELL_CLASS = 'px-6 py-4 text-left text-[var(--color-text)]';
const HEADER_CELL_CLASS = 'px-6 py-4 text-left text-sm font-semibold text-[var(--color-text)]';
const ROW_CLASS = 'bg-[var(--color-row-detail)] hover:bg-[var(--color-row-detail-hover)] border-b border-[var(--color-border)] transition-colors';
const GROUP_ROW_CLASS =
  'bg-[var(--color-row-bg)] hover:bg-[var(--color-row-bg-hover)] border-b border-[var(--color-border)] cursor-pointer transition-colors';

const CLOSE_CELL_CLASS = 'w-16 text-center';

const OPEN_TIME_FORMAT = 'dd.MM.yyyy HH:mm:ss';

@Component({
  selector: 'app-orders-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe],
  template: `
    <div class="flex flex-col">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
      <caption class="sr-only">Orders list grouped by symbol</caption>
      <thead>
        <tr class="border-b border-[var(--color-border)] bg-[var(--color-row-bg)]">
          <th scope="col" [class]="headerCellClass">Symbol</th>
          <th scope="col" [class]="headerCellClass">Side</th>
          <th scope="col" [class]="headerCellClass">Size</th>
          <th scope="col" [class]="headerCellClass">Open Price</th>
          <th scope="col" [class]="headerCellClass">Open Time</th>
          <th scope="col" [class]="headerCellClass + ' text-right pr-6'">Swap</th>
          <th scope="col" [class]="headerCellClass + ' text-right pr-6'">Profit</th>
          <th scope="col" [class]="headerCellClass + ' ' + closeCellClass"></th>
        </tr>
      </thead>
      <tbody>
        @if (groupedOrders().length === 0) {
          <tr [class]="rowClass">
            <td colspan="8" [class]="cellClass + ' text-center py-12 text-[var(--color-text-muted)]'">
              No orders found. Add your first order to get started.
            </td>
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
              <th scope="row" [class]="cellClass">
                <div class="flex items-center gap-2">
                  @if (expanded) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-[var(--color-text-muted)] shrink-0" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-[var(--color-text-muted)] shrink-0" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
                  }
                  <span class="font-semibold text-[var(--color-text)]">{{ group.symbol }}<span class="ml-2 font-normal text-[var(--color-text-muted)]">({{ group.orders.length }})</span></span>
                </div>
              </th>
              <td [class]="cellClass" aria-hidden="true">—</td>
              <td [class]="cellClass + ' text-right font-medium'">{{ group.sumSize | number:'1.2-8' }}</td>
              <td [class]="cellClass + ' text-right font-medium'">{{ group.avgOpenPrice | number:'1.2-2' }}</td>
              <td [class]="cellClass" aria-hidden="true">—</td>
              <td [class]="cellClass + ' text-right'" [style.color]="valueColor(group.sumSwap)">
                {{ formatSigned(group.sumSwap, 8) }}
              </td>
              <td [class]="cellClass + ' text-right font-semibold'" [style.color]="valueColor(group.sumProfit)">
                {{ formatSigned(group.sumProfit) }}
              </td>
              <td [class]="cellClass + ' ' + closeCellClass">
                <button
                  type="button"
                  [attr.aria-label]="'Close order no. ' + group.orders.map(o => o.id).join(', ')"
                  (click)="$event.stopPropagation(); onCloseGroup(group.symbol)"
                  class="p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-text)] group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-icon-muted)] group-hover:text-[var(--color-profit-negative)]" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </td>
            </tr>
            @if (expanded) {
              @for (order of group.orders; track order.id) {
                <tr [class]="rowClass">
                  <td [class]="cellClass + ' pl-10'">{{ order.symbol }}</td>
                  <td [class]="cellClass">
                    <span
                      [class]="order.side === 'BUY' ? 'bg-[var(--color-badge-buy-bg)] text-[var(--color-badge-buy-text)]' : 'bg-[var(--color-badge-sell-bg)] text-[var(--color-badge-sell-text)]'"
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    >
                      {{ order.side }}
                    </span>
                  </td>
                  <td [class]="cellClass">{{ order.size | number:'1.2-8' }}</td>
                  <td [class]="cellClass">{{ order.openPrice | number:'1.2-2' }}</td>
                  <td [class]="cellClass">{{ order.openTime | date:openTimeFormat }}</td>
                  <td [class]="cellClass + ' text-right'" [style.color]="valueColor(order.swap)">
                    {{ formatSigned(order.swap, 8) }}
                  </td>
                  <td [class]="cellClass + ' text-right font-semibold'" [style.color]="valueColor(orderProfits().get(order.id) ?? 0)">
                    {{ formatSigned(orderProfits().get(order.id) ?? 0) }}
                  </td>
                  <td [class]="cellClass + ' ' + closeCellClass">
                    <button
                      type="button"
                      [attr.aria-label]="'Close order no. ' + order.id"
                      (click)="onCloseOrder(order.id)"
                      class="p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-text)] group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-icon-muted)] group-hover:text-[var(--color-profit-negative)]" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </td>
                </tr>
              }
            }
          }
        }
      </tbody>
    </table>
      </div>
    </div>
  `,
})
export class OrdersTableComponent {
  readonly groupedOrders = input.required<GroupedOrder[]>();
  readonly orderProfits = input.required<Map<number, number>>();

  private readonly store = inject(OrdersStore);
  private readonly notification = inject(NotificationService);

  protected readonly expandedGroups = signal<Set<string>>(new Set());

  protected valueColor(value: number): string {
    if (Math.abs(value) < Number.EPSILON) return 'inherit';
    return value > 0
      ? 'var(--color-profit-positive)'
      : 'var(--color-profit-negative)';
  }

  protected formatSigned(value: number, maxDecimals = 2): string {
    const abs = Math.abs(value);
    if (abs < Number.EPSILON) {
      return '0.' + '0'.repeat(maxDecimals);
    }
    const formatted = abs.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: maxDecimals,
    });
    return value > 0 ? '+' + formatted : '-' + formatted;
  }

  protected readonly cellClass = CELL_CLASS;
  protected readonly headerCellClass = HEADER_CELL_CLASS;
  protected readonly rowClass = ROW_CLASS;
  protected readonly groupRowClass = GROUP_ROW_CLASS;
  protected readonly openTimeFormat = OPEN_TIME_FORMAT;
  protected readonly closeCellClass = CLOSE_CELL_CLASS;

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
    const group = this.groupedOrders().find((g) => g.symbol === symbol);
    const ids = group ? group.orders.map((o) => o.id).join(', ') : '';
    this.store.removeGroup(symbol);
    this.notification.show('Closed order no. ' + ids);
  }

  protected onCloseOrder(id: number): void {
    this.store.removeOrder(id);
    this.notification.show('Closed order no. ' + id);
  }
}
