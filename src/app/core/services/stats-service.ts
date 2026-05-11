import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get<any>(`${environments.apiUrl}stats/getStats.php`);
  }
}
