import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, tap } from 'rxjs';
import type { ContractType, Instrument } from '@core/models/order.model';
import {
  CONTRACT_TYPES_API_URL,
  INSTRUMENTS_API_URL,
} from '@core/orders/instruments-api.config';

/** symbol -> contractSize */
export type SymbolContractSizeMap = Map<string, number>;

@Injectable({ providedIn: 'root' })
export class InstrumentsService {
  private readonly http = inject(HttpClient);

  readonly contractSizes = signal<SymbolContractSizeMap>(new Map());
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadContractSizes(): Observable<SymbolContractSizeMap> {
    this.loading.set(true);
    this.error.set(null);

    return forkJoin({
      instruments: this.http.get<Instrument[]>(INSTRUMENTS_API_URL),
      contractTypes: this.http.get<ContractType[]>(CONTRACT_TYPES_API_URL),
    }).pipe(
      map(({ instruments, contractTypes }) => {
        const ctByType = new Map<number, number>();
        for (const ct of contractTypes ?? []) {
          ctByType.set(ct.contractType, ct.contractSize);
        }
        const map = new Map<string, number>();
        for (const inst of instruments ?? []) {
          const size = ctByType.get(inst.contractType) ?? 1;
          map.set(inst.symbol, size);
        }
        return map;
      }),
      tap({
        next: (map) => {
          this.contractSizes.set(map);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Failed to load instruments');
          this.loading.set(false);
        },
      })
    );
  }

  getContractSize(symbol: string): number {
    return this.contractSizes().get(symbol) ?? 1;
  }
}
