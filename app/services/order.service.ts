import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost/TD3/sushi_paradise/api/orders';

  constructor(private http: HttpClient) {}

  createOrder(items: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create.php`, { items });
  }

  getOrderHistory(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list.php`);
  }
}
