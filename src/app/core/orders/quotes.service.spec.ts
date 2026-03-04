import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { QuotesService } from '@core/orders/quotes.service';

const sentMessages: { p: string; d: string[] }[] = [];
let mockWsOnMessage: ((e: { data: string }) => void) | null = null;

function installMockWebSocket(): void {
  const MockWs = class {
    static readonly OPEN = 1;
    private _onmessage: ((e: { data: string }) => void) | null = null;
    constructor() {
      queueMicrotask(() => {
        this.readyState = 1;
        (this as { onopen?: () => void }).onopen?.();
      });
    }
    readyState = 0;
    set onmessage(fn: ((e: { data: string }) => void) | null) {
      this._onmessage = fn;
      mockWsOnMessage = fn;
    }
    get onmessage() {
      return this._onmessage;
    }
    onopen: (() => void) | null = null;

    send(msg: string): void {
      try {
        const parsed = JSON.parse(msg) as { p: string; d: string[] };
        sentMessages.push({ p: parsed.p, d: parsed.d ?? [] });
      } catch {
        /* ignore */
      }
    }
    close(): void {}
  };
  (globalThis as unknown as { WebSocket: typeof MockWs }).WebSocket = MockWs;
}

describe('QuotesService', () => {
  let service: QuotesService;
  let originalWs: typeof globalThis.WebSocket;

  beforeEach(() => {
    sentMessages.length = 0;
    mockWsOnMessage = null;
    originalWs = globalThis.WebSocket;
    installMockWebSocket();

    TestBed.configureTestingModule({
      providers: [
        QuotesService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(QuotesService);
  });

  afterEach(() => {
    service.disconnect();
    (globalThis as unknown as { WebSocket: typeof WebSocket }).WebSocket = originalWs;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send addlist when subscribing', async () => {
    service.connect();
    await new Promise((r) => setTimeout(r, 10));
    service.subscribe(['BTCUSD', 'ETHUSD']);
    expect(sentMessages).toContainEqual({
      p: '/subscribe/addlist',
      d: ['BTCUSD', 'ETHUSD'],
    });
  });

  it('should send removelist when unsubscribing', async () => {
    service.connect();
    await new Promise((r) => setTimeout(r, 10));
    service.subscribe(['BTCUSD']);
    sentMessages.length = 0;
    service.unsubscribe(['BTCUSD']);
    expect(sentMessages).toContainEqual({
      p: '/subscribe/removelist',
      d: ['BTCUSD'],
    });
  });

  it('should update quotes signal on subscribed message', async () => {
    service.connect();
    await new Promise((r) => setTimeout(r, 10));
    service.subscribe(['BTCUSD']);
    if (mockWsOnMessage) {
      mockWsOnMessage({
        data: JSON.stringify({
          p: '/quotes/subscribed',
          d: [{ s: 'BTCUSD', b: 70000, a: 70100, t: 1 }],
        }),
      });
    }
    expect(service.quotes().get('BTCUSD')).toBe(70000);
  });
});
