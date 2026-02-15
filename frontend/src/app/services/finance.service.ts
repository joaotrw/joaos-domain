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
  // FIXED: Added this.getAuthHeaders()
  return this.http.post(`${environment.apiUrl}/finance`, data, this.getAuthHeaders());
}

deleteFinance(id: string) {
  // FIXED: Added this.getAuthHeaders()
  return this.http.delete(`${environment.apiUrl}/finance/${id}`, this.getAuthHeaders());
}

  // --- INCOME ---
  getIncome(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/income`, this.getAuthHeaders());
  }

addIncome(data: any) {
  // FIXED: Added this.getAuthHeaders()
  return this.http.post(`${environment.apiUrl}/income`, data, this.getAuthHeaders());
}

  deleteIncome(id: string) {
    // FIXED: Added headers
    return this.http.delete(`${environment.apiUrl}/income/${id}`, this.getAuthHeaders());
  }

  // --- GOALS ---
  getGoals(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/goals`, this.getAuthHeaders());
  }

 addGoal(goal: any) {
  // FIXED: Added this.getAuthHeaders()
  return this.http.post(`${environment.apiUrl}/goals`, goal, this.getAuthHeaders());
}

  updateGoalProgress(goalId: string, amount: number) {
    // FIXED: Added headers
    return this.http.patch(`${environment.apiUrl}/goals/${goalId}`, { amount }, this.getAuthHeaders());
  }

  deleteGoal(id: string) {
    // FIXED: Added headers
    return this.http.delete(`${environment.apiUrl}/goals/${id}`, this.getAuthHeaders());
  }

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