import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TABLE_CONSTANTS } from '@shared/constants/table.constants';

@Component({
  selector: 'tr[app-orders-table-empty]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'rowClass' },
  template: `
    <td [attr.colspan]="colspan" [class]="cellClass + ' text-center py-12 text-text-muted'">
      No orders found. Add your first order to get started.
    </td>
  `,
})
export class OrdersTableEmptyComponent {
  readonly colspan = 8;
  protected readonly rowClass = TABLE_CONSTANTS.rowClass;
  protected readonly cellClass = TABLE_CONSTANTS.cellClass;
}
