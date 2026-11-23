
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route) => {

  const auth = inject(Auth);
  const router = inject(Router);

  const user = auth.getCurrentUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = route.data['roles'] as string[];

  if (allowedRoles && !allowedRoles.includes(user.role)) {

    if (user.role === 'customer') {
      return router.createUrlTree(['/shop']);
    }

    if (user.role === 'employee') {
      return router.createUrlTree(['/billing']);
    }

    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
