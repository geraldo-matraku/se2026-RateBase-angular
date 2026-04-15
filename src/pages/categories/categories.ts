import { Component, inject } from '@angular/core';
import { AuthStore } from '../../app/core/services/authStore';

@Component({
  selector: 'app-categories',
  imports: [],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  private authStore = inject(AuthStore);
  onLogout() {
    this.authStore.logout();
  }
}
