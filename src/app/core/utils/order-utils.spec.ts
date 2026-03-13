import { describe, it, expect } from 'vitest';
import {
  sideMultiplier,
  orderProfit,
  groupOrdersBySymbol,
} from '@core/utils/order-utils';
import type { Order } from '@core/models/order.model';

describe('order-utils', () => {
  it('sideMultiplier returns 1 for BUY and -1 for SELL', () => {
    expect(sideMultiplier('BUY')).toBe(1);
    expect(sideMultiplier('SELL')).toBe(-1);
  });

  it('orderProfit computes (bid - openPrice) * size * contractSize * sideMultiplier', () => {
    const order: Order = {
      id: 1,
      symbol: 'BTCUSD',
      side: 'BUY',
      size: 1,
      openPrice: 100,
      openTime: 0,
      swap: 0,
    };
    expect(orderProfit(order, 110, 1)).toBe(10); // (110-100)*1*1*1
    expect(orderProfit(order, 90, 1)).toBe(-10);

    const sell: Order = { ...order, side: 'SELL' };
    expect(orderProfit(sell, 110, 1)).toBe(-10); // (110-100)*1*1*(-1)
    expect(orderProfit(sell, 90, 1)).toBe(10);
  });

  it('groupOrdersBySymbol groups and aggregates by symbol', () => {
    const orders: Order[] = [
      {
        id: 1,
        symbol: 'BTCUSD',
        side: 'BUY',
        size: 1,
        openPrice: 100,
        openTime: 0,
        swap: 0,
      },
      {
        id: 2,
        symbol: 'BTCUSD',
        side: 'SELL',
        size: 0.5,
        openPrice: 102,
        openTime: 0,
        swap: 0,
      },
    ];
    const quotes = new Map<string, number>([['BTCUSD', 105]]);
    const getContractSize = () => 1;

    const groups = groupOrdersBySymbol(orders, quotes, getContractSize);
    expect(groups).toHaveLength(1);
    expect(groups[0].symbol).toBe('BTCUSD');
    expect(groups[0].orders).toHaveLength(2);
    expect(groups[0].sumSize).toBe(1.5);
    expect(groups[0].sumSwap).toBe(0);
    expect(groups[0].avgOpenPrice).toBe(101);
    // BUY: (105-100)*1*1*1 = 5; SELL: (105-102)*0.5*1*(-1) = -1.5; sum = 3.5
    expect(groups[0].sumProfit).toBe(3.5);
  });
});
