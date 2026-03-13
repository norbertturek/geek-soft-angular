import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { GroupedOrder } from '@core/models/order.model';
import { SvgIconComponent } from '@shared/components/svg-icon.component';
import { formatSigned } from '@shared/utils/format.utils';
import {
  CELL_CLASS,
  CLOSE_CELL_CLASS,
  GROUP_ROW_CLASS,
} from '@shared/constants/table.constants';

@Component({
  selector: 'tr[app-orders-table-group-row]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, SvgIconComponent],
  host: {
    '[class]': 'groupRowClass',
    role: 'button',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-label]': "(expanded() ? 'Collapse' : 'Expand') + ' group ' + group().symbol",
    tabindex: '0',
    '(click)': 'onRowClick()',
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    <th scope="row" [class]="cellClass">
      <div class="flex items-center gap-2">
        @if (expanded()) {
          <app-svg-icon name="chevron-down" iconClass="text-text-muted" />
        } @else {
          <app-svg-icon name="chevron-right" iconClass="text-text-muted" />
        }
        <span class="min-w-0 truncate font-semibold text-text" [attr.title]="group().symbol">{{ group().symbol }}<span class="ml-2 shrink-0 font-normal text-text-muted">({{ group().orders.length }})</span></span>
      </div>
    </th>
    <td [class]="cellClass + ' text-center'" aria-hidden="true">—</td>
    <td [class]="cellClass + ' font-medium tabular-nums'">{{ group().sumSize | number:'1.2-8' }}</td>
    <td [class]="cellClass + ' font-medium tabular-nums'">{{ group().avgOpenPrice | number:'1.2-2' }}</td>
    <td [class]="cellClass + ' text-center'" aria-hidden="true">—</td>
    <td [class]="cellClass + ' text-right tabular-nums'" [style.color]="valueColor(group().sumSwap)">
      {{ formatSigned(group().sumSwap, 8) }}
    </td>
    <td [class]="cellClass + ' text-right font-semibold tabular-nums'" [style.color]="valueColor(group().sumProfit)">
      {{ formatSigned(group().sumProfit) }}
    </td>
    <td [class]="cellClass + ' ' + closeCellClass">
      <button
        type="button"
        [attr.aria-label]="'Close order no. ' + group().orders.map(o => o.id).join(', ')"
        (click)="$event.stopPropagation(); closeGroup.emit(group().symbol)"
        class="inline-flex items-center justify-center p-1.5 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-text group"
      >
        <app-svg-icon name="close" iconClass="text-icon-muted group-hover:text-profit-negative" />
      </button>
    </td>
  `,
})
export class OrdersTableGroupRowComponent {
  readonly group = input.required<GroupedOrder>();
  readonly expanded = input.required<boolean>();
  readonly toggle = output<string>();
  readonly closeGroup = output<string>();

  protected readonly cellClass = CELL_CLASS;
  protected readonly groupRowClass = GROUP_ROW_CLASS;
  protected readonly closeCellClass = CLOSE_CELL_CLASS;

  protected valueColor(value: number): string {
    if (Math.abs(value) < Number.EPSILON) return 'inherit';
    return value > 0 ? 'var(--color-profit-positive)' : 'var(--color-profit-negative)';
  }

  protected formatSigned(value: number, maxDecimals = 2): string {
    return formatSigned(value, maxDecimals);
  }

  protected onRowClick(): void {
    this.toggle.emit(this.group().symbol);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle.emit(this.group().symbol);
    }
  }
}
