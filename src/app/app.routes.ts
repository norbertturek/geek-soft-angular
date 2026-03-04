import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@app/features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('@app/features/orders/orders.page').then((m) => m.OrdersPage),
  },
  { path: '**', redirectTo: '/' },
];
