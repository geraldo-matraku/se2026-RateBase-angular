import { inject, Injectable } from '@angular/core';
import { environments } from '../../../../environments/environments';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductDetailsService {
  private http = inject(HttpClient);

  createReview(payload: {
    product_id: number;
    rating: number;
    comment: string;
    image?: string;
  }): Observable<any> {
    return this.http.post(
      `http://localhost/sistem-vleresimi-produktesh-php/api/reviews/create.php`,
      payload,
      { withCredentials: true },
    );
  }

  getProductById(productId: number): Observable<any> {
    return this.http.get(`${environments.apiUrl}products/${productId}`);
  }
}
