import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private http = inject(HttpClient);

  private getAuthHeaders() {
    return {
      headers: {
        // Use the exact same keys you used in TaskService for consistency
        'current-user': localStorage.getItem('currentUser') || '',
        'user-role': localStorage.getItem('userRole') || 'User' 
      }
    };
  }

  // --- EXPENSES (FINANCE) ---
  getFinance(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/finance`, this.getAuthHeaders());
  }

  addFinance(data: any) {
    // Ensure the data object has the current user attached if the backend needs it
    const payload = { ...data, createdBy: localStorage.getItem('currentUser') };
    return this.http.post(`${environment.apiUrl}/finance`, payload, this.getAuthHeaders());
  }

  deleteFinance(id: string) {
    return this.http.delete(`${environment.apiUrl}/finance/${id}`, this.getAuthHeaders());
  }

  // --- INCOME ---
  getIncome(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/income`, this.getAuthHeaders());
  }

  addIncome(data: any) {
    return this.http.post(`${environment.apiUrl}/income`, data, this.getAuthHeaders());
  }

  deleteIncome(id: string) {
    return this.http.delete(`${environment.apiUrl}/income/${id}`, this.getAuthHeaders());
  }

  // --- GOALS ---
  getGoals(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/goals`, this.getAuthHeaders());
  }

  addGoal(goal: any) {
    return this.http.post(`${environment.apiUrl}/goals`, goal, this.getAuthHeaders());
  }

  updateGoalProgress(goalId: string, amount: number) {
    return this.http.patch(`${environment.apiUrl}/goals/${goalId}`, { amount }, this.getAuthHeaders());
  }

  deleteGoal(id: string) {
    return this.http.delete(`${environment.apiUrl}/goals/${id}`, this.getAuthHeaders());
  }

  // --- UTILITY METHODS ---
  calculateTotal(items: any[]): number {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }

  calculateBankBalance(items: any[], bankName: string): number {
    if (!items) return 0;
    return items
      .filter(f => f.bank?.toLowerCase() === bankName.toLowerCase())
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }

  calculateGoalPercent(current: number, target: number): number {
    if (!target || target === 0) return 0;
    const percent = (current / target) * 100;
    return percent > 100 ? 100 : Math.max(0, percent);
  }
}