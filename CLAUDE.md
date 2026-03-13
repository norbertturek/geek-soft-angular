# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 21 trading order management app with SSR. Orders are fetched from a REST API, grouped by symbol, and enriched with real-time bid prices via WebSocket for profit calculations.

## Commands

- `npm start` / `ng serve` — dev server at http://localhost:4200
- `npm test` / `ng test` — run all tests (Vitest)
- `npm run build` / `ng build` — production build (output: `dist/`)
- `npm run ci` — test + build (CI pipeline)
- `npm run codegen:eval` — evaluate AI-generated code quality (requires `GEMINI_API_KEY` in `.env`)

Test runner: Vitest (via `@angular/build:unit-test`). No standalone vitest config — it's integrated through Angular CLI. There is no lint script configured.

## Architecture

```
src/app/
├── core/                    # Shared services, stores, models
│   ├── models/order.model   # Order, GroupedOrder, Quote, Instrument types
│   ├── orders/
│   │   ├── orders-api.service  # HTTP: fetches orders from REST API
│   │   ├── orders.store        # Central state: orders signal, grouping, profit calc
│   │   └── instruments.service # HTTP: loads contract sizes (needed for profit)
│   ├── quotes/
│   │   └── quotes.service      # WebSocket: real-time bid prices per symbol
│   ├── theme/                  # ThemeService + ThemeToggleComponent (dark mode)
│   └── notification/           # NotificationService + snackbar component
├── features/
│   ├── home/                # HomePage (landing)
│   └── orders/              # OrdersPage, OrdersTableComponent, add-order modal
├── app.routes.ts            # Lazy-loaded routes: / → Home, /orders → Orders
├── app.config.ts            # Providers: router, HttpClient, SSR hydration
└── app.ts                   # Root component with nav header + router outlet
```

### Data Flow

1. `OrdersPage.onInit` → `OrdersStore.loadOrders()` → loads instruments (contract sizes), then fetches orders
2. `OrdersStore` groups orders by symbol and computes profits using `QuotesService` bid prices and instrument contract sizes
3. `QuotesService` maintains a WebSocket to `wss://webquotes.geeksoft.pl` — an `effect()` in `OrdersStore` auto-subscribes to quote symbols matching loaded orders
4. Profit formula: `(bid - openPrice) * size * contractSize * sideMultiplier` where BUY=1, SELL=-1

### API Endpoints

- Orders: `https://geeksoft.pl/assets/2026-task/order-data.json`
- Instruments: `https://geeksoft.pl/assets/2026-task/instruments.json`
- Contract types: `https://geeksoft.pl/assets/2026-task/contract-types.json`
- Quotes WS: `wss://webquotes.geeksoft.pl/websocket/quotes`

### Path Aliases

- `@app/*` → `src/app/*`
- `@core/*` → `src/app/core/*`

Use aliases instead of relative `../` imports when crossing feature/core boundaries.

## Language

**Always use English** for all generated content: code, comments, variable names, commit messages, PR descriptions, UI text.

## Styling

Tailwind CSS v4 (utility-first). Palette colors via CSS custom properties in `src/styles.css`:
- Use `text-[var(--color-text)]`, `bg-[var(--color-row-bg)]` etc. in templates
- Avoid component `styles` blocks — use Tailwind in templates
- Dark theme: `data-theme="dark"` on `<html>`

## Pull Requests

**NEVER close a PR.** To change the target branch: `gh pr edit <PR> --base main`. Closing is irreversible and loses history.

## Key Conventions

See `AGENTS.md` for full rules and `.claude/CLAUDE.md` for Claude-specific skills/workflows. Summary of critical points:

- Angular 21: `standalone: true` is default — do NOT set it in decorators
- Use `input()`/`output()` functions, not decorators
- Use `inject()` function, not constructor injection
- `ChangeDetectionStrategy.OnPush` on all components
- Signals for state, `computed()` for derived state
- Native control flow: `@if`, `@for`, `@switch`
- Use `class` bindings (not `ngClass`/`ngStyle`)
- Host bindings in decorator `host` object (not `@HostBinding`/`@HostListener`)
