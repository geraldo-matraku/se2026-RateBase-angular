import { Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { catchError, EMPTY, pipe, switchMap, tap, map, delay, debounceTime } from 'rxjs';
import {
  CategoryProductService,
  CreateProductPayload,
  Product,
} from '../services/category-products-service';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class CategoryProductStore extends ComponentStore<ProductState> {
  private categoryProductsService = inject(CategoryProductService);

  constructor() {
    super({ products: [], loading: false, error: null });
  }

  readonly products$ = this.select((state) => state.products);
  readonly loading$ = this.select((state) => state.loading);
  readonly error$ = this.select((state) => state.error);

  readonly setProducts = this.updater((state, products: Product[]) => ({
    ...state,
    products,
    loading: false,
    error: null,
  }));

  readonly setLoading = this.updater((state, loading: boolean) => ({
    ...state,
    loading,
  }));

  readonly setError = this.updater((state, error: string | null) => ({
    ...state,
    error,
    loading: false,
  }));

  readonly loadProducts = this.effect<number>(
    pipe(
      tap(() => {
        this.patchState({ loading: true, error: null, products: [] });
      }),
      switchMap((categoryId) =>
        this.categoryProductsService.getProductsByCategory(categoryId).pipe(
          delay(500),
          map((res: any) => {
            if (Array.isArray(res)) {
              return res;
            } else if (res && typeof res === 'object') {
              return (
                res.data || res.products || Object.values(res).find((v) => Array.isArray(v)) || []
              );
            }
            return [];
          }),
          tap((products) => {
            this.patchState({ products, loading: false });
          }),
          catchError((error) => {
            console.error('Gabimi gjate marrjes se produkteve:', error);
            this.patchState({
              error: 'Nuk u ngarkuan produktet. Kontrolloni lidhjen me serverin.',
              loading: false,
              products: [],
            });
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  readonly createProduct = this.effect((formData$: any) =>
    formData$.pipe(
      tap(() => this.patchState({ loading: true, error: null })),

      switchMap((formData: FormData) =>
        this.categoryProductsService.createProduct(formData).pipe(
          tap({
            next: () => {
              this.patchState({ loading: false });

              const categoryId = this.get().products?.[0]?.category_id;
              if (categoryId) {
                this.loadProducts(categoryId);
              }
            },
            error: (err) => {
              this.patchState({
                loading: false,
                error: err.error?.message || 'Create failed',
              });
            },
          }),
          catchError(() => EMPTY),
        ),
      ),
    ),
  );
  readonly deleteProduct = this.effect<number>(
    pipe(
      tap(() => this.patchState({ loading: true, error: null })),
      switchMap((productId) =>
        this.categoryProductsService.deleteProduct(productId).pipe(
          tap(() => {
            const categoryId = this.get().products?.[0]?.category_id;
            if (categoryId) {
              this.loadProducts(categoryId);
            }
          }),
          catchError((err) => {
            console.error('Gabimi gjate fshirjes se produktit:', err);
            this.patchState({
              loading: false,
              error: err.error?.message || 'Fshirja deshtoi. Provoni perseri.',
            });
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  readonly updateProduct = this.effect<{ id: number; formData: FormData }>(
    pipe(
      tap(() => this.patchState({ loading: true, error: null })),
      switchMap(({ id, formData }) =>
        this.categoryProductsService.updateProduct(id, formData).pipe(
          tap(() => {
            const categoryId = this.get().products?.[0]?.category_id;
            if (categoryId) {
              this.loadProducts(categoryId);
            }
          }),
          catchError((err) => {
            console.error('Gabimi gjate updateit te produktit:', err);
            this.patchState({
              loading: false,
              error: err.error?.message || 'Perditesimi deshtoi. Provoni perseri.',
            });
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  readonly searchProducts = this.effect<{ categoryId: number; query: string }>(
    pipe(
      debounceTime(500),
      tap(() => this.patchState({ loading: true, error: null })),
      switchMap(({ categoryId, query }) =>
        this.categoryProductsService.searchProductsByCategory(categoryId, query).pipe(
          map((res: any) => res.data || []),
          tap((products) => {
            this.patchState({ products, loading: false });
          }),
          catchError((err) => {
            this.patchState({
              loading: false,
              error: err.error?.message || 'Kerkimi deshtoi.',
            });
            return EMPTY;
          }),
        ),
      ),
    ),
  );
}
