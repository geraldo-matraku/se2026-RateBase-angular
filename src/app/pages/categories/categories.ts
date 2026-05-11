import { Component, inject, OnInit } from '@angular/core';
import { AuthStore } from '../../core/services/authStore';
import { CategoriesStore } from './store/categoriesStore';
import { CategoriesService } from './services/categoriesService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule, LoadingSpinner],
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
})
export class CategoriesComponent implements OnInit {
  authStore = inject(AuthStore);

  categoriesStore = inject(CategoriesStore);
  categoriesService = inject(CategoriesService);
  imgBase = this.categoriesService.uploadUrl;

  ngOnInit() {
    this.categoriesStore.loadCategories();
  }

  onLogout() {
    this.authStore.logout();
  }
}
