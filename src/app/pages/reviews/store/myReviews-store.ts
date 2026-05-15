// my-reviews-store.ts
import { Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { ReviewsService } from '../services/reviews-service';

interface MyReviewsState {
  reviews: any[];
  totalReviews: number;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class MyReviewsStore extends ComponentStore<MyReviewsState> {
  private reviewsService = inject(ReviewsService);
  constructor() {
    super({ reviews: [], totalReviews: 0, loading: false, error: null });
  }

  readonly reviews$ = this.select((state) => state.reviews);
  readonly totalReviews$ = this.select((state) => state.totalReviews);
  readonly loading$ = this.select((state) => state.loading);
  readonly error$ = this.select((state) => state.error);

  readonly loadMyReviews = this.effect<void>(
    pipe(
      tap(() => this.patchState({ loading: true, error: null })),
      switchMap(() =>
        this.reviewsService.getMyReviews().pipe(
          tap((res: any) => {
            this.patchState({
              reviews: res.data,
              totalReviews: res.total_reviews,
              loading: false,
            });
          }),
          catchError((err) => {
            this.patchState({
              loading: false,
              error: err.error?.message || 'Ngarkimi deshtoi.',
            });
            return EMPTY;
          }),
        ),
      ),
    ),
  );
}
