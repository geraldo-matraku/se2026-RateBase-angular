import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthStore } from '../services/authStore';
import { filter, map, switchMap, take, Observable } from 'rxjs';

export const authGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.initialized$.pipe(
    filter((initialized) => initialized === true),
    take(1),

    switchMap(() => authStore.user$),
    map((user) => {
      if (user) {
        return true;
      }

      return router.createUrlTree(['/login']);
    }),
  );
};
