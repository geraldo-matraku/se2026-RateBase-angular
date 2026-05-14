import { Component, inject } from '@angular/core';
import { CategoryProductStore } from './store/category-products-store';
import { ActivatedRoute } from '@angular/router';
import { map, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoriesService } from '../categories/services/categoriesService';
import { Spinner } from '../../shared/spinner/spinner';
import { RouterLink } from '@angular/router';
import { RoleDirective } from '../../shared/directives/role-directive';

@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Spinner, RouterLink, RoleDirective],
  templateUrl: './category-products.html',
  styleUrl: './category-products.scss',
})
export class CategoryProducts {
  store = inject(CategoryProductStore);
  route = inject(ActivatedRoute);
  categoriesService = inject(CategoriesService);
  private fb = inject(FormBuilder);

  imgBase = this.categoriesService.uploadUrl;

  searchParam: string = '';
  categoryId!: number;

  // MODAL
  showCreateModal = false;
  selectedFile: File | null = null;

  productForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  ngOnInit() {
    this.route.params
      .pipe(
        map((p) => Number(p['catId'])),
        tap((id) => (this.categoryId = id)),
      )
      .subscribe((id) => {
        if (id) {
          this.store.loadProducts(id);
        }
      });
  }

  onSearchChange(val: string) {
    // if (!val) {
    // this.store.loadProducts(this.categoryId);
    // return;
  }

  //   this.store.searchProducts({
  //     categoryId: this.categoryId,
  //     query: val,
  //   });
  // }

  // OPEN MODAL
  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.productForm.reset();
    this.selectedFile = null;
  }

  // FILE
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // SUBMIT CREATE
  onCreateSubmit() {
    if (this.productForm.invalid) return;

    const formData = new FormData();

    formData.append('name', this.productForm.value.name!);
    formData.append('description', this.productForm.value.description!);
    formData.append('category_id', String(this.categoryId));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.store.createProduct(formData);
    this.closeCreateModal();
  }

  deleteProduct(id: number) {
    console.log(id);
    // this.store.deleteProduct(id);
  }
}
