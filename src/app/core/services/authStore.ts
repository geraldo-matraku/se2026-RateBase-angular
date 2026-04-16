import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, of } from 'rxjs';
import { AuthService, User } from './auth-service';
import { Router } from '@angular/router';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
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

  state$ = this.state.asObservable();
  user$ = this.state$.pipe(map((s) => s.user));
  role$ = this.user$.pipe(map((s) => s?.role));
  firstName$ = this.user$.pipe(map((s) => s?.first_name));
  lastName$ = this.user$.pipe(map((s) => s?.last_name));

  loading$ = this.state$.pipe(map((s) => s.loading));
  error$ = this.state$.pipe(map((s) => s.error));
  initialized$ = this.state$.pipe(map((s) => s.initialized));
  initials$ = combineLatest([this.firstName$, this.lastName$]).pipe(
    map(([first, last]) => {
      return `${first?.charAt(0) ?? ''}${last?.charAt(0) ?? ''}`.toUpperCase();
    }),
  );
  private setState(newState: Partial<AuthState>) {
    this.state.next({ ...this.state.value, ...newState });
  }

  setError() {
    this.state.next({ ...this.state.value, error: null });
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
