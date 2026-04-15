import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { AuthService, User } from './auth-service';
import { Router } from '@angular/router';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean; // 🔥 Tregon nëse kontrolli i parë me serverin ka përfunduar
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private authService = inject(AuthService);
  private router = inject(Router);

  private state = new BehaviorSubject<AuthState>({
    user: null,
    loading: false,
    error: null,
    initialized: false,
  });

  // Selectors
  state$ = this.state.asObservable();
  user$ = this.state$.pipe(map((s) => s.user));
  loading$ = this.state$.pipe(map((s) => s.loading));
  error$ = this.state$.pipe(map((s) => s.error));
  initialized$ = this.state$.pipe(map((s) => s.initialized)); // 🔥 E rëndësishme për Guards

  private setState(newState: Partial<AuthState>) {
    this.state.next({ ...this.state.value, ...newState });
  }

  fetchMe() {
    this.setState({ loading: true });
    this.authService.me().subscribe({
      next: (user) => {
        this.setState({ user, loading: false, initialized: true });
      },
      error: () => {
        this.setState({ user: null, loading: false, initialized: true });
      },
    });
  }

  login(credentials: any) {
    this.setState({ loading: true, error: null });

    this.authService.login(credentials).subscribe({
      next: () => {
        setTimeout(() => {
          this.authService.me().subscribe({
            next: (user) => {
              this.setState({ user, loading: false, initialized: true });
              this.router.navigate(['/categories']);
            },
            error: (err) => {
              this.setState({
                user: null,
                loading: false,
                error: err?.error?.message || 'Session verification failed',
                initialized: true,
              });
            },
          });
        }, 200);
      },
      error: (err) => {
        this.setState({
          user: null,
          loading: false,
          error: err?.error?.message || 'Login failed',
          initialized: true,
        });
      },
    });
  }

  register(data: any) {
    this.setState({ loading: true, error: null });

    this.authService.register(data).subscribe({
      next: () => {
        this.authService.me().subscribe({
          next: (user) => {
            this.setState({ user, loading: false, initialized: true });
            this.router.navigate(['/categories']);
          },
          error: () => {
            this.setState({ user: null, loading: false, initialized: true });
          },
        });
      },
      error: (err) => {
        this.setState({
          user: null,
          loading: false,
          error: err?.error?.message || 'Register failed',
          initialized: true,
        });
      },
    });
  }

  logout() {
    this.setState({ loading: true });

    this.authService.logout().subscribe({
      next: () => {
        this.setState({ user: null, loading: false, initialized: true });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.setState({ user: null, loading: false, initialized: true });
        this.router.navigate(['/login']);
      },
    });
  }
}
