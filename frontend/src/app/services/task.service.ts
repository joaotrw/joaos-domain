import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);

private getHeaders() {
  return {
    headers: {
      'current-user': localStorage.getItem('currentUser') || '',
      'user-role': localStorage.getItem('userRole') || 'User' // Ensure this matches backend 'user-role'
    }
  };
}

  getTasks() {
    return this.http.get<any[]>(`${environment.apiUrl}/tasks`, this.getHeaders());
  }

  addTask(text: string) {
    const createdBy = localStorage.getItem('currentUser') || 'Unknown';
    return this.http.post(`${environment.apiUrl}/tasks`, this.getHeaders());
  }

  toggleTask(id: string) {
    return this.http.patch(`${environment.apiUrl}/tasks`, this.getHeaders());
  }

  deleteTask(id: string) {
    return this.http.delete(`${environment.apiUrl}/tasks`, this.getHeaders());
  }
}