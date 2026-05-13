import { inject, Injectable } from '@angular/core';
import { environments } from '../../../../environments/environments';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductDetailsService {
  private http = inject(HttpClient);

  getProductById(productId: number): Observable<any> {
    return this.http.get(`${environments.apiUrl}products/${productId}`);
  }
}
