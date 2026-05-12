import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { CategoriesService, Category } from '../services/categoriesService';

export interface CategoriesState {
  data: Category[];
  total_categories: number;
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  data: [],
  total_categories: 0,
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class CategoriesStore extends ComponentStore<CategoriesState> {
  private categoriesService = inject(CategoriesService);

  constructor() {
    super(initialState);
  }

  readonly categories$ = this.select((state) => state.data);
  readonly totalCategories$ = this.select((state) => state.total_categories);
  readonly loading$ = this.select((state) => state.loading);
  readonly error$ = this.select((state) => state.error);

  private setLoading = this.updater((state, loading: boolean) => ({
    ...state,
    loading,
  }));

  private setError = this.updater((state, error: string | null) => ({
    ...state,
    error,
  }));

  private setCategoriesResponse = this.updater(
    (state, res: { data: Category[]; total_categories: number }) => ({
      ...state,
      data: res.data,
      total_categories: res.total_categories,
    }),
  );

  readonly loadCategories = this.effect<void>((trigger$) =>
    trigger$.pipe(
      tap(() => {
        this.setLoading(true);
        this.setError(null);
      }),
      switchMap(() =>
        this.categoriesService.getCategories().pipe(
          tap({
            next: (res) => {
              this.setCategoriesResponse({
                data: res.data,
                total_categories: res.total_categories,
              });
              this.setLoading(false);
            },
            error: () => {
              this.setError('Failed to load categories');
              this.setLoading(false);
            },
          }),
        ),
      ),
    ),
  );

  readonly searchCategories = this.effect<string>((query$) =>
    query$.pipe(
      debounceTime(500),
      tap(() => {
        this.setLoading(true);
        this.setError(null);
      }),
      switchMap((q) =>
        this.categoriesService.searchCategories(q).pipe(
          tap({
            next: (res) => {
              this.setCategoriesResponse({
                data: res.data,
                total_categories: res.total_categories,
              });
              this.setLoading(false);
            },
            error: () => {
              this.setError('Search failed');
              this.setLoading(false);
            },
          }),
        ),
      ),
    ),
  );
}
