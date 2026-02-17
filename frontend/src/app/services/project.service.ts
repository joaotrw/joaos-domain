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
      'user-role': localStorage.getItem('userRole') || 'User' // Ensure this matches backend 'user-role'
    }
  };
}

  getProjects() {
    return this.http.get<any[]>(`${environment.apiUrl}/projects`, this.getHeaders());
  }

// project.service.ts

addProject(title: string, description: string) {
  return this.http.post(`${environment.apiUrl}/projects`, { title, description }, this.getHeaders());
}

updateStatus(id: string) {
  // URL should be /api/projects/ID
  return this.http.put(`${environment.apiUrl}/projects/${id}`, {}, this.getHeaders());
}

addTask(projectId: string, text: string) {
  // Typically project tasks are posted to a specific project sub-route
  return this.http.post(`${environment.apiUrl}/projects/${projectId}/tasks`, { text }, this.getHeaders());
}

deleteProject(id: string) {
  return this.http.delete(`${environment.apiUrl}/projects/${id}`, this.getHeaders());
}
}