import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { QuotesService } from '@core/orders/quotes.service';

const sentMessages: { p: string; d: string[] }[] = [];
let mockWsInstance: MockWsInstance | null = null;
let mockWsOnMessage: ((e: { data: string }) => void) | null = null;

interface MockWsInstance {
  readyState: number;
  onopen: (() => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
  onmessage: ((e: { data: string }) => void) | null;
  send(msg: string): void;
  close(): void;
  simulateOpen(): void;
  simulateClose(): void;
}

function installMockWebSocket(): void {
  const MockWs = class {
    static readonly OPEN = 1;
    static readonly CONNECTING = 0;
    readyState = 0;
    onopen: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private _onmessage: ((e: { data: string }) => void) | null = null;

    constructor() {
      mockWsInstance = this as unknown as MockWsInstance;
      // Simulate async open by default
      queueMicrotask(() => {
        this.simulateOpen();
      });
    }

    set onmessage(fn: ((e: { data: string }) => void) | null) {
      this._onmessage = fn;
      mockWsOnMessage = fn;
    }
    get onmessage() {
      return this._onmessage;
    }

    send(msg: string): void {
      try {
        const parsed = JSON.parse(msg) as { p: string; d: string[] };
        sentMessages.push({ p: parsed.p, d: parsed.d ?? [] });
      } catch {
        /* ignore */
      }
    }

    close(): void {
      this.readyState = 3;
    }

    simulateOpen(): void {
      if (this.readyState === 0) {
        this.readyState = 1;
        this.onopen?.();
      }
    }

    simulateClose(): void {
      this.readyState = 3;
      this.onclose?.();
    }
  };
  (globalThis as unknown as { WebSocket: typeof MockWs }).WebSocket = MockWs;
}

describe('QuotesService', () => {
  let service: QuotesService;
  let originalWs: typeof globalThis.WebSocket;

  beforeEach(() => {
    sentMessages.length = 0;
    mockWsOnMessage = null;
    mockWsInstance = null;
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

  it('should set connected to true on open', async () => {
    service.connect();
    await new Promise((r) => setTimeout(r, 10));
    expect(service.connected()).toBe(true);
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

  it('should not create duplicate connections while connecting', async () => {
    service.connect();
    const firstInstance = mockWsInstance;
    service.connect(); // call again while CONNECTING
    expect(mockWsInstance).toBe(firstInstance);
  });

  it('should set connected to false on close', async () => {
    service.connect();
    await new Promise((r) => setTimeout(r, 10));
    expect(service.connected()).toBe(true);

    mockWsInstance?.simulateClose();
    expect(service.connected()).toBe(false);
  });

  it('should reconnect after close with exponential backoff', async () => {
    vi.useFakeTimers();

    service.connect();
    await vi.advanceTimersByTimeAsync(10); // let onopen fire
    expect(service.connected()).toBe(true);

    // Subscribe to a symbol before disconnect
    service.subscribe(['BTCUSD']);
    sentMessages.length = 0;

    // Simulate connection drop
    mockWsInstance?.simulateClose();
    expect(service.connected()).toBe(false);

    // Advance past first reconnect delay (1000ms)
    await vi.advanceTimersByTimeAsync(1_000);
    // New WS was created, let it open
    await vi.advanceTimersByTimeAsync(10);
    expect(service.connected()).toBe(true);

    // Should have re-subscribed to BTCUSD automatically
    expect(sentMessages).toContainEqual({
      p: '/subscribe/addlist',
      d: ['BTCUSD'],
    });

    vi.useRealTimers();
  });

  it('should not reconnect after explicit disconnect', async () => {
    vi.useFakeTimers();

    service.connect();
    await vi.advanceTimersByTimeAsync(10);
    expect(service.connected()).toBe(true);

    service.disconnect();
    expect(service.connected()).toBe(false);

    // Advance well past any reconnect delay
    await vi.advanceTimersByTimeAsync(60_000);
    expect(service.connected()).toBe(false);

    vi.useRealTimers();
  });
});
