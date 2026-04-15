import { CanActivate, CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthStore } from '../services/authStore';
import { inject } from '@angular/core';
import { map, Observable } from 'rxjs';

export const authGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.user$.pipe(
    map((user) => {
      if (user) {
        return true;
      }

      return router.createUrlTree(['/login']);
    }),
  );
};
