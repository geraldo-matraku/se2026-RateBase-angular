import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthStore } from '../services/authStore';
import { inject } from '@angular/core';

export const nonAuthGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.user$.pipe(
    map((user) => {
      if (user) {
        return router.createUrlTree(['/categories']);
      }

      return true;
    }),
  );
};
