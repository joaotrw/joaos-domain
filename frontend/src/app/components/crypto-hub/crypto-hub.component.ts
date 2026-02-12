import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-crypto-hub',
  standalone: true,
  imports: [CommonModule, DecimalPipe, UpperCasePipe],
  templateUrl: './crypto-hub.component.html',
  styleUrls: ['./crypto-hub.component.css']
})
export class CryptoHubComponent {
  // Data from parent
  @Input() allTrades: any[] = [];
  @Input() totalTrades: number = 0;
  @Input() winRate: number = 0;
  @Input() totalNetProfit: number = 0;

  // Action to send back to parent
  @Output() tradeAddedEvent = new EventEmitter<any>();

  cryptoSubView: 'log' | 'stats' = 'log';

  // The wrapper function to handle the emit
  onLogTrade(tradeData: any) {
    this.tradeAddedEvent.emit(tradeData);
  }
}