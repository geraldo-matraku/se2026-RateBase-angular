import { Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { catchError, EMPTY, pipe, switchMap, tap, map } from 'rxjs'; // Shtuar 'map'
import { CategoryProductService, Product } from '../services/category-products-service';

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

  // SELECTORS
  readonly products$ = this.select((state) => state.products);
  readonly loading$ = this.select((state) => state.loading);
  readonly error$ = this.select((state) => state.error);

  // UPDATERS
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

  // EFFECTS
  readonly loadProducts = this.effect<number>(
    pipe(
      tap(() => {
        // Resetohet gjendja para ngarkimit të ri
        this.patchState({ loading: true, error: null, products: [] });
      }),
      switchMap((categoryId) =>
        this.categoryProductsService.getProductsByCategory(categoryId).pipe(
          // KORRIGJIMI: Ky bllok siguron që Response i API kthehet gjithmonë në Array
          map((res: any) => {
            if (Array.isArray(res)) {
              return res;
            } else if (res && typeof res === 'object') {
              // Nëse API kthen { data: [...] } ose { products: [...] }
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
            console.error('Gabimi gjatë marrjes së produkteve:', error);
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
}
