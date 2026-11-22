import { Routes } from '@angular/router';
import { AppShell } from '@/layout/app-shell';
import { authGuard, roleGuard } from '@/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · SmartDesk AI',
    loadComponent: () => import('@/features/auth/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · SmartDesk AI',
        loadComponent: () =>
          import('@/features/dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'incidencias',
        loadComponent: () =>
          import('@/features/tickets/ticket-list-page').then((m) => m.TicketListPage),
      },
      {
        path: 'incidencias/nueva',
        canActivate: [roleGuard],
        data: { roles: ['REQUESTER', 'ADMIN'] },
        loadComponent: () =>
          import('@/features/tickets/ticket-create-page').then((m) => m.TicketCreatePage),
      },
      {
        path: 'incidencias/:id',
        loadComponent: () =>
          import('@/features/tickets/ticket-detail-page').then((m) => m.TicketDetailPage),
      },
      {
        path: 'notificaciones',
        title: 'Notificaciones · SmartDesk AI',
        loadComponent: () =>
          import('@/features/notifications/notifications-page').then((m) => m.NotificationsPage),
      },
      {
        path: 'estado',
        loadComponent: () => import('@/features/status/status-page').then((m) => m.StatusPage),
      },
      {
        path: 'maestros/categorias',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('@/features/categories/categories-page').then((m) => m.CategoriesPage),
      },
      {
        path: 'maestros/tecnicos',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('@/features/technicians/technicians-page').then((m) => m.TechniciansPage),
      },
      {
        path: 'maestros/usuarios',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('@/features/users/users-page').then((m) => m.UsersPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
