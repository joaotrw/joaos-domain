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

// task.service.ts

addTask(text: string) {
  // Pass the text in the body so the backend can create the task
  return this.http.post(`${environment.apiUrl}/tasks`, { text }, this.getHeaders());
}

toggleTask(id: string) {
  // Append the ID to the URL: /api/tasks/123
  return this.http.patch(`${environment.apiUrl}/tasks/${id}`, {}, this.getHeaders());
}

deleteTask(id: string) {
  // Append the ID to the URL: /api/tasks/123
  return this.http.delete(`${environment.apiUrl}/tasks/${id}`, this.getHeaders());
}
}