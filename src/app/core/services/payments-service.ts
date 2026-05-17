// payment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../../../environments/environments';

export interface CreatePaymentResponse {
  message: string;
  payment: {
    payment_id: number;
    user_id: number;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    description: string;
    paddle_payment_id: string;
  };
  paddle: {
    environment: 'sandbox' | 'production';
    client_token: string;
    price_id: string;
  };
}

export interface CapturePaymentResponse {
  message: string;
  payment_id: number;
  paddle_payment_id: string;
  email_sent: boolean;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);

  createOrder(amount: number): Observable<CreatePaymentResponse> {
    return this.http.post<CreatePaymentResponse>(
      `${environments.apiUrl}payments/create.php`,
      { amount },
      { withCredentials: true },
    );
  }

  captureOrder(payment_id: number): Observable<CapturePaymentResponse> {
    return this.http.post<CapturePaymentResponse>(
      `${environments.apiUrl}payments/capture.php`,
      { payment_id },
      { withCredentials: true },
    );
  }
}
