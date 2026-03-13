import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import type { Order, OrdersApiResponse } from '@core/models/order.model';
import { APP_CONFIG } from '@core/config/app-config.token';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  fetchOrders(): Observable<Order[]> {
    return this.http.get<OrdersApiResponse>(this.config.ordersUrl).pipe(
      map((response) => (Array.isArray(response?.data) ? response.data : []))
    );
  }
}
