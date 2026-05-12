import { Component, inject } from '@angular/core';
import { CategoryProductStore } from './store/category-products-store';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, tap } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CategoriesService } from '../categories/services/categoriesService';
import { FormsModule } from '@angular/forms';
import { Spinner } from '../../shared/spinner/spinner';
import { RoleDirective } from '../../shared/directives/role-directive';

@Component({
  selector: 'app-category-products',
  imports: [AsyncPipe, FormsModule, CommonModule, Spinner, RouterLink, RoleDirective],
  templateUrl: './category-products.html',
  styleUrl: './category-products.scss',
})
export class CategoryProducts {
  store = inject(CategoryProductStore);
  activatedRoute = inject(ActivatedRoute);
  searchParam: string | null = null;
  categoriesService = inject(CategoriesService);
  imgBase = this.categoriesService.uploadUrl;
  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        tap((data) => console.log(data)),
        map((params) => params['catId']),
        map((id) => Number(id)),
      )
      .subscribe((categoryId) => {
        if (categoryId) {
          this.store.loadProducts(categoryId);
        }
      });
  }

  onSearchChange(val: string) {
    console.log('Search:', val);
  }
}
