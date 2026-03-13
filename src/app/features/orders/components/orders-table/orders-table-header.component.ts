import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TABLE_CONSTANTS } from '@shared/constants/table.constants';

@Component({
  selector: 'thead[app-orders-table-header]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'sticky top-0 z-10 w-full bg-[var(--color-bg-main)] shadow-[0_1px_0_0_var(--color-border)]',
  },
  template: `
      <tr class="border-b border-border bg-[var(--color-bg-main)]">
        <th scope="col" [class]="headerCellClass">Symbol</th>
        <th scope="col" [class]="headerCellClass + ' text-center'">Side</th>
        <th scope="col" [class]="headerCellClass">Size</th>
        <th scope="col" [class]="headerCellClass">Open Price</th>
        <th scope="col" [class]="headerCellClass + ' text-center'">Open Time</th>
        <th scope="col" [class]="headerCellClass + ' text-right pr-6'">Swap</th>
        <th scope="col" [class]="headerCellClass + ' text-right pr-6'">Profit</th>
        <th scope="col" [class]="headerCellClass + ' ' + closeCellClass"></th>
      </tr>
  `,
})
export class OrdersTableHeaderComponent {
  protected readonly headerCellClass = TABLE_CONSTANTS.headerCellClass;
  protected readonly closeCellClass = TABLE_CONSTANTS.closeCellClass;
}
