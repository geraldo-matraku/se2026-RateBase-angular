import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { AuthService, User } from './auth-service';
import { Router } from '@angular/router';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private authService = inject(AuthService);
  private router = inject(Router);

  private state = new BehaviorSubject<AuthState>({
    user: null,
    loading: false,
    error: null,
  });

  state$ = this.state.asObservable();
  user$ = this.state$.pipe(map((s) => s.user));

  private setState(newState: Partial<AuthState>) {
    this.state.next({ ...this.state.value, ...newState });
  }

  login(credentials: any) {
    this.setState({ loading: true, error: null });

    this.authService.login(credentials).subscribe({
      next: () => {
        // 🔥 WAIT 100–300ms që cookie të vendoset
        setTimeout(() => {
          this.authService.me().subscribe({
            next: (user) => {
              this.setState({ user, loading: false });
              this.router.navigate(['/categories']);
            },
            error: (err) => {
              this.setState({
                user: null,
                loading: false,
                error: err?.error,
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
        });
      },
    });
  }

  // 🔥 REGISTER FIXED
  register(data: any) {
    this.setState({ loading: true, error: null });

    this.authService.register(data).subscribe({
      next: () => {
        this.authService.me().subscribe({
          next: (user) => {
            this.setState({ user, loading: false });
            this.router.navigate(['/categories']);
          },
          error: () => {
            this.setState({ user: null, loading: false });
          },
        });
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

  // 🔥 ME
  fetchMe() {
    this.authService.me().subscribe({
      next: (user) => {
        console.log(user);
        this.setState({ user, loading: false });
      },
      error: () => {
        this.setState({ user: null, loading: false });
      },
    });
  }

  // 🔥 LOGOUT
  logout() {
    this.setState({ loading: true });

    this.authService.logout().subscribe({
      next: () => {
        this.setState({ user: null, loading: false });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.setState({ user: null, loading: false });
        this.router.navigate(['/login']);
      },
    });
  }
}
