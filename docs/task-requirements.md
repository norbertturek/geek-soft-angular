# Zadanie -- Orders Table

## Wymagania

1. Dane do tabeli powinny być ściągane za pomocą requestu HTTP z url:
   - https://geeksoft.pl/assets/2026-task/order-data.json -- lista zleceń
   - https://geeksoft.pl/assets/2026-task/instruments.json -- lista instrumentów
   - https://geeksoft.pl/assets/2026-task/contract-types.json -- lista wartość contractSize per contractType instrumentów

2. Tabela powinna grupować zlecenia wg pola "symbol".

3. Na początku tabela powinna prezentować wyłącznie grupy symboli jako wiersze.

4. Wiersz z informacją o grupie symboli powinien prezentować tylko wartości w kolumnach: symbol (oraz liczba zleceń z danego symbolu), open price, swap, profit, size (wartości powinny być zsumowane, open price uśredniony).

5. Po kliknięciu na dowolny wiersz z nazwą grupy rozwijamy pod spodem wiersze prezentujące pełne dane (w kolumnach) zleceń z danego symbolu (openTime powinien prezentować datę w formacie: 20.06.2025 18:30:22).

6. Na końcu każdego wiersza powinien być button (lub ikona zamknięcie) który spowoduje usunięcie danego wiersza lub grupy zleceń.

7. Po kliknięciu na button/ikonkę zamknięcia powinien zostać wyświetlony komunikat o treści: "Zamknięto zlecenie nr xxx" (gdzie xxx to numer zlecenia lub jeśli zamknięto grupę orderów -- numery zleceń kolejno po przecinku), komunikat może być dowolny w postaci alertu/snackbara.

8. Kolumna profit powinna być wyliczana ze wzoru:

   ```
   (priceBid - openPrice) * size * contractSize * sideMultiplier
   ```

   gdzie:
   - `contractSize`: wartość contract size z pliku contract-types.json dla właściwego instrumentu
   - `sideMultiplier`: 1 dla zlecenia z side równym BUY, w przeciwnym wypadku -1
   - `size`: wartość z danych orderu
   - `openPrice`: wartość z danych orderu
   - `priceBid`: aktualna wartość 'b' z kwotowań otrzymanych przez WebSocket: `wss://webquotes.geeksoft.pl/websocket/quotes`

   Subskrypcja na zmiany:
   ```json
   { "p": "/subscribe/addlist", "d": ["BTCUSD", "ETHUSD"] }
   ```

   Odpowiedź serwera:
   ```json
   {
     "p": "/quotes/subscribed",
     "d": [
       { "s": "ETHUSD", "b": 2134.69, "a": 2138.28, "t": 1770283819 },
       { "s": "BTCUSD", "b": 71633.65, "a": 71800.33, "t": 1770283819 }
     ]
   }
   ```

   Odsubskrybowanie:
   ```json
   { "p": "/subscribe/removelist", "d": ["BTCUSD"] }
   ```

9. W aplikacji powinien zostać zastosowany dowolny mechanizm zarządzania stanem do przechowywania: listy orderów, aktualnych kwotowań.

10. Aplikacja powinna zawierać formularz umożliwiający dodanie nowego zlecenia:
    - formularz powinien umożliwiać wybór jednego z symboli istniejących w pliku order-data.json
    - formularz powinien zawierać pola wymagane do poprawnego wyliczenia profitu (symbol, side, size, openPrice -- aktualna cena, openTime)
    - nowe zlecenie nie jest wysyłane na backend -- powinno zostać dodane wyłącznie do stanu aplikacji
    - formularz powinien zawierać podstawową walidację (np. wymagane pola, wartości liczbowe > 0)
