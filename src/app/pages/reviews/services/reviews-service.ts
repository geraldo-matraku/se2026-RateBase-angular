import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environments } from '../../../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private http = inject(HttpClient);

  getReviewsByProductId(productId: number): Observable<any> {
    return this.http.get(`${environments.apiUrl}reviews/getByProduct.php?product_id=${productId}`);
  }
}
