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
  // --- Inputs & Outputs ---
  @Input() currentUser: string = ''; 
  @Input() allTrades: any[] = [];
  @Input() totalTrades: number = 0;
  @Input() winRate: number = 0;
  @Input() totalNetProfit: number = 0;
  @Output() tradeAddedEvent = new EventEmitter<any>();
  @Output() tradeDeletedEvent = new EventEmitter<string>();

  // --- State Variables ---
  backtests: any[] = [];
  cryptoSubView: 'log' | 'stats' | 'backtest' = 'log';
  previewUrl: string | null = null;
  selectedFileBase64: string | null = null;

  constructor(private tradeService: TradeService) {}

  ngOnInit() {
    if (this.currentUser) {
      this.loadBacktests();
    }
  }

  // --- Navigation & View Logic ---
  setSubView(view: 'log' | 'stats' | 'backtest') {
    this.cryptoSubView = view;
  }

  // --- Image Handling ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedFileBase64 = reader.result as string; 
        this.previewUrl = reader.result as string;       
      };
      reader.readAsDataURL(file);
    }
  }

  // --- Professional Trade Logger ---
  submitProfessionalTrade(data: any) {
    const tradeLog = {
      ...data,
      createdBy: this.currentUser,
      price: parseFloat(data.price),
      exitPrice: parseFloat(data.exitPrice),
      amount: parseFloat(data.amount),
      rMultiple: parseFloat(data.rMultiple),
      realisedLoss: parseFloat(data.realisedLoss),
      realisedGains: parseFloat(data.realisedGains),
      riskAmount: parseFloat(data.riskAmount),
      expectedLoss: data.riskAmount
    };
    this.tradeAddedEvent.emit(tradeLog);
  }

  onDeleteTrade(id: string) {
    if (confirm('Delete this trade permanently?')) {
      this.tradeDeletedEvent.emit(id);
    }
  }

  // --- Backtesting Logic ---
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
      result: this.calcWinLoss(returns),
      image: this.selectedFileBase64 // The screenshot data
    };

    this.tradeService.saveBacktest(newRecord).subscribe({
      next: () => {
        this.loadBacktests();
        this.selectedFileBase64 = null;
        this.previewUrl = null;
      },
      error: (err) => console.error("Save backtest failed", err)
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

  // --- Backtesting Calculations ---
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

    if (e > s) { // Long
      return (x - e) / (e - s);
    } else { // Short
      return (e - x) / (s - e);
    }
  }

  calcWinLoss(returns: number): string {
    if (returns > 0) return 'Win';
    if (returns < -0.1) return 'Loss';
    return 'Breakeven';
  }

  clearBacktestForm(asset: any, date: any, entry: any, sl: any, exit: any) {
    [asset, date, entry, sl, exit].forEach(i => i.value = '');
    this.previewUrl = null;
    this.selectedFileBase64 = null;
  }

  // --- Backtesting Analytics Getters ---
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