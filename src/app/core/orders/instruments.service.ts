import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, tap } from 'rxjs';
import type { ContractType, Instrument } from '@core/models/order.model';
import { APP_CONFIG } from '@core/config/app-config.token';

/** symbol -> contractSize */
export type SymbolContractSizeMap = Map<string, number>;

@Injectable({ providedIn: 'root' })
export class InstrumentsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  readonly contractSizes = signal<SymbolContractSizeMap>(new Map());
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadContractSizes(): Observable<SymbolContractSizeMap> {
    this.loading.set(true);
    this.error.set(null);

    return forkJoin({
      instruments: this.http.get<Instrument[]>(this.config.instrumentsUrl),
      contractTypes: this.http.get<ContractType[]>(this.config.contractTypesUrl),
    }).pipe(
      map(({ instruments, contractTypes }) => {
        const contractSizeByType = new Map<number, number>();
        for (const contractType of contractTypes ?? []) {
          contractSizeByType.set(contractType.contractType, contractType.contractSize);
        }
        const symbolToSize = new Map<string, number>();
        for (const instrument of instruments ?? []) {
          const size = contractSizeByType.get(instrument.contractType) ?? 1;
          symbolToSize.set(instrument.symbol, size);
        }
        return symbolToSize;
      }),
      tap({
        next: (symbolToSize) => {
          this.contractSizes.set(symbolToSize);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error?.message ?? 'Failed to load instruments');
          this.loading.set(false);
        },
      })
    );
  }

  getContractSize(symbol: string): number {
    return this.contractSizes().get(symbol) ?? 1;
  }
}
