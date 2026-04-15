import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { environments } from '../../../environments/environments';

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

  register(data: any): Observable<any> {
    return this.http.post(`${environments.apiUrl}auth/register`, data, { withCredentials: true });
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${environments.apiUrl}auth/login`, credentials, {
      withCredentials: true,
    });
  }

  me(): Observable<User> {
    return this.http
      .get<User>(`${environments.apiUrl}users/me`, {
        withCredentials: true,
      })
      .pipe(map((res) => (res as any).user ?? res));
  }

  logout(): Observable<any> {
    return this.http.post(`${environments.apiUrl}auth/logout`, {}, { withCredentials: true });
  }
}
