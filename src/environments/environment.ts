import type { AppConfig } from '@core/config/app-config.token';

export const environment: AppConfig = {
  production: false,
  ordersUrl: 'https://geeksoft.pl/assets/2026-task/order-data.json',
  instrumentsUrl: 'https://geeksoft.pl/assets/2026-task/instruments.json',
  contractTypesUrl: 'https://geeksoft.pl/assets/2026-task/contract-types.json',
  quotesWsUrl: 'wss://webquotes.geeksoft.pl/websocket/quotes',
  wsPingIntervalMs: 15000,
  wsReconnectDelayMs: 1000,
  wsMaxSubscribedSymbols: 1000,
  wsSubscribeBatchSize: 100,
  wsQuoteBufferMs: 80,
};
