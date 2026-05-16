import { Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { catchError, EMPTY, forkJoin, pipe, switchMap, tap } from 'rxjs';

import { ProductDetailsService } from '../services/product-details-service';
import { ReviewsService } from '../../reviews/services/reviews-service';

export interface ProductDetailsState {
  product: any | null;
  reviews: any[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductDetailsStore extends ComponentStore<ProductDetailsState> {
  private productDetailsService = inject(ProductDetailsService);
  private reviewService = inject(ReviewsService);

  constructor() {
    super({
      product: null,
      reviews: [],
      loading: false,
      error: null,
    });
  }

  readonly product$ = this.select((state) => state.product);

  readonly reviews$ = this.select((state) => state.reviews);

  readonly loading$ = this.select((state) => state.loading);

  readonly error$ = this.select((state) => state.error);

  readonly fetchProductDetails = this.effect<number>((productId$) =>
    productId$.pipe(
      tap(() => {
        this.patchState({
          loading: true,
          error: null,
        });
      }),

      switchMap((productId) =>
        forkJoin({
          product: this.productDetailsService.getProductById(productId),
          reviews: this.reviewService.getReviewsByProductId(productId),
        }).pipe(
          tap({
            next: ({ product, reviews }) => {
              this.patchState({
                product: product.product,
                reviews: reviews.data,
                loading: false,
              });
            },

            error: () => {
              this.patchState({
                loading: false,
                error: 'Failed to fetch product details',
              });
            },
          }),
        ),
      ),
    ),
  );

  readonly createReview = this.effect<{
    product_id: number;
    rating: number;
    comment: string;
    image?: string;
  }>(
    pipe(
      tap(() => this.patchState({ loading: true, error: null })),
      switchMap((payload) =>
        this.reviewService.createReview(payload).pipe(
          tap({
            next: () => {
              this.fetchProductDetails(payload.product_id);
            },
            error: (err) => {
              this.patchState({
                loading: false,
                error: err.error?.message || 'Krijimi i reviews deshtoi.',
              });
            },
          }),
          catchError(() => EMPTY),
        ),
      ),
    ),
  );

  readonly deleteReview = this.effect<number>(
    pipe(
      tap(() => this.patchState({ loading: true, error: null })),
      switchMap((reviewId) =>
        this.reviewService.deleteReview(reviewId).pipe(
          tap(() => {
            this.fetchProductDetails(this.get().product?.product_id);
          }),
          catchError((err) => {
            this.patchState({
              loading: false,
              error: err.error?.message || 'Fshirja deshtoi.',
            });
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  readonly updateReview = this.effect<{ id: number; rating: number; comment: string }>(
    pipe(
      tap(() => this.patchState({ loading: true, error: null })),
      switchMap(({ id, rating, comment }) =>
        this.reviewService.updateReview(id, { rating, comment }).pipe(
          tap(() => {
            this.fetchProductDetails(this.get().product?.product_id);
          }),
          catchError((err) => {
            this.patchState({
              loading: false,
              error: err.error?.message || 'Perditesimi deshtoi.',
            });
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  readonly voteReview = this.effect<{ review_id: number; type: 'up' | 'down' }>(
    pipe(
      switchMap(({ review_id, type }) =>
        this.reviewService.vote(review_id, type).pipe(
          tap((res: any) => {
            const reviews = this.get().reviews.map((r) =>
              r.review_id === review_id
                ? {
                    ...r,
                    up_count: res.up_count,
                    down_count: res.down_count,
                    my_vote: res.action === 'removed' ? null : type,
                  }
                : r,
            );
            this.patchState({ reviews });
          }),
          catchError(() => EMPTY),
        ),
      ),
    ),
  );
}
