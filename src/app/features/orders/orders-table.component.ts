import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import type { Order } from '@core/models/order.model';

const CELL_CLASS = 'py-2 px-3 text-left text-[var(--color-text)]';
const HEADER_CELL_CLASS = `${CELL_CLASS} font-semibold`;
const ROW_CLASS = 'bg-[var(--color-row-bg)] hover:bg-[var(--color-row-bg-hover)]';

@Component({
  selector: 'app-orders-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe],
  template: `
    <table class="w-full border-collapse">
      <caption class="sr-only">Lista zleceń</caption>
      <thead>
        <tr>
          <th scope="col" [class]="headerCellClass">Symbol</th>
          <th scope="col" [class]="headerCellClass">Open Time</th>
          <th scope="col" [class]="headerCellClass">Open Price</th>
          <th scope="col" [class]="headerCellClass">Side</th>
          <th scope="col" [class]="headerCellClass">Size</th>
          <th scope="col" [class]="headerCellClass">Swap</th>
        </tr>
      </thead>
      <tbody>
        @if (orders().length === 0) {
          <tr [class]="rowClass">
            <td colspan="6" [class]="cellClass">Brak zleceń</td>
          </tr>
        } @else {
          @for (order of orders(); track order.id) {
            <tr [class]="rowClass">
              <td [class]="cellClass">{{ order.symbol }}</td>
              <td [class]="cellClass">{{ order.openTime | date:'dd.MM.yyyy HH:mm:ss' }}</td>
              <td [class]="cellClass">{{ order.openPrice | number:'1.2-2' }}</td>
              <td [class]="cellClass">{{ order.side }}</td>
              <td [class]="cellClass">{{ order.size | number:'1.2-8' }}</td>
              <td [class]="cellClass">{{ order.swap | number:'1.2-8' }}</td>
            </tr>
          }
        }
      </tbody>
    </table>
  `,
})
export class OrdersTableComponent {
  readonly orders = input.required<Order[]>();
  protected readonly cellClass = CELL_CLASS;
  protected readonly headerCellClass = HEADER_CELL_CLASS;
  protected readonly rowClass = ROW_CLASS;
}
