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
  editingId: string | null = null;
  // --- Inputs ---
  @Input() allFinance: any[] = [];
  @Input() allIncome: any[] = [];
  @Input() goals: any[] = [];
  @Input() today: string = '';
  @Input() allEarnings: any[] = [];

  @Input() totalIncome: number = 0;
  @Input() totalExpenses: number = 0;
  @Input() totalNetBalance: number = 0;
  @Input() capitalOneBalance: number = 0; 
  @Input() santanderBalance: number = 0; 

  // --- Outputs ---
  @Output() addExpenseEvent = new EventEmitter<any>();
  @Output() deleteExpenseEvent = new EventEmitter<string>();
  @Output() addIncomeEvent = new EventEmitter<any>();
  @Output() deleteIncomeEvent = new EventEmitter<string>();
  
  @Output() addGoalEvent = new EventEmitter<any>();
  @Output() updateGoalEvent = new EventEmitter<any>();
  @Output() deleteGoalEvent = new EventEmitter<any>();
  
  @Output() addAutoEarnEvent = new EventEmitter<any>();
  @Output() deleteAutoEarnEvent = new EventEmitter<string>();
  @Output() updateAutoEarnEvent = new EventEmitter<any>(); // Add this new output

  @ViewChild('fAmount') amountInput!: ElementRef;
  @ViewChild('fDesc') descInput!: ElementRef;

  incomeSubView: 'expenses' | 'income' | 'transactions' | 'stats' | 'autoearn' = 'expenses';

  // --- Methods ---
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

  onAddTotal(month: string, amount: string) {
    if (month && amount) {
      this.addAutoEarnEvent.emit({
        platform: month, // Month/Label
        asset: 'Total',
        amount: Number(amount),
        apy: 0
      });
    }
  }

  // --- Getters (Now properly placed inside the class) ---

  get yearlyTotal() {
    return (this.allEarnings || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }

  get allTransactions() {
    const expenses = (this.allFinance || []).map(f => ({
      ...f,
      txType: 'Expense',
      displaySource: f.bank || 'Unknown Bank',
      displayNote: f.category || f.description || 'No Details',
      isNegative: true,
      sortDate: f.date ? new Date(f.date).getTime() : 0
    }));

    const income = (this.allIncome || []).map(i => ({
      ...i,
      txType: 'Income',
      displaySource: i.source || 'General Income',
      displayNote: i.note || 'No Note',
      isNegative: false,
      sortDate: i.date ? new Date(i.date).getTime() : 0
    }));

    return [...expenses, ...income].sort((a, b) => b.sortDate - a.sortDate);
  }

get monthlyStats() {
  const stats: { [key: string]: { month: string, spent: number, earned: number } } = {};

  // 1. Process Expenses (allFinance)
  (this.allFinance || []).forEach(item => {
    const date = new Date(item.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!stats[key]) stats[key] = { month: monthName, spent: 0, earned: 0 };
    stats[key].spent += Number(item.amount) || 0;
  });

  // 2. Process Income (allIncome) - ADDED TO THE SAME KEY
  (this.allIncome || []).forEach(item => {
    const date = new Date(item.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!stats[key]) stats[key] = { month: monthName, spent: 0, earned: 0 };
    stats[key].earned += Number(item.amount) || 0;
  });

  // 3. Return combined array and calculate the percentage
  return Object.values(stats)
    .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
    .map(stat => {
      const net = stat.earned - stat.spent;
      // If income is 0 and you have expenses, savings is 0%. 
      // Otherwise: (Net / Income) * 100
      const percentSaved = stat.earned > 0 ? (net / stat.earned) * 100 : 0;
      
      return {
        ...stat,
        net: net,
        percentSaved: percentSaved > 0 ? percentSaved.toFixed(1) : '0.0'
      };
    });
}

  get categoryStats() {
    const categories: { [key: string]: number } = {
      'Dining': 0, 'Merchandise': 0, 'Gas/Automotive': 0, 'Bill': 0, 'Other': 0
    };

    (this.allFinance || []).forEach(item => {
      if (categories.hasOwnProperty(item.category)) {
        categories[item.category] += Number(item.amount) || 0;
      } else {
        categories['Other'] += Number(item.amount) || 0;
      }
    });

    return Object.keys(categories)
      .map(name => ({ name, total: categories[name] }))
      .filter(cat => cat.total > 0)
      .sort((a, b) => b.total - a.total);
  }

  getMonthlySummary() {
    const summary: any = {};
    this.allFinance.forEach(f => {
        const month = new Date(f.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!summary[month]) summary[month] = { income: 0, expenses: 0 };
        if (f.type === 'Income') summary[month].income += f.amount;
        else summary[month].expenses += f.amount;
    });

    return Object.keys(summary).map(month => {
        const income = summary[month].income;
        const expenses = summary[month].expenses;
        const net = income - expenses;
        
        // New calculation: Avoid division by zero if income is 0
        const percentSaved = income > 0 ? (net / income) * 100 : 0;

        return {
            month,
            income,
            expenses,
            net,
            percentSaved: percentSaved.toFixed(1) // Keep one decimal point
        };
    });
}

  startEdit(item: any) {
  this.editingId = item._id;
}

cancelEdit() {
  this.editingId = null;
}

saveEdit(item: any, newLabel: string, newAmount: string) {
  if (newLabel && newAmount) {
    this.updateAutoEarnEvent.emit({
      id: item._id,
      platform: newLabel,
      asset: 'Total',
      amount: Number(newAmount)
    });
    this.editingId = null; // Exit edit mode
  }
}

}