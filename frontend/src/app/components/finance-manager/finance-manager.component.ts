import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FinancialGoalsComponent } from '../financial-goals/financial-goals.component';

@Component({
  selector: 'app-finance-manager',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FinancialGoalsComponent],
  templateUrl: './finance-manager.component.html',
  styleUrls: ['./finance-manager.component.css']
})
export class FinanceManagerComponent {
  @Input() allFinance: any[] = [];
  @Input() allIncome: any[] = [];
  @Input() goals: any[] = [];
  @Input() today: string = '';

  @Input() totalIncome: number = 0;
  @Input() totalExpenses: number = 0;
  @Input() totalNetBalance: number = 0;
  @Input() capitalOneBalance: number = 0; 
  @Input() santanderBalance: number = 0; 

  @Output() addExpenseEvent = new EventEmitter<any>();
  @Output() deleteExpenseEvent = new EventEmitter<string>();
  @Output() addIncomeEvent = new EventEmitter<any>();
  @Output() deleteIncomeEvent = new EventEmitter<string>();
  
  @Output() addGoalEvent = new EventEmitter<any>();
  @Output() updateGoalEvent = new EventEmitter<any>();
  @Output() deleteGoalEvent = new EventEmitter<any>();

  @ViewChild('fAmount') amountInput!: ElementRef;
  @ViewChild('fDesc') descInput!: ElementRef;

  // Added 'transactions' to the view options
  incomeSubView: 'expenses' | 'income' | 'stats' | 'transactions' = 'expenses';

  resetForm() {
    if (this.amountInput) this.amountInput.nativeElement.value = '';
    if (this.descInput) this.descInput.nativeElement.value = '';
  }

  onAddExpense(data: any) { 
    this.addExpenseEvent.emit(data); 
    this.resetForm(); 
  }
  
  onDeleteExpense(id: string) { this.deleteExpenseEvent.emit(id); }
  onAddIncome(data: any) { this.addIncomeEvent.emit(data); }
  onDeleteIncome(id: string) { this.deleteIncomeEvent.emit(id); }
  onAddGoal(goal: any) { this.addGoalEvent.emit(goal); }
  onUpdateGoal(data: any) { this.updateGoalEvent.emit(data); }
  onDeleteGoal(id: any) { this.deleteGoalEvent.emit(id); }

  // Logic to merge and sort all database entries
// Logic to merge and sort all database entries with data-safety fallbacks
  get allTransactions() {
    // 1. Process Expenses (Finance)
    const expenses = this.allFinance.map(f => ({
      ...f,
      txType: 'Expense',
      // Fallback: If bank is missing, show 'Unknown Bank'
      displaySource: f.bank || 'Unknown Bank',
      // Fallback: If category is missing, show 'Uncategorized'
      displayNote: f.category || f.description || 'No Details',
      isNegative: true,
      // Ensure date exists for sorting, fallback to a very old date if missing
      sortDate: f.date ? new Date(f.date).getTime() : 0
    }));

    // 2. Process Income
    const income = this.allIncome.map(i => ({
      ...i,
      txType: 'Income',
      // Fallback: If source is missing, show 'General Income'
      displaySource: i.source || 'General Income',
      displayNote: i.note || 'No Note',
      isNegative: false,
      sortDate: i.date ? new Date(i.date).getTime() : 0
    }));

    // 3. Combine and Sort
    return [...expenses, ...income].sort((a, b) => b.sortDate - a.sortDate);
  }

  get monthlyStats() {
    const stats: { [key: string]: { month: string, spent: number, earned: number } } = {};

    this.allFinance.forEach(item => {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!stats[key]) stats[key] = { month: monthName, spent: 0, earned: 0 };
      stats[key].spent += Number(item.amount) || 0;
    });

    this.allIncome.forEach(item => {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!stats[key]) stats[key] = { month: monthName, spent: 0, earned: 0 };
      stats[key].earned += Number(item.amount) || 0;
    });

    return Object.values(stats).sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
  }

  // Add this getter to finance-manager.component.ts

get categoryStats() {
  const categories: { [key: string]: number } = {
    'Dining': 0,
    'Merchandise': 0,
    'Gas/Automotive': 0,
    'Bill': 0,
    'Other': 0
  };

  this.allFinance.forEach(item => {
    // If the category matches one of our keys, add to it, otherwise add to 'Other'
    if (categories.hasOwnProperty(item.category)) {
      categories[item.category] += Number(item.amount) || 0;
    } else {
      categories['Other'] += Number(item.amount) || 0;
    }
  });

  // Convert to an array and sort by highest spent first
  return Object.keys(categories)
    .map(name => ({ name, total: categories[name] }))
    .filter(cat => cat.total > 0) // Only show categories with spending
    .sort((a, b) => b.total - a.total);
}
}