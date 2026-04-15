import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/services/authStore';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('sistem-vlersimi-produktesh-angular');
  private authStore = inject(AuthStore);

  ngOnInit() {
    this.authStore.fetchMe();
  }
}
