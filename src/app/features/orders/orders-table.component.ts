import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { GroupedOrder } from '@core/models/order.model';
import type { NotificationService } from '@core/notification/notification.service';
import type { OrdersStore } from '@core/orders/orders.store';

const CELL_CLASS = 'py-2 px-3 text-left text-[var(--color-text)]';
const HEADER_CELL_CLASS = `${CELL_CLASS} font-semibold`;
const ROW_CLASS = 'bg-[var(--color-row-bg)] hover:bg-[var(--color-row-bg-hover)]';
const GROUP_ROW_CLASS =
  'bg-[color-mix(in_srgb,var(--color-text)_8%,var(--color-row-bg))] hover:bg-[color-mix(in_srgb,var(--color-text)_12%,var(--color-row-bg))] font-semibold';

@Component({
  selector: 'app-orders-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    <table class="w-full border-collapse">
      <caption class="sr-only">Orders list grouped by symbol</caption>
      <thead>
        <tr>
          <th scope="col" [class]="headerCellClass">Symbol</th>
          <th scope="col" [class]="headerCellClass">Open Price (avg)</th>
          <th scope="col" [class]="headerCellClass">Size (sum)</th>
          <th scope="col" [class]="headerCellClass">Swap (sum)</th>
          <th scope="col" [class]="headerCellClass" class="w-12">
            <span class="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        @if (groupedOrders().length === 0) {
          <tr [class]="rowClass">
            <td colspan="5" [class]="cellClass">No orders</td>
          </tr>
        } @else {
          @for (group of groupedOrders(); track group.symbol) {
            <tr [class]="groupRowClass">
              <th scope="row" [class]="cellClass">{{ group.symbol }} ({{ group.orders.length }})</th>
              <td [class]="cellClass">{{ group.avgOpenPrice | number:'1.2-2' }}</td>
              <td [class]="cellClass">{{ group.sumSize | number:'1.2-8' }}</td>
              <td [class]="cellClass">{{ group.sumSwap | number:'1.2-8' }}</td>
              <td [class]="cellClass">
                <button
                  type="button"
                  [attr.aria-label]="'Close order no. ' + group.orders.map(o => o.id).join(', ')"
                  (click)="onCloseGroup(group.symbol)"
                  class="p-1 rounded hover:bg-[var(--color-row-bg-hover)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-text)]"
                >
                  <span aria-hidden="true">&#10005;</span>
                </button>
              </td>
            </tr>
          }
        }
      </tbody>
    </table>
  `,
})
export class OrdersTableComponent {
  readonly groupedOrders = input.required<GroupedOrder[]>();
  readonly store = input.required<OrdersStore>();
  readonly notification = input.required<NotificationService>();

  protected readonly cellClass = CELL_CLASS;
  protected readonly headerCellClass = HEADER_CELL_CLASS;
  protected readonly rowClass = ROW_CLASS;
  protected readonly groupRowClass = GROUP_ROW_CLASS;

  protected onCloseGroup(symbol: string): void {
    const store = this.store();
    const notification = this.notification();
    const group = this.groupedOrders().find((g) => g.symbol === symbol);
    const ids = group ? group.orders.map((o) => o.id).join(', ') : '';
    store.removeGroup(symbol);
    notification.show('Closed order no. ' + ids);
  }
}
