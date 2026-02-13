import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);

  private getHeaders() {
    return {
      headers: {
        'current-user': localStorage.getItem('currentUser') || '',
        'user-role': localStorage.getItem('userRole') || 'User'
      }
    };
  }

  getProjects() {
    return this.http.get<any[]>(`${environment.apiUrl}/projects`, this.getHeaders());
  }

  addProject(title: string, description: string) {
    const createdBy = localStorage.getItem('currentUser') || 'Unknown';
    return this.http.post(`${environment.apiUrl}/projects`, { title, description, createdBy });
  }

  updateStatus(id: string) {
    return this.http.put(`${environment.apiUrl}/projects/${id}/status`, {});
  }

  addTask(projectId: string, text: string) {
    return this.http.post(`${environment.apiUrl}/projects/${projectId}/tasks`, { text });
  }

  deleteProject(id: string) {
    return this.http.delete(`${environment.apiUrl}/projects/${id}`);
  }
}