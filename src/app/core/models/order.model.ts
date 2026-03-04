export type OrderSide = 'BUY' | 'SELL';

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
