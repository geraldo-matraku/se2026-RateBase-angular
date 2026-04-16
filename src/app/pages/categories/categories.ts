import { Component, inject } from '@angular/core';
import { AuthStore } from '../../core/services/authStore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Category {
  id: number;
  name: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
})
export class CategoriesComponent {
  searchTerm: string = '';
  authStore = inject(AuthStore);

  categories: Category[] = [
    { id: 1, name: 'Elektronikë', icon: '💻', count: 120 },
    { id: 2, name: 'Mobile', icon: '📱', count: 80 },
    { id: 3, name: 'Audio', icon: '🎧', count: 45 },
    { id: 4, name: 'Aksesorë', icon: '⌨️', count: 60 },
    { id: 5, name: 'Gaming', icon: '🎮', count: 35 },
    { id: 6, name: 'Monitor', icon: '🖥️', count: 25 },
    { id: 7, name: 'TV & Media', icon: '📺', count: 40 },
    { id: 8, name: 'Smart Home', icon: '🏠', count: 20 },
  ];

  filteredCategories(): Category[] {
    if (!this.searchTerm) return this.categories;

    return this.categories.filter((c) =>
      c.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }
  onLogout() {
    this.authStore.logout();
  }
}
