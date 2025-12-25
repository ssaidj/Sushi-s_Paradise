import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  box_id: number;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: string;
  payment_method?: string;
  created_at: string;
  items?: OrderItem[];
}

interface CreateOrderRequest {
  items: { box_id: number; quantity: number; unit_price: number }[];
}

interface CreateOrderResponse {
  success: boolean;
  order_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost/TD3L/sushi_paradise/api/orders';

  constructor(private http: HttpClient) {}

  /**
   * Créer une nouvelle commande via l'API
   */
  createOrder(userId: number, items: OrderItem[], totalPrice: number, paymentMethod: 'cash' | 'card'): Observable<CreateOrderResponse> {
    const token = localStorage.getItem('api_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Préparer les items au format attendu par l'API (avec le unit_price du panier)
    const requestItems = items.map(item => ({
      box_id: item.box_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    }));

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body: CreateOrderRequest = {
      items: requestItems
    };

    return this.http.post<CreateOrderResponse>(
      `${this.apiUrl}/create.php`,
      body,
      { headers }
    );
  }

  /**
   * Récupérer toutes les commandes d'un utilisateur
   */
  getOrders(userId: number): Observable<Order[]> {
    const token = localStorage.getItem('api_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Order[]>(
      `${this.apiUrl}/list.php`,
      { headers }
    );
  }
}
