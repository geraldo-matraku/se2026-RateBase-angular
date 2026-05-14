import { Component, inject, OnInit } from '@angular/core';
import { CategoryProductStore } from './store/category-products-store';
import { ActivatedRoute } from '@angular/router';
import { map, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
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
export class CategoryProducts implements OnInit {
  store = inject(CategoryProductStore);
  route = inject(ActivatedRoute);
  categoriesService = inject(CategoriesService);
  private fb = inject(FormBuilder);

  imgBase = this.categoriesService.uploadUrl;

  searchParam: string = '';
  categoryId!: number;
  selectedFile: File | null = null;

  showCreateModal = false;

  productForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  showDeleteModal = false;
  productToDelete: { id: number; name: string } | null = null;

  showEditModal = false;
  selectedProductId: number | null = null;

  productEditForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]],
  });

  ngOnInit() {
    this.route.params
      .pipe(
        map((p) => Number(p['catId'])),
        tap((id) => (this.categoryId = id)),
      )
      .subscribe((id) => {
        if (id) this.store.loadProducts(id);
      });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  onSearchChange(val: string) {}

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.productForm.reset();
    this.selectedFile = null;
  }

  onCreateSubmit() {
    if (this.productForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.productForm.value.name!);
    formData.append('description', this.productForm.value.description!);
    formData.append('category_id', String(this.categoryId));
    if (this.selectedFile) formData.append('image', this.selectedFile);

    this.store.createProduct(formData);
    this.closeCreateModal();
  }

  openDeleteModal(id: number, name: string) {
    this.productToDelete = { id, name };
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  confirmDelete() {
    if (this.productToDelete) {
      this.store.deleteProduct(this.productToDelete.id);
      this.closeDeleteModal();
    }
  }

  openEditModal(product: any) {
    this.selectedProductId = product.product_id;
    this.productEditForm.patchValue({
      name: product.name,
      description: product.description,
    });
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedProductId = null;
    this.selectedFile = null;
    this.productEditForm.reset();
  }

  onEditSubmit() {
    if (!this.selectedProductId || this.productEditForm.invalid) return;

    const formData = new FormData();
    const name = this.productEditForm.get('name')?.value;
    const description = this.productEditForm.get('description')?.value;

    if (name) formData.append('name', name);
    if (description) formData.append('description', description);
    if (this.selectedFile) formData.append('image', this.selectedFile);

    this.store.updateProduct({ id: this.selectedProductId, formData });
    this.closeEditModal();
  }
}
