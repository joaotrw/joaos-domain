import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeService } from '../../services/trade.service';

@Component({
  selector: 'app-crypto-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crypto-hub.component.html',
  styleUrls: ['./crypto-hub.component.css']
})
export class CryptoHubComponent implements OnInit {
  @Input() currentUser: string = ''; // Received from App Component
  @Input() allTrades: any[] = [];
  @Input() totalTrades: number = 0;
  @Input() winRate: number = 0;
  @Input() totalNetProfit: number = 0;

  @Output() tradeAddedEvent = new EventEmitter<any>();

  backtests: any[] = [];
  cryptoSubView: 'log' | 'stats' | 'backtest' = 'log';

  constructor(private tradeService: TradeService) {}

  ngOnInit() {
    if (this.currentUser) {
      this.loadBacktests();
    }
  }

  // 4. Action Methods
  onLogTrade(tradeData: any) {
    this.tradeAddedEvent.emit(tradeData);
  }

  setSubView(view: 'log' | 'stats' | 'backtest') {
    this.cryptoSubView = view;
  }

  // Add these inside your CryptoHubComponent class

calcDirection(entry: string, sl: string): string {
  const e = parseFloat(entry);
  const s = parseFloat(sl);
  if (!e || !s) return '';
  return e > s ? 'Long' : 'Short';
}

calcReturns(entry: string, sl: string, exit: string): number {
  const e = parseFloat(entry);
  const s = parseFloat(sl);
  const x = parseFloat(exit);
  
  if (!e || !s || !x || e === s) return 0;

  const risk = Math.abs(e - s); // How much you risked
  const profit = x - e;         // How much you made (positive for Long win, negative for Long loss)
  
  // If it's a Long: (Exit - Entry) / (Entry - SL)
  // If it's a Short: (Entry - Exit) / (SL - Entry)
  if (e > s) {
    return (x - e) / (e - s);
  } else {
    return (e - x) / (s - e);
  }
}

calcWinLoss(returns: number): string {
  if (returns > 0) return 'Win';
  if (returns < -0.1) return 'Loss';
  return 'Breakeven';
}

loadBacktests() {
    this.tradeService.getBacktests(this.currentUser).subscribe((data: any[]) => {
      this.backtests = data;
    });
  }

  submitBacktest(asset: string, date: string, entry: string, sl: string, exit: string) {
    const returns = this.calcReturns(entry, sl, exit);
    const newRecord = {
      username: this.currentUser,
      asset: asset || 'Unknown',
      date: date,
      direction: this.calcDirection(entry, sl),
      entry: parseFloat(entry),
      stopLoss: parseFloat(sl),
      exit: parseFloat(exit),
      returns: returns,
      result: this.calcWinLoss(returns)
    };

    this.tradeService.saveBacktest(newRecord).subscribe(() => {
      this.loadBacktests(); 
    });
  }

deleteBacktest(id: string) {
  if (confirm('Delete this backtest record?')) {
    this.tradeService.deleteBacktest(id).subscribe({
      next: () => this.loadBacktests(),
      error: (err) => console.error("Delete failed", err)
    });
  }
}


// --- BACKTEST ANALYTICS ---
// --- HELPERS ---
  clearBacktestForm(asset: any, date: any, entry: any, sl: any, exit: any) {
    [asset, date, entry, sl, exit].forEach(i => i.value = '');
  }


  get btTotalTrades() { return this.backtests.length; }
  get btWinRate() {
    if (this.btTotalTrades === 0) return 0;
    return (this.backtests.filter(t => t.result === 'Win').length / this.btTotalTrades) * 100;
  }
  get btAverageR() {
    if (this.btTotalTrades === 0) return 0;
    return this.backtests.reduce((sum, t) => sum + t.returns, 0) / this.btTotalTrades;
  }
}
