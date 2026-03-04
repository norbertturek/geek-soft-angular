import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/orders', pathMatch: 'full' },
  {
    path: 'orders',
    loadComponent: () =>
      import('@app/features/orders/orders.page').then((m) => m.OrdersPage),
  },
  { path: '**', redirectTo: '/orders' },
];
