export type OrderSide = 'BUY' | 'SELL';

export interface Instrument {
  symbol: string;
  contractType: number;
}

export interface ContractType {
  contractType: number;
  contractSize: number;
}

export interface Order {
  id: number;
  symbol: string;
  side: OrderSide;
  size: number;
  openPrice: number;
  /** Unix timestamp in milliseconds */
  openTime: number;
  swap: number;
}

export interface OrdersApiResponse {
  data: Order[];
}

/** WebSocket quote: s=symbol, b=bid, a=ask, t=timestamp */
export interface Quote {
  s: string;
  b: number;
  a: number;
  t: number;
}

export interface GroupedOrder {
  symbol: string;
  orders: Order[];
  avgOpenPrice: number;
  sumSize: number;
  sumSwap: number;
  sumProfit: number;
}
