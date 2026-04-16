import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../../../../environments/environments';

export interface Category {
  category_id: number;
  name: string;
  description: string;
  total_products: number;
}

export interface CategoriesResponse {
  status: string;
  data: Category[];
  total_categories: number;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private http = inject(HttpClient);

  getCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(`${environments.apiUrl}/categories/getAll`);
  }

  searchCategories(query: string): Observable<CategoriesResponse> {
    const params = new HttpParams().set('q', query);

    return this.http.get<CategoriesResponse>(`${environments.apiUrl}/categories/getAll`, {
      params,
    });
  }
}
