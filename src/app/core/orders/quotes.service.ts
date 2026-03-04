import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { QUOTES_WS_URL } from '@core/orders/quotes-api.config';
import type { Quote } from '@core/models/order.model';

/** symbol -> bid price */
export type QuotesMap = Map<string, number>;

const MAX_RECONNECT_DELAY_MS = 30_000;
const INITIAL_RECONNECT_DELAY_MS = 1_000;

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private readonly platformId = inject(PLATFORM_ID);
  private ws: WebSocket | null = null;
  private subscribedSymbols = new Set<string>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
  private shouldReconnect = false;

  readonly quotes = signal<QuotesMap>(new Map());
  readonly connected = signal(false);

  connect(): void {
    if (
      !isPlatformBrowser(this.platformId) ||
      this.ws?.readyState === WebSocket.OPEN ||
      this.ws?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }
    this.shouldReconnect = true;
    this.createConnection();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribedSymbols.clear();
    this.quotes.set(new Map());
    this.connected.set(false);
  }

  subscribe(symbols: string[]): void {
    if (!isPlatformBrowser(this.platformId) || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    const toAdd = symbols.filter((s) => !this.subscribedSymbols.has(s));
    if (toAdd.length === 0) return;
    for (const s of toAdd) this.subscribedSymbols.add(s);
    this.send({ p: '/subscribe/addlist', d: toAdd });
  }

  unsubscribe(symbols: string[]): void {
    if (!isPlatformBrowser(this.platformId) || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    const toRemove = symbols.filter((s) => this.subscribedSymbols.has(s));
    if (toRemove.length === 0) return;
    for (const s of toRemove) this.subscribedSymbols.delete(s);
    this.send({ p: '/subscribe/removelist', d: toRemove });
  }

  private createConnection(): void {
    this.clearReconnectTimer();
    try {
      this.ws = new WebSocket(QUOTES_WS_URL);
      this.ws.onopen = () => {
        this.connected.set(true);
        this.reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
        this.resubscribeAll();
      };
      this.ws.onclose = () => {
        this.connected.set(false);
        this.scheduleReconnect();
      };
      this.ws.onmessage = (event) => this.handleMessage(event.data);
      this.ws.onerror = () => {
        this.connected.set(false);
      };
    } catch {
      this.connected.set(false);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) return;
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.createConnection();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private resubscribeAll(): void {
    if (this.subscribedSymbols.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
      this.send({ p: '/subscribe/addlist', d: [...this.subscribedSymbols] });
    }
  }

  private send(msg: { p: string; d: string[] }): void {
    this.ws?.send(JSON.stringify(msg));
  }

  private handleMessage(data: string): void {
    let parsed: { p?: string; d?: Quote[] };
    try {
      parsed = JSON.parse(data) as { p?: string; d?: Quote[] };
    } catch {
      return;
    }
    if (parsed.p !== '/quotes/subscribed' || !Array.isArray(parsed.d)) return;
    const next = new Map(this.quotes());
    for (const q of parsed.d) {
      if (q?.s != null && typeof q.b === 'number') {
        next.set(q.s, q.b);
      }
    }
    this.quotes.set(next);
  }
}
