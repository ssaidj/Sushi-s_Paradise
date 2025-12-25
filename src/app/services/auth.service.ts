import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost/TD3L/sushi_paradise/api/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Charger l'utilisateur depuis localStorage au démarrage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login.php`, { email, password })
      .pipe(
        tap(response => {
          if (response.token && response.user) {
            // Stocker le token et l'utilisateur
            localStorage.setItem('api_token', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('api_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('api_token');
  }

  getToken(): string | null {
    return localStorage.getItem('api_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register.php`, userData);
  }
}
