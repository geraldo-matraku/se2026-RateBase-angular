import { Component, inject, OnInit } from '@angular/core';
import { AuthStore } from '../../core/services/authStore';
import { CategoriesStore } from './store/categoriesStore';
import { CategoriesService } from './services/categoriesService';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StatsComponent } from '../../shared/stats/stats';
import { RouterLink } from '@angular/router';
import { Spinner } from '../../shared/spinner/spinner';
import { RoleDirective } from '../../shared/directives/role-directive';

@Component({
  selector: 'app-categories',
  imports: [
    CommonModule,
    FormsModule,
    StatsComponent,
    RouterLink,
    Spinner,
    RoleDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './categories.html',
  styles: `
    .categories-page {
      padding: 32px;
      background: #f5f7fb;
      min-height: 100vh;
      font-family: Inter, sans-serif;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;

      h2 {
        font-size: 26px;
        font-weight: 600;
        color: #111827;
      }

      p {
        font-size: 14px;
        color: #6b7280;
        margin-top: 4px;
      }
    }

    .toolbar {
      margin-bottom: 24px;
    }

    .search-box {
      width: 420px;
      height: 44px;

      display: flex;
      align-items: center;
      gap: 10px;

      background: #fff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;

      padding: 0 14px;

      transition: all 0.2s ease;

      &:focus-within {
        border-color: #185fa5;
        box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.1);
      }

      i {
        font-size: 18px;
        color: #9ca3af;
      }

      input {
        border: none;
        outline: none;
        background: transparent;
        flex: 1;

        font-size: 14px;
        color: #111827;

        &::placeholder {
          color: #9ca3af;
        }
      }
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    }

    .card {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;

      padding: 18px;

      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

      transition: all 0.25s ease;

      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
      }
    }

    .category-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .category-image {
      width: 70px;
      height: 70px;
      flex-shrink: 0;

      border-radius: 12px;
      overflow: hidden;
      background: #f8fafc;

      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .content {
      flex: 1;

      .title {
        font-size: 17px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 6px;
      }

      .count {
        font-size: 13px;
        font-weight: 600;

        color: #185fa5;
        background: rgba(24, 95, 165, 0.08);

        width: fit-content;

        padding: 4px 10px;
        border-radius: 999px;

        margin-bottom: 10px;
      }

      .description {
        font-size: 13px;
        line-height: 1.5;
        color: #6b7280;

        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .empty-state {
      padding: 40px;
      text-align: center;
      color: #6b7280;
    }

    .error-msg {
      margin-top: 20px;
      color: #dc2626;
      font-size: 14px;
    }
  `,
})
export class CategoriesComponent implements OnInit {
  authStore = inject(AuthStore);

  showEditModal = false;
  selectedCategoryId: number | null = null;

  searchParam: string | null = null;
  categoriesStore = inject(CategoriesStore);
  categoriesService = inject(CategoriesService);
  imgBase = this.categoriesService.uploadUrl;

  private fb = inject(FormBuilder);
  showModal = false;
  selectedFile: File | null = null;

  ngOnInit() {
    this.categoriesStore.loadCategories();
  }

  onSearchChange(param: string) {
    this.categoriesStore.searchCategories(param);
  }

  onLogout() {
    this.authStore.logout();
  }

  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]],
  });

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      const formData = new FormData();
      formData.append('name', this.categoryForm.value.name);
      formData.append('description', this.categoryForm.value.description);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.categoriesStore.addCategory(formData);
      this.closeModal();
    }
  }

  closeModal() {
    this.showModal = false;
    this.categoryForm.reset();
    this.selectedFile = null;
  }
  showDeleteModal = false;
  categoryToDelete: { id: number; name: string } | null = null;

  openDeleteModal(id: number, name: string) {
    this.categoryToDelete = { id, name };
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.categoryToDelete = null;
  }

  confirmDelete() {
    if (this.categoryToDelete) {
      this.categoriesStore.deleteCategory(this.categoryToDelete.id);
      this.closeDeleteModal();
    }
  }

  openEditModal(category: any) {
    this.selectedCategoryId = category.category_id;

    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
    });

    this.showEditModal = true;
  }
  onEditSubmit() {
    if (!this.selectedCategoryId) return;

    const formData = new FormData();

    const name = this.categoryForm.get('name')?.value;
    const description = this.categoryForm.get('description')?.value;

    if (name) {
      formData.append('name', name);
    }

    if (description) {
      formData.append('description', description);
    }

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.categoriesStore.editCategory({
      id: this.selectedCategoryId,
      formData,
    });

    this.closeEditModal();
  }
  closeEditModal() {
    this.showEditModal = false;

    this.selectedCategoryId = null;

    this.selectedFile = null;

    this.categoryForm.reset();
  }
}
