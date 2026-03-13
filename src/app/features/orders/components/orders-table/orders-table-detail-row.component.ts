import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import type { Order } from '@core/models/order.model';
import { SvgIconComponent } from '@shared/components/svg-icon.component';
import { formatSigned } from '@shared/utils/format.utils';
import {
  CELL_CLASS,
  CLOSE_CELL_CLASS,
  ROW_CLASS,
} from '@shared/constants/table.constants';
import { OPEN_TIME_FORMAT } from '@shared/constants/date-formats';

@Component({
  selector: 'tr[app-orders-table-detail-row]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, SvgIconComponent],
  host: {
    '[class]': 'rowClass',
  },
  template: `
      <td [class]="cellClass + ' pl-12 min-w-0 overflow-visible'">{{ order().symbol }}</td>
      <td [class]="cellClass + ' text-center'">
        <span
          [class]="order().side === 'BUY' ? 'bg-badge-buy-bg text-badge-buy-text' : 'bg-badge-sell-bg text-badge-sell-text'"
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
        >
          {{ order().side }}
        </span>
      </td>
      <td [class]="cellClass + ' tabular-nums'">{{ order().size | number:'1.2-8' }}</td>
      <td [class]="cellClass + ' tabular-nums'">{{ order().openPrice | number:'1.2-2' }}</td>
      <td [class]="cellClass + ' text-center'">{{ order().openTime | date:openTimeFormat }}</td>
      <td [class]="cellClass + ' text-right tabular-nums'" [style.color]="valueColor(order().swap)">
        {{ formatSwap(order().swap) }}
      </td>
      <td [class]="cellClass + ' text-right font-semibold tabular-nums'" [style.color]="valueColor(profit())">
        {{ formatProfit(profit()) }}
      </td>
      <td [class]="cellClass + ' ' + closeCellClass">
        <button
          type="button"
          [attr.aria-label]="'Close order no. ' + order().id"
          (click)="closeOrder.emit(order().id)"
          class="inline-flex items-center justify-center p-1.5 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-text group"
        >
          <app-svg-icon name="close" iconClass="text-icon-muted group-hover:text-profit-negative" />
        </button>
      </td>
  `,
})
export class OrdersTableDetailRowComponent {
  readonly order = input.required<Order>();
  readonly profit = input.required<number>();
  readonly closeOrder = output<number>();

  protected readonly cellClass = CELL_CLASS;
  protected readonly rowClass = ROW_CLASS;
  protected readonly closeCellClass = CLOSE_CELL_CLASS;
  protected readonly openTimeFormat = OPEN_TIME_FORMAT;

  protected valueColor(value: number): string {
    if (Math.abs(value) < Number.EPSILON) return 'inherit';
    return value > 0 ? 'var(--color-profit-positive)' : 'var(--color-profit-negative)';
  }

  protected formatSwap(value: number): string {
    return formatSigned(value, 8);
  }

  protected formatProfit(value: number): string {
    return formatSigned(value);
  }
}
