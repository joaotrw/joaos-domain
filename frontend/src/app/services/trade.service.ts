import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private http = inject(HttpClient);

  private getAuthHeaders() {
    return {
      headers: {
        'current-user': localStorage.getItem('currentUser') || '',
        'user-role': localStorage.getItem('userRole') || 'User'
      }
    };
  }

  // --- API METHODS ---
  getTrades(): Observable<any[]> {
  const headers = this.getAuthHeaders();
  console.log('DEBUG [8]: Service calling GET /api/trades with headers:', headers);
  return this.http.get<any[]>(`${environment.apiUrl}/trades`, headers);
}

// Change these methods in trade.service.ts
logTrade(tradeData: any): Observable<any> {
  return this.http.post(`${environment.apiUrl}/trades`, tradeData, this.getAuthHeaders());
}

getBacktests(username: string): Observable<any[]> {
  return this.http.get<any[]>(`${environment.apiUrl}/backtests/${username}`, this.getAuthHeaders());
}

saveBacktest(data: any): Observable<any> {
  return this.http.post(`${environment.apiUrl}/backtests`, data, this.getAuthHeaders());
}

  deleteBacktest(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/backtests/${id}`);
  }

  // --- ANALYTICS LOGIC ---
  calculateNetProfit(trades: any[]): number {
    const gains = trades.reduce((sum, t) => sum + (t.realisedGains || 0), 0);
    const losses = trades.reduce((sum, t) => sum + (t.realisedLoss || 0), 0);
    return gains - losses;
  }

  calculateWinRate(trades: any[]): number {
    if (trades.length === 0) return 0;
    const wins = trades.filter(t => (t.realisedGains || 0) > 0).length;
    return (wins / trades.length) * 100;
  }


  calculateAverageR(trades: any[]): number {
    if (trades.length === 0) return 0;
    const totalR = trades.reduce((sum, t) => sum + (t.rMultiple || 0), 0);
    return totalR / trades.length;
  }

  getStrategyPerformance(trades: any[], strategyName: string) {
    const strategyTrades = trades.filter(t => t.strategy === strategyName);
    const gains = strategyTrades.reduce((sum, t) => sum + (t.realisedGains || 0), 0);
    const losses = strategyTrades.reduce((sum, t) => sum + (t.realisedLoss || 0), 0);
    return {
      count: strategyTrades.length,
      net: gains - losses
    };
  }

  updateTrade(id: string, data: any): Observable<any> {
  return this.http.patch(`${environment.apiUrl}/trades/${id}`, data);
}




}