import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductDetailsStore } from './store/product-details-store';
import { AsyncPipe, DatePipe } from '@angular/common';
import { map, tap } from 'rxjs';
import { RoleDirective } from '../../shared/directives/role-directive';
import { CategoriesService } from '../categories/services/categoriesService';

@Component({
  selector: 'app-product-details',
  imports: [AsyncPipe, DatePipe, RoleDirective],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails {
  private activatedRoute = inject(ActivatedRoute);
  private categoriesService = inject(CategoriesService);

  readonly store = inject(ProductDetailsStore);

  product$ = this.store.product$;

  reviews$ = this.store.reviews$;

  loading$ = this.store.loading$;
  imgBase = this.categoriesService.uploadUrl;

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        tap((data) => console.log(data)),
        map((params) => params['prodId']),
        map((id) => Number(id)),
      )
      .subscribe((prodId) => {
        if (prodId) {
          this.store.fetchProductDetails(prodId);
        }
      });
  }
}
