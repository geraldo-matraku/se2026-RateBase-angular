import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth-service';
import { User } from './auth-service';
import { Router } from '@angular/router';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private authService = inject(AuthService);
  private state = new BehaviorSubject<AuthState>({
    user: null,
    loading: false,
    error: null,
  });

  state$ = this.state.asObservable();
  private router = inject(Router);

  constructor() {}

  private setState(newState: Partial<AuthState>) {
    this.state.next({ ...this.state.value, ...newState });
  }

  login(credentials: { email: string; password: string }) {
    this.setState({ loading: true, error: null });

    this.authService.login(credentials).subscribe({
      next: (user) => {
        this.setState({ user, loading: false });
        this.router.navigate(['/categories']);
      },
      error: (err) => {
        this.setState({ user: null, loading: false, error: err?.error?.message || 'Login failed' });
      },
    });
  }

  register(data: { first_name: string; email: string; password: string; last_name: string }) {
    this.setState({ loading: true, error: null });

    this.authService.register(data).subscribe({
      next: (user) => {
        this.setState({ user, loading: false });
        this.router.navigate(['/categories']);
      },
      error: (err) => {
        this.setState({
          user: null,
          loading: false,
          error: err?.error?.message || 'Register failed',
        });
      },
    });
  }

  fetchMe() {
    this.setState({ loading: true, error: null });

    this.authService.me().subscribe({
      next: (user) => {
        this.setState({ user, loading: false });
      },
      error: () => {
        this.setState({ user: null, loading: false });
      },
    });
  }

  logout() {
    this.setState({ user: null });
  }
}
