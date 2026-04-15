import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environments } from '../environments/environments';

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  constructor() {}

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http
      .post(`${environments.apiUrl}auth/login`, credentials, { withCredentials: true })
      .pipe(switchMap(() => this.me()));
  }

  register(data: {
    first_name: string;
    email: string;
    password: string;
    last_name: string;
  }): Observable<User> {
    return this.http
      .post(`${environments.apiUrl}auth/register`, data, { withCredentials: true })
      .pipe(switchMap(() => this.me()));
  }

  me(): Observable<User> {
    return this.http.get<User>(`${environments.apiUrl}users/me`, { withCredentials: true });
  }
}
