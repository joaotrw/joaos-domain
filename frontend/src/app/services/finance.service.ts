import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private http = inject(HttpClient);

  // Helper to get headers for every request
  private getAuthHeaders() {
    return {
      headers: {
        'current-user': localStorage.getItem('currentUser') || '',
        'user-role': localStorage.getItem('user-role') || 'User'
      }
    };
  }

  // --- EXPENSES (FINANCE) ---
  getFinance(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/finance`, this.getAuthHeaders());
  }

  addFinance(data: any) {
    return this.http.post(`${environment.apiUrl}/finance`, data);
  }

  deleteFinance(id: string) {
    return this.http.delete(`${environment.apiUrl}/finance/${id}`);
  }

  // --- INCOME ---
  getIncome(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/income`, this.getAuthHeaders());
  }

  addIncome(data: any) {
    return this.http.post(`${environment.apiUrl}/income`, data);
  }

  deleteIncome(id: string) {
    return this.http.delete(`${environment.apiUrl}/income/${id}`);
  }

  // --- GOALS ---
  getGoals(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/goals`, this.getAuthHeaders());
  }

  addGoal(goal: any) {
    return this.http.post(`${environment.apiUrl}/goals`, goal);
  }

  updateGoalProgress(goalId: string, amount: number) {
    return this.http.patch(`${environment.apiUrl}/goals/${goalId}`, { amount });
  }

  deleteGoal(id: string) {
    return this.http.delete(`${environment.apiUrl}/goals/${id}`);
  }

  // --- CALCULATIONS (THE "PROFESSIONAL" WAY) ---
  
  calculateTotal(items: any[]): number {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }

  calculateBankBalance(items: any[], bankName: string): number {
    return items
      .filter(f => f.bank?.toLowerCase() === bankName.toLowerCase())
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }

  calculateGoalPercent(current: number, target: number): number {
    const percent = (current / target) * 100;
    return percent > 100 ? 100 : Math.max(0, percent);
  }
}