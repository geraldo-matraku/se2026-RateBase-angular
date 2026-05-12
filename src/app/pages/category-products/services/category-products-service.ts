import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../../../../environments/environments';

export interface Product {
  product_id: number;
  name: string;
  description: string;
  image: string;
  category_id: number;
  created_at: string;
  category_name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryProductService {
  private http = inject(HttpClient);

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${environments.apiUrl}products/getByCategory/${categoryId}`);
  }
}
