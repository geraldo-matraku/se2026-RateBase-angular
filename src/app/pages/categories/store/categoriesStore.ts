import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { catchError, debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { CategoriesService, Category } from '../services/categoriesService';
import { EMPTY, Observable } from 'rxjs';

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
          delay(500),
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

  readonly addCategory = this.effect((formData$: Observable<FormData>) => {
    return formData$.pipe(
      tap(() => this.patchState({ loading: true, error: null })),

      switchMap((formData) =>
        this.categoriesService.createCategory(formData).pipe(
          tap({
            next: (response) => {
              this.patchState({ loading: false });
              this.loadCategories();
            },
            error: (err) => {
              const errorMessage = err.error?.message || 'Gabim gjate krijimit te kategorise';
              this.patchState({ error: errorMessage, loading: false });
            },
          }),
          catchError(() => EMPTY),
        ),
      ),
    );
  });

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
  readonly deleteCategory = this.effect((id$: Observable<number>) => {
    return id$.pipe(
      tap(() => this.patchState({ loading: true, error: null })),
      switchMap((id) =>
        this.categoriesService.deleteCategory(id).pipe(
          tap({
            next: () => {
              this.patchState({ loading: false });
              this.loadCategories();
            },
            error: (err) => {
              const errorMessage = err.error?.message || 'Gabim gjate fshirjes se kategorise';
              this.patchState({ error: errorMessage, loading: false });
            },
          }),
          catchError(() => EMPTY),
        ),
      ),
    );
  });

  readonly editCategory = this.effect((data$: Observable<{ id: number; formData: FormData }>) => {
    return data$.pipe(
      tap(() => this.patchState({ loading: true, error: null })),

      switchMap(({ id, formData }) =>
        this.categoriesService.updateCategory(id, formData).pipe(
          tap({
            next: () => {
              this.patchState({ loading: false });
              this.loadCategories();
            },
            error: (err) => {
              const errorMessage = err.error?.message || 'Gabim gjate editimit te kategorise';

              this.patchState({
                error: errorMessage,
                loading: false,
              });
            },
          }),
          catchError(() => EMPTY),
        ),
      ),
    );
  });
}
