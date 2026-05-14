import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../../../../environments/environments';

export interface Category {
  category_id: number;
  name: string;
  description: string;
  total_products: number;
  image: string;
}

export interface CategoriesResponse {
  status: string;
  data: Category[];
  total_categories: number;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);

  public readonly uploadUrl = 'http://localhost/sistem-vleresimi-produktesh-php/uploads/';

  getCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(`${environments.apiUrl}categories/getAll`);
  }

  searchCategories(query: string): Observable<CategoriesResponse> {
    const params = new HttpParams().set('q', query);
    return this.http.get<CategoriesResponse>(`${environments.apiUrl}categories/getAll`, {
      params,
    });
  }
  createCategory(formData: FormData): Observable<any> {
    return this.http.post(`${environments.apiUrl}categories/create`, formData, {
      withCredentials: true, // Rëndësishme për të dërguar session-in
    });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${environments.apiUrl}categories/${id}`, {
      withCredentials: true,
    });
  }
}
