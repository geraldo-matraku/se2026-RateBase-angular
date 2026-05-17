import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductDetailsStore } from './store/product-details-store';
import { AsyncPipe, DatePipe } from '@angular/common';
import { firstValueFrom, map, tap } from 'rxjs';
import { CategoriesService } from '../categories/services/categoriesService';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { AdminOrOwnerDirective } from '../../shared/directives/reviewRole-directive';
import { PaymentService } from '../../core/services/payments-service';
import { environments } from '../../../environments/environments';

interface PaddleCheckoutEvent {
  name?: string;
}

interface PaddleWindow {
  Environment: {
    set: (environment: 'sandbox' | 'production') => void;
  };
  Initialize: (options: {
    token: string;
    eventCallback?: (event: PaddleCheckoutEvent) => void;
  }) => void;
  Checkout: {
    open: (options: {
      items: Array<{
        priceId: string;
        quantity: number;
      }>;
      customData?: Record<string, string | number | boolean>;
      settings?: {
        displayMode?: 'overlay' | 'inline';
        theme?: 'light' | 'dark';
      };
    }) => void;
  };
}

declare global {
  interface Window {
    Paddle?: PaddleWindow;
  }
}

interface ProductReview {
  review_id: number;
  rating: number;
  comment: string;
}

type DonationOption = (typeof environments.paddle.prices)[number];

@Component({
  selector: 'app-product-details',
  imports: [AsyncPipe, DatePipe, ReactiveFormsModule, AdminOrOwnerDirective],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private categoriesService = inject(CategoriesService);
  private paymentService = inject(PaymentService);
  private fb = inject(FormBuilder);

  readonly store = inject(ProductDetailsStore);

  product$ = this.store.product$;
  reviews$ = this.store.reviews$;
  loading$ = this.store.loading$;
  imgBase = this.categoriesService.uploadUrl;

  productId!: number;

  showReviewModal = false;
  hoveredStar = 0;

  reviewForm: FormGroup = this.fb.group({
    rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required]],
  });

  showPaymentModal = false;
  paymentSuccess = false;
  paymentError: string | null = null;
  paymentLoading = false;

  donationOptions = environments.paddle.prices;
  selectedDonation: DonationOption | null = null;
  selectedAmount: number | null = null;

  private paddleInitialized = false;
  private pendingPaymentId: number | null = null;

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

  openReviewModal(): void {
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.reviewForm.reset();
    this.hoveredStar = 0;
  }

  onReviewSubmit(): void {
    if (this.reviewForm.invalid) return;

    this.store.createReview({
      product_id: this.productId,
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment,
    });

    this.closeReviewModal();
  }

  showDeleteReviewModal = false;
  reviewToDelete: { id: number; name: string } | null = null;

  openDeleteReviewModal(id: number, name: string): void {
    this.reviewToDelete = { id, name };
    this.showDeleteReviewModal = true;
  }

  closeDeleteReviewModal(): void {
    this.showDeleteReviewModal = false;
    this.reviewToDelete = null;
  }

  confirmDeleteReview(): void {
    if (this.reviewToDelete) {
      this.store.deleteReview(this.reviewToDelete.id);
      this.closeDeleteReviewModal();
    }
  }

  showEditReviewModal = false;
  selectedReviewId: number | null = null;
  hoveredEditStar = 0;

  reviewEditForm: FormGroup = this.fb.group({
    rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required]],
  });

  openEditReviewModal(review: ProductReview): void {
    this.selectedReviewId = review.review_id;
    this.reviewEditForm.patchValue({
      rating: review.rating,
      comment: review.comment,
    });
    this.showEditReviewModal = true;
  }

  closeEditReviewModal(): void {
    this.showEditReviewModal = false;
    this.selectedReviewId = null;
    this.hoveredEditStar = 0;
    this.reviewEditForm.reset();
  }

  onEditReviewSubmit(): void {
    if (!this.selectedReviewId || this.reviewEditForm.invalid) return;

    this.store.updateReview({
      id: this.selectedReviewId,
      rating: this.reviewEditForm.value.rating,
      comment: this.reviewEditForm.value.comment,
    });

    this.closeEditReviewModal();
  }

  openPaymentModal(): void {
    this.showPaymentModal = true;
    this.paymentSuccess = false;
    this.paymentError = null;
    this.paymentLoading = false;

    this.selectedDonation = null;
    this.selectedAmount = null;
    this.pendingPaymentId = null;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.paymentSuccess = false;
    this.paymentError = null;
    this.paymentLoading = false;

    this.selectedDonation = null;
    this.selectedAmount = null;
    this.pendingPaymentId = null;
  }

  onAmountChange(donation: DonationOption): void {
    this.selectedDonation = donation;
    this.selectedAmount = donation.amount;
    this.paymentError = null;
  }

  async payWithPaddle(): Promise<void> {
    this.paymentLoading = true;
    this.paymentError = null;
    this.paymentSuccess = false;

    if (!this.selectedDonation || !this.selectedAmount) {
      this.paymentError = 'Ju lutem zgjidhni një shumë për donacionin.';
      this.paymentLoading = false;
      return;
    }

    try {
      const response = await firstValueFrom(this.paymentService.createOrder(this.selectedAmount));

      this.pendingPaymentId = response.payment.payment_id;

      this.initializePaddle(environments.paddle.clientToken, environments.paddle.environment);

      if (!window.Paddle) {
        this.paymentError = 'Paddle nuk u ngarkua. Kontrollo script-in ne index.html.';
        this.paymentLoading = false;
        return;
      }

      if (!this.selectedDonation.priceId?.startsWith('pri_')) {
        this.paymentError = 'Paddle Price ID duhet te filloje me pri_.';
        this.paymentLoading = false;
        return;
      }

      window.Paddle.Checkout.open({
        items: [
          {
            priceId: this.selectedDonation.priceId,
            quantity: 1,
          },
        ],
        customData: {
          payment_id: response.payment.payment_id,
          user_id: response.payment.user_id,
          amount: response.payment.amount,
          selected_price_id: this.selectedDonation.priceId,
        },
        settings: {
          displayMode: 'overlay',
          theme: 'light',
        },
      });
    } catch (error) {
      console.error(error);
      this.paymentError = 'Nuk u hap pagesa. Provoni perseri.';
      this.paymentLoading = false;
    }
  }

  private initializePaddle(clientToken: string, environment: 'sandbox' | 'production'): void {
    if (!window.Paddle) {
      this.paymentError = 'Paddle nuk u ngarkua. Kontrollo script-in ne index.html.';
      this.paymentLoading = false;
      return;
    }

    if (this.paddleInitialized) {
      return;
    }

    if (environment === 'sandbox') {
      window.Paddle.Environment.set('sandbox');
    }

    window.Paddle.Initialize({
      token: clientToken,
      eventCallback: async (event: PaddleCheckoutEvent) => {
        if (event.name === 'checkout.completed') {
          await this.completePaddlePayment();
          return;
        }

        if (event.name === 'checkout.closed' && !this.paymentSuccess) {
          this.paymentLoading = false;
        }
      },
    });

    this.paddleInitialized = true;
  }

  private async completePaddlePayment(): Promise<void> {
    if (!this.pendingPaymentId) {
      this.paymentError = 'Payment ID mungon.';
      this.paymentLoading = false;
      return;
    }

    try {
      await firstValueFrom(this.paymentService.captureOrder(this.pendingPaymentId));

      this.paymentSuccess = true;
      this.paymentError = null;
      this.pendingPaymentId = null;
    } catch (error) {
      console.error(error);
      this.paymentError = 'Pagesa u krye, por konfirmimi deshtoi.';
    } finally {
      this.paymentLoading = false;
    }
  }
}
