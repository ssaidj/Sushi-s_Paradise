import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Box } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BoxService {
  private apiUrl = 'http://localhost/TD3/sushi_paradise/api/boxes';

  constructor(private http: HttpClient) {}

  getAllBoxes(): Observable<Box[]> {
    return this.http.get<Box[]>(`${this.apiUrl}/index.php`);
  }

  getBoxById(id: number): Observable<Box> {
    return this.http.get<Box>(`${this.apiUrl}/index.php?id=${id}`);
  }
}
