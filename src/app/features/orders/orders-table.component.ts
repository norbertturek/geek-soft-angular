import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import type { Order } from '@core/models/order.model';

@Component({
  selector: 'app-orders-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe],
  styles: `
    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.5rem 0.75rem;
      text-align: left;
      color: var(--color-text);
    }

    th {
      font-weight: 600;
    }

    tbody tr {
      background-color: var(--color-row-bg);
    }

    tbody tr:hover {
      background-color: var(--color-row-bg-hover);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `,
  template: `
    <table>
      <caption class="sr-only">Lista zleceń</caption>
      <thead>
        <tr>
          <th scope="col">Symbol</th>
          <th scope="col">Open Time</th>
          <th scope="col">Open Price</th>
          <th scope="col">Side</th>
          <th scope="col">Size</th>
          <th scope="col">Swap</th>
        </tr>
      </thead>
      <tbody>
        @if (orders().length === 0) {
          <tr>
            <td colspan="6">Brak zleceń</td>
          </tr>
        } @else {
          @for (order of orders(); track order.id) {
            <tr>
              <td>{{ order.symbol }}</td>
              <td>{{ order.openTime | date:'dd.MM.yyyy HH:mm:ss' }}</td>
              <td>{{ order.openPrice | number:'1.2-2' }}</td>
              <td>{{ order.side }}</td>
              <td>{{ order.size | number:'1.2-8' }}</td>
              <td>{{ order.swap | number:'1.2-8' }}</td>
            </tr>
          }
        }
      </tbody>
    </table>
  `,
})
export class OrdersTableComponent {
  readonly orders = input.required<Order[]>();
}
