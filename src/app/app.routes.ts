import { Routes } from '@angular/router';
import { authGuard } from './core/guards/authGuard';
import { nonAuthGuard } from './core/guards/nonAuthGuard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
    canActivate: [nonAuthGuard],
  },
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
    loadComponent: () => import('./main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'categories',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/categories/categories').then((m) => m.CategoriesComponent),
      },
      {
        path: 'categories/:catId',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/category-products/category-products').then((m) => m.CategoryProducts),
      },
      {
        path: 'categories/:catId/:prodId',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/product-details/product-details').then((m) => m.ProductDetails),
      },
      {
        path: 'myreviews',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/my-reviews/my-reviews').then((m) => m.MyReviews),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
