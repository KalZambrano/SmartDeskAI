import { Routes } from '@angular/router';
import { AppShell } from '@/layout/app-shell';
import { authGuard } from '@/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'incidencias' },
      {
        path: 'login',
        loadComponent: () => import('@/features/auth/login-page').then((m) => m.LoginPage),
      },
      {
        path: 'incidencias',
        canActivate: [authGuard],
        loadComponent: () =>
          import('@/features/tickets/ticket-list-page').then((m) => m.TicketListPage),
      },
      {
        path: 'incidencias/nueva',
        canActivate: [authGuard],
        loadComponent: () =>
          import('@/features/tickets/ticket-create-page').then((m) => m.TicketCreatePage),
      },
      {
        path: 'incidencias/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('@/features/tickets/ticket-detail-page').then((m) => m.TicketDetailPage),
      },
      {
        path: 'estado',
        title: 'Estado del sistema · SmartDesk AI',
        loadComponent: () => import('@/features/status/status-page').then((m) => m.StatusPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
