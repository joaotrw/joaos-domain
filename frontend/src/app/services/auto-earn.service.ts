import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AutoEarnService {
  private http = inject(HttpClient);

  // Helper to add the required headers
  private getAuthHeaders() {
    return {
      headers: {
        'current-user': localStorage.getItem('currentUser') || '',
        'user-role': localStorage.getItem('userRole') || 'User'
      }
    };
  }

  getEarnings() {
    // Change: Removed ${username} from URL, added this.getAuthHeaders()
    return this.http.get<any[]>(`${environment.apiUrl}/autoearn`, this.getAuthHeaders());
  }

  addEarning(data: any) {
    return this.http.post(`${environment.apiUrl}/autoearn`, data, this.getAuthHeaders());
  }

  // ADD THIS METHOD TO FIX THE ERROR
  updateEarning(id: string, data: any) {
    return this.http.patch(`${environment.apiUrl}/autoearn`, this.getAuthHeaders());
  }

  deleteEarning(id: string) {
    return this.http.delete(`${environment.apiUrl}/autoearn`, this.getAuthHeaders());
  }
}