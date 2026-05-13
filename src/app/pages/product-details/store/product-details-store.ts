import { Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { forkJoin, switchMap, tap } from 'rxjs';

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
  private productService = inject(ProductDetailsService);
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
          product: this.productService.getProductById(productId),
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
}
