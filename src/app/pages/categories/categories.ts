import { Component, inject, OnInit } from '@angular/core';
import { AuthStore } from '../../core/services/authStore';
import { CategoriesStore } from './store/categoriesStore';
import { CategoriesService } from './services/categoriesService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { StatsComponent } from '../../shared/stats/stats';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule, LoadingSpinner, StatsComponent],
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

    .add-btn {
      height: 44px;
      padding: 0 20px;
      border-radius: 10px;
      border: none;
      background: #185fa5;
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;

      transition: all 0.2s ease;

      &:hover {
        background: #134a82;
        transform: translateY(-2px);
        box-shadow: 0 6px 14px rgba(24, 95, 165, 0.25);
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

      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;

      padding: 0 14px;

      transition: all 0.2s ease;

      &:focus-within {
        border-color: #185fa5;
        box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.1);
      }

      .icon {
        font-size: 16px;
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

    .category-card {
      display: flex;
      align-items: center;
      gap: 16px;

      background: #ffffff;
      border-radius: 16px;
      padding: 20px;

      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      cursor: pointer;

      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
        border-color: #d1d5db;
      }

      .icon {
        width: 60px;
        height: 60px;
        border-radius: 14px;

        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #eef2ff, #f5f7fb);
        font-size: 26px;

        background: #f3f4f6;
      }

      .content {
        .title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .count {
          font-size: 13px;
          color: #6b7280;
        }
      }
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
      padding: 20px;
    }

    .category-card {
      display: flex;
      align-items: center;
      background: #ffffff;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease-in-out;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }

      .category-image {
        width: 60px;
        height: 60px;
        flex-shrink: 0;
        margin-right: 16px;
        border-radius: 8px;
        overflow: hidden;
        background: #f7fafc;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 100%;
          height: 100%;
          border-radius: 8px;

          object-fit: contain;
        }
      }

      .content {
        .title {
          font-weight: 700;
          font-size: 1.05rem;
          color: #1a202c;
          margin-bottom: 2px;
        }

        .count {
          font-size: 13px;
          font-weight: 600;

          color: #185fa5;

          background: rgba(24, 95, 165, 0.08);

          width: fit-content;

          padding: 4px 10px;

          border-radius: 999px;

          margin-top: 2px;
        }
      }
    }
    .description {
      margin-top: 6px;

      font-size: 13px;
      line-height: 1.5;

      color: #6b7280;

      display: -webkit-box;
      -webkit-line-clamp: 2; // max 2 rreshta
      -webkit-box-orient: vertical;

      overflow: hidden;
      text-overflow: ellipsis;

      max-width: 100%;
    }
  `,
})
export class CategoriesComponent implements OnInit {
  authStore = inject(AuthStore);

  searchParam: string | null = null;
  categoriesStore = inject(CategoriesStore);
  categoriesService = inject(CategoriesService);
  imgBase = this.categoriesService.uploadUrl;

  ngOnInit() {
    this.categoriesStore.loadCategories();
  }

  onSearchChange(param: string) {
    this.categoriesStore.searchCategories(param);
  }

  onLogout() {
    this.authStore.logout();
  }
}
