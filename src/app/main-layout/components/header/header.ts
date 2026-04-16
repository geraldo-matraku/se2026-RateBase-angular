import { Component, inject } from '@angular/core';
import { AuthStore } from '../../../core/services/authStore';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  authStore = inject(AuthStore);

  onLogout() {
    this.authStore.logout();
  }
}
