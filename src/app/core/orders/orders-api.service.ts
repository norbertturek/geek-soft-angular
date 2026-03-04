import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import type { Order, OrdersApiResponse } from '../models/order.model';
import { ORDERS_API_URL } from './orders-api.config';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);

  fetchOrders(): Observable<Order[]> {
    return this.http.get<OrdersApiResponse>(ORDERS_API_URL).pipe(
      map((res) => (Array.isArray(res?.data) ? res.data : []))
    );
  }
}
