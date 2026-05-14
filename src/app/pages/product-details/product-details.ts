import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductDetailsStore } from './store/product-details-store';
import { AsyncPipe, DatePipe } from '@angular/common';
import { map, tap } from 'rxjs';
import { RoleDirective } from '../../shared/directives/role-directive';
import { CategoriesService } from '../categories/services/categoriesService';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  imports: [AsyncPipe, DatePipe, RoleDirective, ReactiveFormsModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private categoriesService = inject(CategoriesService);
  private fb = inject(FormBuilder);

  readonly store = inject(ProductDetailsStore);

  product$ = this.store.product$;
  reviews$ = this.store.reviews$;
  loading$ = this.store.loading$;
  imgBase = this.categoriesService.uploadUrl;

  productId!: number;

  // ── REVIEW MODAL ────────────────────────────────────
  showReviewModal = false;
  hoveredStar = 0;

  reviewForm: FormGroup = this.fb.group({
    rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        tap((data) => console.log(data)),
        map((params) => params['prodId']),
        map((id) => Number(id)),
      )
      .subscribe((prodId) => {
        if (prodId) {
          this.productId = prodId;
          this.store.fetchProductDetails(prodId);
        }
      });
  }

  openReviewModal() {
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.reviewForm.reset();
    this.hoveredStar = 0;
  }

  onReviewSubmit() {
    if (this.reviewForm.invalid) return;

    this.store.createReview({
      product_id: this.productId,
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment,
    });

    this.closeReviewModal();
  }
}
