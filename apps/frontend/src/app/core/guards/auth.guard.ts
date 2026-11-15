import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '@/core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.token) return router.createUrlTree(['/login']);
  return auth.currentUser().pipe(
    map(() => true),
    catchError(() => {
      auth.logout();
      return of(router.createUrlTree(['/login']));
    }),
  );
};

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as readonly string[] | undefined;
  if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
  return allowedRoles?.includes(auth.user()?.role ?? '')
    ? true
    : router.createUrlTree(['/incidencias']);
};
