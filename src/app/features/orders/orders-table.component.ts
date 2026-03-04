import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { GroupedOrder } from '@core/models/order.model';

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
        </tr>
      </thead>
      <tbody>
        @if (groupedOrders().length === 0) {
          <tr [class]="rowClass">
            <td colspan="4" [class]="cellClass">No orders</td>
          </tr>
        } @else {
          @for (group of groupedOrders(); track group.symbol) {
            <tr [class]="groupRowClass">
              <th scope="row" [class]="cellClass">{{ group.symbol }} ({{ group.orders.length }})</th>
              <td [class]="cellClass">{{ group.avgOpenPrice | number:'1.2-2' }}</td>
              <td [class]="cellClass">{{ group.sumSize | number:'1.2-8' }}</td>
              <td [class]="cellClass">{{ group.sumSwap | number:'1.2-8' }}</td>
            </tr>
          }
        }
      </tbody>
    </table>
  `,
})
export class OrdersTableComponent {
  readonly groupedOrders = input.required<GroupedOrder[]>();
  protected readonly cellClass = CELL_CLASS;
  protected readonly headerCellClass = HEADER_CELL_CLASS;
  protected readonly rowClass = ROW_CLASS;
  protected readonly groupRowClass = GROUP_ROW_CLASS;
}
