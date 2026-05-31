import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environments } from '../../../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private http = inject(HttpClient);

  createReview(payload: {
    product_id: number;
    rating: number;
    comment: string;
    image?: string;
  }): Observable<any> {
    return this.http.post(`${environments.apiUrl}reviews/create.php`, payload, {
      withCredentials: true,
    });
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete(`${environments.apiUrl}reviews/delete.php?reviewid=${id}`, {
      withCredentials: true,
    });
  }

  updateReview(id: number, payload: { rating: number; comment: string }): Observable<any> {
    return this.http.put(`${environments.apiUrl}reviews/update.php?reviewid=${id}`, payload, {
      withCredentials: true,
    });
  }

  getReviewsByProductId(productId: number): Observable<any> {
    return this.http.get(`${environments.apiUrl}reviews/getByProduct.php?product_id=${productId}`, {
      withCredentials: true,
    });
  }

  getMyReviews(): Observable<any> {
    return this.http.get(`${environments.apiUrl}reviews/myReviews.php`, { withCredentials: true });
  }
  vote(review_id: number, type: 'up' | 'down'): Observable<any> {
    return this.http.post(
      `${environments.apiUrl}votes/vote.php`,
      { review_id, type },
      { withCredentials: true },
    );
  }
}
