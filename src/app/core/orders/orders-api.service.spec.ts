import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { OrdersApiService } from './orders-api.service';
import { ORDERS_API_URL } from './orders-api.config';
import type { Order } from '../models/order.model';

describe('OrdersApiService', () => {
  let service: OrdersApiService;
  let httpCtrl: HttpTestingController;

  const mockOrders: Order[] = [
    {
      id: 1203384,
      symbol: 'BTCUSD',
      side: 'BUY',
      size: 0.05,
      openPrice: 104837.47,
      openTime: 1750740422000,
      swap: -0.00147939,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrdersApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(OrdersApiService);
    httpCtrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpCtrl.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch orders and return mapped Order[]', async () => {
    const ordersPromise = firstValueFrom(service.fetchOrders());
    const req = httpCtrl.expectOne(
      ORDERS_API_URL
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockOrders });

    const orders = await ordersPromise;
    expect(orders).toEqual(mockOrders);
    expect(orders).toHaveLength(1);
    expect(orders[0].symbol).toBe('BTCUSD');
  });

  it('should return empty array when data is missing', async () => {
    const ordersPromise = firstValueFrom(service.fetchOrders());
    const req = httpCtrl.expectOne(
      ORDERS_API_URL
    );
    req.flush({});

    const orders = await ordersPromise;
    expect(orders).toEqual([]);
  });

  it('should return empty array when data is not an array', async () => {
    const ordersPromise = firstValueFrom(service.fetchOrders());
    const req = httpCtrl.expectOne(
      ORDERS_API_URL
    );
    req.flush({ data: 'invalid' });

    const orders = await ordersPromise;
    expect(orders).toEqual([]);
  });

  it('should propagate HTTP errors to subscriber', async () => {
    const ordersPromise = firstValueFrom(service.fetchOrders());
    const req = httpCtrl.expectOne(
      ORDERS_API_URL
    );
    req.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(ordersPromise).rejects.toMatchObject({
      status: 500,
      statusText: 'Internal Server Error',
    });
  });
});
