import type { GroupedOrder, Order, OrderSide } from '@core/models/order.model';

export function sideMultiplier(side: OrderSide): 1 | -1 {
  return side === 'BUY' ? 1 : -1;
}

export function orderProfit(
  order: Order,
  bid: number,
  contractSize: number
): number {
  return (
    (bid - order.openPrice) *
    order.size *
    contractSize *
    sideMultiplier(order.side)
  );
}

export function groupOrdersBySymbol(
  orders: Order[],
  quotes: Map<string, number>,
  getContractSize: (s: string) => number
): GroupedOrder[] {
  const bySymbol = new Map<string, Order[]>();
  for (const o of orders) {
    const list = bySymbol.get(o.symbol) ?? [];
    list.push(o);
    bySymbol.set(o.symbol, list);
  }
  return Array.from(bySymbol.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([symbol, symbolOrders]) => {
      const sumSize = symbolOrders.reduce((acc, o) => acc + o.size, 0);
      const sumSwap = symbolOrders.reduce((acc, o) => acc + o.swap, 0);
      const avgOpenPrice =
        symbolOrders.length > 0
          ? symbolOrders.reduce((acc, o) => acc + o.openPrice, 0) /
            symbolOrders.length
          : 0;
      const bid = quotes.get(symbol) ?? 0;
      const contractSize = getContractSize(symbol);
      const sumProfit = symbolOrders.reduce(
        (acc, o) => acc + orderProfit(o, bid, contractSize),
        0
      );
      return {
        symbol,
        orders: [...symbolOrders],
        avgOpenPrice,
        sumSize,
        sumSwap,
        sumProfit,
      };
    });
}
