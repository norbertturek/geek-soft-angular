import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import type { GroupedOrder, VirtualTableRow } from '@core/models/order.model';
import { NotificationService } from '@core/notification/notification.service';
import { OrdersStore } from '@core/orders/orders.store';
import { OrdersTableHeaderComponent } from '@app/features/orders/components/orders-table/orders-table-header.component';
import { OrdersTableEmptyComponent } from '@app/features/orders/components/orders-table/orders-table-empty.component';
import { OrdersTableGroupRowComponent } from '@app/features/orders/components/orders-table/orders-table-group-row.component';
import { OrdersTableDetailRowComponent } from '@app/features/orders/components/orders-table/orders-table-detail-row.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

const ROW_HEIGHT_PX = 52;

@Component({
  selector: 'app-orders-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block flex-1 min-h-0 min-w-0',
  },
  imports: [
    ScrollingModule,
    OrdersTableHeaderComponent,
    OrdersTableEmptyComponent,
    OrdersTableGroupRowComponent,
    OrdersTableDetailRowComponent,
  ],
  template: `
    <div class="h-full min-h-0 flex flex-col overflow-x-auto overflow-y-hidden [scrollbar-gutter:stable] touch-pan-x">
      <div class="min-w-[75rem] flex flex-col flex-1 min-h-0 [scrollbar-gutter:stable]"
           [class.overflow-y-auto]="groupedOrders().length === 0 || disableVirtualScroll()"
           [class.overflow-hidden]="groupedOrders().length > 0 && !disableVirtualScroll()">
        @if (groupedOrders().length === 0) {
          <table class="orders-table border-collapse table-fixed">
            <caption class="sr-only">Orders list grouped by symbol</caption>
            <colgroup>
              <col /><col /><col /><col /><col /><col /><col /><col />
            </colgroup>
            <thead app-orders-table-header></thead>
            <tbody>
              <tr app-orders-table-empty></tr>
            </tbody>
          </table>
        } @else if (disableVirtualScroll()) {
          <table class="orders-table border-collapse table-fixed">
            <caption class="sr-only">Orders list grouped by symbol</caption>
            <colgroup>
              <col /><col /><col /><col /><col /><col /><col /><col />
            </colgroup>
            <thead app-orders-table-header></thead>
            <tbody>
              @for (row of flattenedRows(); track row.id) {
                @switch (row.kind) {
                  @case ('group') {
                    <tr
                      app-orders-table-group-row
                      [group]="row.group"
                      [expanded]="isExpanded(row.group.symbol)"
                      (toggle)="toggleGroup($event)"
                      (closeGroup)="onCloseGroup($event)"
                    ></tr>
                  }
                  @case ('detail') {
                    <tr
                      app-orders-table-detail-row
                      [order]="row.order"
                      [profit]="row.profit"
                      (closeOrder)="onCloseOrder($event)"
                    ></tr>
                  }
                }
              }
            </tbody>
          </table>
        } @else {
          <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
            <table class="orders-table border-collapse table-fixed shrink-0">
              <caption class="sr-only">Orders list grouped by symbol</caption>
              <colgroup>
                <col /><col /><col /><col /><col /><col /><col /><col />
              </colgroup>
              <thead app-orders-table-header></thead>
            </table>
            <cdk-virtual-scroll-viewport
              [itemSize]="rowHeightPx"
              class="flex-1 min-h-[200px] overflow-y-auto overflow-x-visible [scrollbar-gutter:stable]"
            >
              <table class="orders-table border-collapse table-fixed">
                <colgroup>
                  <col /><col /><col /><col /><col /><col /><col /><col />
                </colgroup>
                <tbody>
                  <ng-container
                    *cdkVirtualFor="
                      let row of flattenedRows();
                      trackBy: trackByRow
                    "
                  >
                    @switch (row.kind) {
                      @case ('group') {
                        <tr
                          app-orders-table-group-row
                          [group]="row.group"
                          [expanded]="isExpanded(row.group.symbol)"
                          (toggle)="toggleGroup($event)"
                          (closeGroup)="onCloseGroup($event)"
                        ></tr>
                      }
                      @case ('detail') {
                        <tr
                          app-orders-table-detail-row
                          [order]="row.order"
                          [profit]="row.profit"
                          (closeOrder)="onCloseOrder($event)"
                        ></tr>
                      }
                    }
                  </ng-container>
                </tbody>
              </table>
            </cdk-virtual-scroll-viewport>
          </div>
        }
      </div>
    </div>
  `,
})
export class OrdersTableComponent {
  readonly groupedOrders = input.required<GroupedOrder[]>();
  readonly orderProfits = input.required<Map<number, number>>();
  /** When true, renders all rows (no virtualization). Use for tests. */
  readonly disableVirtualScroll = input(false);

  protected readonly rowHeightPx = ROW_HEIGHT_PX;

  private readonly store = inject(OrdersStore);
  private readonly notification = inject(NotificationService);

  protected readonly expandedGroups = signal<Set<string>>(new Set());

  protected readonly flattenedRows = computed<VirtualTableRow[]>(() => {
    const groups = this.groupedOrders();
    const profits = this.orderProfits();
    const expanded = this.expandedGroups();
    const rows: VirtualTableRow[] = [];
    for (const group of groups) {
      rows.push({
        kind: 'group',
        group,
        id: `group-${group.symbol}`,
      });
      if (expanded.has(group.symbol)) {
        for (const order of group.orders) {
          rows.push({
            kind: 'detail',
            order,
            profit: profits.get(order.id) ?? 0,
            id: `detail-${order.id}`,
          });
        }
      }
    }
    return rows;
  });

  protected isExpanded(symbol: string): boolean {
    return this.expandedGroups().has(symbol);
  }

  protected toggleGroup(symbol: string): void {
    this.expandedGroups.update((set) => {
      const next = new Set(set);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  }

  protected trackByRow(_index: number, row: VirtualTableRow): string {
    return row.id;
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
