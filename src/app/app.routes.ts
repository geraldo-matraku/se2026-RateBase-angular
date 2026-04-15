import { Routes } from '@angular/router';
import { authGuard } from './core/guards/authGuard';
import { nonAuthGuard } from './core/guards/nonAuthGuard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [nonAuthGuard],
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [nonAuthGuard],
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    redirectTo: 'categories',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () => import('./main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'categories',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/categories/categories').then((m) => m.Categories),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'categories',
  },
];
