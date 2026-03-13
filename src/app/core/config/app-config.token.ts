import { InjectionToken } from '@angular/core';

export interface AppConfig {
  production: boolean;
  ordersUrl: string;
  instrumentsUrl: string;
  contractTypesUrl: string;
  quotesWsUrl: string;
  wsPingIntervalMs: number;
  wsReconnectDelayMs: number;
  /** Max symbols to subscribe. When exceeded, only first N (sorted) are used. Default: no limit. */
  wsMaxSubscribedSymbols?: number;
  /** Send subscribe in batches of this size. Default: 200. */
  wsSubscribeBatchSize?: number;
  /** Buffer quote updates and flush every N ms. 0 or undefined = immediate. Reduces re-renders. Default: 80. */
  wsQuoteBufferMs?: number;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

