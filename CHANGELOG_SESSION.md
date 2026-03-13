# Podsumowanie zmian (git status + diff)

*Oparte na rzeczywistych diffach. Dark mode istniał wcześniej – zmiany w theme to refaktoryzacja (ikony SVG, wyciągnięcie nagłówka).*

---

## 1. PLIKI USUNIĘTE (przeniesione / zastąpione)

| Plik | Powód |
|------|-------|
| `src/app/core/orders/instruments-api.config.ts` | Zastąpione przez APP_CONFIG + environments |
| `src/app/core/orders/orders-api.config.ts` | To samo |
| `src/app/core/orders/quotes-api.config.ts` | To samo |
| `src/app/core/orders/quotes.service.ts` | Przeniesione do `core/quotes/quotes.service.ts` |
| `src/app/core/orders/quotes.service.spec.ts` | Przeniesione z serwisem |
| `src/app/features/orders/add-order-modal.component.ts` | Przeniesione do `components/add-order-modal/` |
| `src/app/features/orders/orders-table.component.ts` | Rozdzielone na komponenty w `components/orders-table/` |
| `src/app/features/orders/orders-table.component.spec.ts` | Przeniesione z tabelą |

---

## 2. PLIKI NOWE (untracked)

### Konfiguracja

- `src/app/core/config/app-config.token.ts` – token APP_CONFIG z interfejsem (URLs, WS, optymalizacje)
- `src/environments/environment.ts` – konfiguracja dev
- `src/environments/environment.prod.ts` – konfiguracja prod

### Core

- `src/app/core/quotes/quotes.service.ts` – WebSocket notowań (ping/pong, buffering, batch subscribe)
- `src/app/core/quotes/quotes.service.spec.ts` – testy QuotesService
- `src/app/core/utils/order-utils.ts` – `groupOrdersBySymbol`, `orderProfit` (wyciągnięte ze store)
- `src/app/core/utils/order-utils.spec.ts` – testy order-utils

### Features – komponenty

- `src/app/features/orders/components/add-order-modal/add-order-modal.component.ts`
- `src/app/features/orders/components/orders-table/orders-table.component.ts` – kontener + virtual scroll
- `src/app/features/orders/components/orders-table/orders-table-header.component.ts` – nagłówek (poza viewportem w virtual)
- `src/app/features/orders/components/orders-table/orders-table-empty.component.ts` – stan pusty
- `src/app/features/orders/components/orders-table/orders-table-group-row.component.ts` – wiersz grupy
- `src/app/features/orders/components/orders-table/orders-table-detail-row.component.ts` – wiersz szczegółowy
- `src/app/features/orders/components/orders-table/orders-table.component.spec.ts`

### Shared

- `src/app/shared/components/app-header.component.ts` – nagłówek (nav + theme toggle)
- `src/app/shared/components/button.component.ts` – przycisk
- `src/app/shared/components/svg-icon.component.ts` – wrapper ikon SVG
- `src/app/shared/constants/table.constants.ts` – stałe tabeli (klasy komórek)
- `src/app/shared/constants/date-formats.ts` – formaty dat
- `src/app/shared/utils/format.utils.ts` – `formatSigned`
- `src/app/shared/utils/format.utils.spec.ts` – testy format

### Ikony

- `public/icons/chevron-down.svg`, `chevron-right.svg`, `close.svg`, `close-20.svg`, `theme-sun.svg`, `theme-moon.svg`

---

## 3. ZMIANY W PLIKACH (modified)

### app.config.ts

- Provider APP_CONFIG z `environment` zamiast stałych z plików config
- Import `@env/environment`

### app.html, app.ts

- Nagłówek wydzielony do `AppHeaderComponent` (Skip link, nav, theme toggle)
- Import `AppHeaderComponent` zamiast RouterLink/RouterLinkActive/ThemeToggle bezpośrednio w app

### app.routes.server.ts

- `/` – Prerender
- `/orders` – **RenderMode.Client** (SSR wyłączony dla route z virtual scroll)
- `**` – Prerender

### theme-toggle.component.ts

- Zastąpienie inline SVG komponentem `SvgIconComponent` (theme-sun, theme-moon)
- `text-[var(--color-text)]` → `text-text` (alias Tailwind)

### theme.service.ts

- Refaktoryzacja: `m` → `currentMode` w computed

### index.html

- `var k` → `var key` (naprawiony błąd – wcześniej `localStorage.getItem(k)` przy `key`)

### styles.css

- `:root` → `@theme` (Tailwind v4)
- Dodane reguły `.orders-table`: `width: 75rem`, `min-width: 75rem`
- Dodane reguły `.orders-table col`: kolumny 1–7 po 10rem, kolumna 8 po 5rem

### tsconfig.json

- Nowe aliasy: `@shared/*` → `src/app/shared/*`, `@env/*` → `src/environments/*`

### orders-api.service.ts

- Import z `ORDERS_API_URL` na `APP_CONFIG` + `this.config.ordersUrl`
- `res` → `response`

### instruments.service.ts

- Import z configów na APP_CONFIG + `instrumentsUrl`, `contractTypesUrl`
- Refaktoryzacja zmiennych: `ctByType` → `contractSizeByType`, `map` → `symbolToSize`, `inst` → `instrument`

### orders.store.ts

- Import `QuotesService` z `@core/quotes/` zamiast `@core/orders/`
- Wyciągnięcie `groupOrdersBySymbol`, `orderProfit` do `@core/utils/order-utils`
- **Optymalizacje:**
  - `wsMaxSubscribedSymbols` – limit subskrybowanych symboli (cap)
  - `QUOTE_SYNC_DEBOUNCE_MS: 80` – debounce synchronizacji subskrypcji
  - `quoteSyncTimer` – opóźnione wykonanie sync przy połączeniu
- Zmiana nazw: `o` → `order`, `s` → `symbol`, `map` → `profitMap`

### orders.page.ts

- Ścieżki importu: `components/orders-table/`, `components/add-order-modal/`
- Import `ButtonComponent`, `formatSigned`
- Layout: `h-screen overflow-hidden flex flex-col`, `max-h-[60vh]` na kontenerze tabeli
- Nagłówek: `shrink-0`, responsywne `flex-col`/`sm:flex-row`
- Przycisk „Add New Order”: `button` → `app-button`
- `totalProfitFormatted`: własna logika → `formatSigned(this.totalProfit(), 2)`
- Usunięte `ngSkipHydration` z tabeli
- Footer: `flex-col gap-2 sm:flex-row` zamiast `flex items-center justify-between`

### order.model.ts

- Rozszerzenie typu Quote o pola `s`, `b` (format WebSocket)

### notification-snackbar.component.ts

- Drobna zmiana (2 linie)

### home.page.ts

- Zmiany importów / layoutu (10 linii)

---

## 4. OPTYMALIZACJE (nowy kod w quotes.service.ts + orders.store.ts)

| Optymalizacja | Gdzie | Opis |
|---------------|-------|------|
| **Ping/Pong** | QuotesService | Co 15s ping; brak pongu przez 30s → zamknięcie + reconnect |
| **Symbol cap** | OrdersStore | `wsMaxSubscribedSymbols: 1000` – max subskrybowanych symboli |
| **Batch subscribe** | QuotesService | `wsSubscribeBatchSize: 100` – subskrypcja partiami |
| **Quote buffer** | QuotesService | `wsQuoteBufferMs: 80` – buforowanie aktualizacji notowań co 80ms |
| **Debounce sync** | OrdersStore | 80ms opóźnienie przed subscribe gdy WS connected |

---

## 5. ZMIANY UI (faktycznie wprowadzone)

- **Tabela:** virtual scroll (CDK), nagłówek poza viewportem, stała szerokość 75rem, wyrównanie kolumn (text-center/text-left, tabular-nums)
- **Layout strony orders:** wysokość ekranu, `max-h-[60vh]` na tabeli, responsywny header i footer
- **Przycisk:** `ButtonComponent` zamiast zwykłego `button`
- **Nagłówek:** `AppHeaderComponent` (Skip link, nav, theme toggle)
- **Ikony:** SvgIconComponent + pliki SVG w `public/icons/`

---

## 6. NAPRAWIONY BUG

- `index.html`: `var key = 'geek-soft-theme'` ale `localStorage.getItem(k)` – poprawione na `localStorage.getItem(key)`.

---

## 7. CO NIE ZOSTAŁO DODANE

- Dark mode – był wcześniej, zmiany to refaktoryzacja (ikony, header)
- Nowe funkcje biznesowe – brak
