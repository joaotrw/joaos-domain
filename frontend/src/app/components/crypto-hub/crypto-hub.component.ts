import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { TradeService } from '../../services/trade.service';

@Component({
  selector: 'app-crypto-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crypto-hub.component.html',
  styleUrls: ['./crypto-hub.component.css']
})
export class CryptoHubComponent implements OnInit {
  private _allTrades: any[] = [];
  sortOrder: 'asc' | 'desc' = 'desc';

  @Input() set allTrades(value: any[]) {
    this._allTrades = value || [];
    this.sortTradesByDate(); 
    this.calculateAdvancedStats(); // Recalculate analytics whenever trades update
    setTimeout(() => this.cdr.detectChanges());
  }
  get allTrades(): any[] { return this._allTrades; }

  @Input() currentUser: string = ''; 
  @Input() totalTrades: number = 0;
  @Input() winRate: number = 0;
  @Input() totalNetProfit: number = 0;
  
  @Output() tradeAddedEvent = new EventEmitter<any>();
  @Output() tradeDeletedEvent = new EventEmitter<string>();

  backtests: any[] = [];
  cryptoSubView: 'log' | 'stats' | 'backtest' = 'log';
  selectedFileBase64: string | null = null;
  editingTradeId: string | null = null;

  // Analytics Stats
  expectancy: number = 0;
  avgR: number = 0;
  purpleWinRate: number = 0;
  standardWinRate: number = 0;
  strategyStats: any[] = [];

  constructor(private tradeService: TradeService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadBacktests();
  }

  // --- BACKTEST ANALYTICS ---
  get backtestExpectancy(): number {
    if (!this.backtests.length) return 0;
    const totalR = this.backtests.reduce((sum, bt) => sum + (bt.returns || 0), 0);
    return totalR / this.backtests.length;
  }

  get backtestWinRate(): number {
    if (!this.backtests.length) return 0;
    const wins = this.backtests.filter(bt => bt.result === 'Win').length;
    return (wins / this.backtests.length) * 100;
  }

  // --- SORTING ---
  toggleDateSort() {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    this.sortTradesByDate();
  }

  sortTradesByDate() {
    this._allTrades.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  // --- CALCULATE ANALYTICS TAB ---
calculateAdvancedStats() {
  const trades = this.allTrades;
  if (trades.length === 0) return;

  // 1. Global R-Multiple Stats
  const totalR = trades.reduce((sum, t) => sum + (t.rMultiple || 0), 0);
  this.avgR = totalR / trades.length;
    
  // 2. Define Wins and Losses based on money fields
  const wins = trades.filter(t => (t.realisedGains || 0) > 0);
  const losses = trades.filter(t => (t.realisedLoss || 0) > 0);
  const winProb = wins.length / trades.length;
  const lossProb = losses.length / trades.length;
    
  const avgWinR = wins.reduce((sum, t) => sum + (t.rMultiple || 0), 0) / (wins.length || 1);
  const avgLossR = Math.abs(losses.reduce((sum, t) => sum + (t.rMultiple || 0), 0) / (losses.length || 1));
    
  this.expectancy = (winProb * avgWinR) - (lossProb * avgLossR);

  // 3. Discipline Check (Purple Belt) - Updated to use realisedGains
  const purple = trades.filter(t => t.purpleBelt);
  const standard = trades.filter(t => !t.purpleBelt);
  
  this.purpleWinRate = purple.length 
    ? (purple.filter(t => (t.realisedGains || 0) > 0).length / purple.length) * 100 
    : 0;
  this.standardWinRate = standard.length 
    ? (standard.filter(t => (t.realisedGains || 0) > 0).length / standard.length) * 100 
    : 0;

  // 4. Strategy Performance with Expectancy
  const strategies = [...new Set(trades.map(t => t.strategy || 'Uncategorized'))];
  this.strategyStats = strategies.map(name => {
    const sTrades = trades.filter(t => (t.strategy || 'Uncategorized') === name);
    const sWins = sTrades.filter(t => (t.realisedGains || 0) > 0);
    const sLosses = sTrades.filter(t => (t.realisedLoss || 0) > 0);
    
    // Strategy specific probabilities
    const sWinProb = sWins.length / sTrades.length;
    const sLossProb = sLosses.length / sTrades.length;
    
    // Strategy specific average R
    const sAvgWinR = sWins.reduce((sum, t) => sum + (t.rMultiple || 0), 0) / (sWins.length || 1);
    const sAvgLossR = Math.abs(sLosses.reduce((sum, t) => sum + (t.rMultiple || 0), 0) / (sLosses.length || 1));

    return {
      name,
      count: sTrades.length,
      winRate: sWinProb * 100,
      expectancy: (sWinProb * sAvgWinR) - (sLossProb * sAvgLossR),
      profit: sTrades.reduce((sum, t) => sum + (t.realisedGains || 0) - (t.realisedLoss || 0), 0)
    };
  });
}

  // --- CRUD ACTIONS ---
 addTrade(
  date: any, asset: any, action: any, amount: any, price: any, 
  strategy: any, rMult: any, purple: any, platform: any, order: any, 
  sl: any, exitPrice: any, entryTime: any, exitDate: any, exitTime: any, 
  risk: any, expLoss: any, realLoss: any, realGain: any
) {
  const newTrade = {
    date: date.value || new Date().toISOString().split('T')[0],
    asset: asset.value.toUpperCase(),
    action: action.value,
    amount: parseFloat(amount.value),
    price: parseFloat(price.value),
    strategy: strategy.value,
    rMultiple: parseFloat(rMult.value) || 0,
    purpleBelt: purple.checked,
    platform: platform.value,
    orderType: order.value,
    stopLoss: parseFloat(sl.value),
    exitPrice: parseFloat(exitPrice.value),
    entryTime: entryTime.value,
    exitDate: exitDate.value,
    exitTime: exitTime.value,
    riskAmount: parseFloat(risk.value),
    expectedLoss: parseFloat(expLoss.value),
    realisedLoss: parseFloat(realLoss.value) || 0,
    realisedGains: parseFloat(realGain.value) || 0,
    image: this.selectedFileBase64,
    createdBy: this.currentUser,
    result: (parseFloat(realGain.value) > 0) ? 'Win' : (parseFloat(realLoss.value) > 0 ? 'Loss' : 'Pending')
  };

  this.tradeAddedEvent.emit(newTrade); //

  // Reset all fields
  [date, asset, amount, price, strategy, rMult, sl, exitPrice, entryTime, 
   exitDate, exitTime, risk, expLoss, realLoss, realGain].forEach(i => i.value = '');
  purple.checked = false;
  this.resetUpload();
}

  onDeleteTrade(id: string) {
    if (confirm('Delete this trade?')) this.tradeDeletedEvent.emit(id);
  }

  startEdit(record: any) { this.editingTradeId = record._id; }

  saveEdit(record: any) {
    this.tradeService.updateTrade(record._id, record).subscribe(() => {
      this.editingTradeId = null;
      this.calculateAdvancedStats();
      this.cdr.detectChanges();
    });
  }

  loadBacktests() {
    this.tradeService.getBacktests(this.currentUser).subscribe(data => {
      this.backtests = data;
      this.cdr.detectChanges();
    });
  }

  onSaveBacktest(asset: any, date: any, entry: any, sl: any, exit: any) {
    const returns = this.calcReturns(entry.value, sl.value, exit.value);
    const data = {
      username: this.currentUser,
      asset: asset.value.toUpperCase(),
      date: date.value,
      entry: parseFloat(entry.value),
      stopLoss: parseFloat(sl.value),
      exit: parseFloat(exit.value),
      direction: this.calcDirection(entry.value, sl.value),
      returns: returns,
      result: this.calcWinLoss(returns),
      image: this.selectedFileBase64
    };
    this.tradeService.saveBacktest(data).subscribe(() => this.loadBacktests());
  }

  deleteBacktest(id: string) {
    if (confirm('Delete record?')) this.tradeService.deleteBacktest(id).subscribe(() => this.loadBacktests());
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => { this.selectedFileBase64 = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

  resetUpload() { this.selectedFileBase64 = null; }
  calcDirection(e: any, s: any) { return parseFloat(e) > parseFloat(s) ? 'Long' : 'Short'; }
  calcReturns(e: any, s: any, x: any) {
    const entry = parseFloat(e), sl = parseFloat(s), exit = parseFloat(x);
    if (!entry || !sl || !exit || entry === sl) return 0;
    return entry > sl ? (exit - entry) / (entry - sl) : (entry - exit) / (sl - entry);
  }
  calcWinLoss(r: number) { 
    if (r > 0) return 'Win';
    if (r < -0.1) return 'Loss';
    return 'Breakeven';
  }
}