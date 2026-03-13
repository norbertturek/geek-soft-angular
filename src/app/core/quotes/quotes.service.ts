import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { APP_CONFIG } from '@core/config/app-config.token';
import type { Quote } from '@core/models/order.model';

export type QuotesMap = Map<string, number>;

const MAX_RECONNECT_DELAY_MS = 30_000;

const WS = {
  PONG: '/pong',
  QUOTES_SUBSCRIBED: '/quotes/subscribed',
  SUBSCRIBE_ADDLIST: '/subscribe/addlist',
  SUBSCRIBE_REMOVELIST: '/subscribe/removelist',
  PING: '/ping',
} as const;

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly config = inject(APP_CONFIG);
  private webSocket: WebSocket | null = null;
  private subscribedSymbols = new Set<string>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectDelay = 0;
  private lastPongAt = 0;
  private shouldReconnect = false;
  private quoteBuffer: Quote[][] = [];
  private quoteFlushTimer: ReturnType<typeof setTimeout> | null = null;

  readonly quotes = signal<QuotesMap>(new Map());
  readonly connected = signal(false);
  /** True when we have received a pong recently (connection considered alive). */
  readonly alive = signal(false);

  connect(): void {
    if (
      !isPlatformBrowser(this.platformId) ||
      this.webSocket?.readyState === WebSocket.OPEN ||
      this.webSocket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }
    this.shouldReconnect = true;
    this.createConnection();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    this.clearPingTimer();
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
    this.subscribedSymbols.clear();
    this.clearQuoteFlushTimer();
    this.quoteBuffer = [];
    this.quotes.set(new Map());
    this.connected.set(false);
    this.alive.set(false);
  }

  subscribe(symbols: string[]): void {
    if (!isPlatformBrowser(this.platformId) || !this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
      return;
    }
    const toAdd = symbols.filter((symbol) => !this.subscribedSymbols.has(symbol));
    if (toAdd.length === 0) return;
    for (const symbol of toAdd) this.subscribedSymbols.add(symbol);
    this.sendBatched(WS.SUBSCRIBE_ADDLIST, toAdd);
  }

  unsubscribe(symbols: string[]): void {
    if (!isPlatformBrowser(this.platformId) || !this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
      return;
    }
    const toRemove = symbols.filter((symbol) => this.subscribedSymbols.has(symbol));
    if (toRemove.length === 0) return;
    for (const symbol of toRemove) this.subscribedSymbols.delete(symbol);
    this.send(WS.SUBSCRIBE_REMOVELIST, toRemove);
  }

  private createConnection(): void {
    this.clearReconnectTimer();
    try {
      this.webSocket = new WebSocket(this.config.quotesWsUrl);
      this.webSocket.onopen = () => this.handleOpen();
      this.webSocket.onclose = () => this.handleClose();
      this.webSocket.onmessage = (event) => this.handleMessage(event.data);
      this.webSocket.onerror = () => this.handleError();
    } catch {
      this.connected.set(false);
      this.scheduleReconnect();
    }
  }

  private handleOpen(): void {
    this.connected.set(true);
    this.lastPongAt = Date.now();
    this.alive.set(true);
    this.reconnectDelay = this.config.wsReconnectDelayMs;
    this.startPingLoop();
    this.resubscribeAll();
  }

  private handleClose(): void {
    this.clearPingTimer();
    this.connected.set(false);
    this.alive.set(false);
    this.scheduleReconnect();
  }

  private handleError(): void {
    this.connected.set(false);
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) return;
    this.clearReconnectTimer();
    const delay = this.reconnectDelay > 0 ? this.reconnectDelay : this.config.wsReconnectDelayMs;
    this.reconnectTimer = setTimeout(() => this.createConnection(), delay);
    this.reconnectDelay =
      delay > 0 ? Math.min(delay * 2, MAX_RECONNECT_DELAY_MS) : this.config.wsReconnectDelayMs;
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startPingLoop(): void {
    this.clearPingTimer();
    const intervalMs = this.config.wsPingIntervalMs;
    const pongTimeoutMs = 2 * intervalMs;
    this.pingTimer = setInterval(() => {
      if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) return;
      if (Date.now() - this.lastPongAt > pongTimeoutMs) {
        this.alive.set(false);
        this.webSocket.close();
        return;
      }
      this.send(WS.PING, []);
    }, intervalMs);
  }

  private clearPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private resubscribeAll(): void {
    if (this.subscribedSymbols.size > 0 && this.webSocket?.readyState === WebSocket.OPEN) {
      this.sendBatched(WS.SUBSCRIBE_ADDLIST, [...this.subscribedSymbols]);
    }
  }

  private send(path: string, payload: string[]): void {
    this.webSocket?.send(JSON.stringify({ p: path, d: payload }));
  }

  private sendBatched(path: string, payload: string[]): void {
    const batchSize = this.config.wsSubscribeBatchSize ?? 200;
    for (let i = 0; i < payload.length; i += batchSize) {
      this.send(path, payload.slice(i, i + batchSize));
    }
  }

  private handleMessage(data: string): void {
    const parsed = this.parseMessage(data);
    if (!parsed) return;

    if (parsed.path === WS.PONG) {
      this.handlePong();
      return;
    }

    if (parsed.path === WS.QUOTES_SUBSCRIBED && Array.isArray(parsed.data)) {
      this.bufferOrApplyQuotes(parsed.data);
    }
  }

  private parseMessage(data: string): { path: string; data?: Quote[] } | null {
    try {
      const wireMessage = JSON.parse(data) as { p?: string; d?: Quote[] };
      const path = wireMessage?.p;
      if (!path) return null;
      return { path, data: wireMessage.d };
    } catch {
      return null;
    }
  }

  private handlePong(): void {
    this.lastPongAt = Date.now();
    this.alive.set(true);
  }

  private bufferOrApplyQuotes(quotes: Quote[]): void {
    const bufferMs = this.config.wsQuoteBufferMs ?? 0;
    if (bufferMs <= 0) {
      this.applyQuotesUpdate(quotes);
      return;
    }
    this.quoteBuffer.push(quotes);
    if (this.quoteFlushTimer === null) {
      this.quoteFlushTimer = setTimeout(() => this.flushQuoteBuffer(), bufferMs);
    }
  }

  private clearQuoteFlushTimer(): void {
    if (this.quoteFlushTimer) {
      clearTimeout(this.quoteFlushTimer);
      this.quoteFlushTimer = null;
    }
  }

  private flushQuoteBuffer(): void {
    this.quoteFlushTimer = null;
    const buffered = this.quoteBuffer;
    this.quoteBuffer = [];
    if (buffered.length === 0) return;
    const next = new Map(this.quotes());
    for (const batch of buffered) {
      for (const quote of batch) {
        const { symbol, bid } = this.parseQuoteFromWire(quote);
        if (symbol != null && typeof bid === 'number') {
          next.set(symbol, bid);
        }
      }
    }
    this.quotes.set(next);
  }

  private applyQuotesUpdate(quotes: Quote[]): void {
    const next = new Map(this.quotes());
    for (const quote of quotes) {
      const { symbol, bid } = this.parseQuoteFromWire(quote);
      if (symbol != null && typeof bid === 'number') {
        next.set(symbol, bid);
      }
    }
    this.quotes.set(next);
  }

  /** Maps wire-format Quote (s, b) to readable { symbol, bid }. */
  private parseQuoteFromWire(quote: Quote): { symbol: string | null; bid: number | undefined } {
    const symbol = quote?.s ?? null;
    const bid = quote?.b;
    return { symbol, bid };
  }
}
