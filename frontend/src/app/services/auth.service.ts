import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // --- SESSION HELPERS ---
  get isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  get userRole(): string {
    return localStorage.getItem('userRole') || 'User';
  }

  saveSession(username: string, role: string) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', username);
    localStorage.setItem('userRole', role);
  }

  clearSession() {
    localStorage.clear();
  }

  // --- API CALLS ---
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/login`, { username, password });
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/register`, { username, password });
  }
}