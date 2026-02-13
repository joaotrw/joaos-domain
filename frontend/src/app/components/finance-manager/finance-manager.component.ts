// 1. Added ViewChild, ElementRef, and salt-to-taste imports
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
  @Input() santanderBalance: number = 0; // Keep this so your Santander box stays alive!

  @Output() addExpenseEvent = new EventEmitter<any>();
  @Output() deleteExpenseEvent = new EventEmitter<string>();
  @Output() addIncomeEvent = new EventEmitter<any>();
  @Output() deleteIncomeEvent = new EventEmitter<string>();
  
  @Output() addGoalEvent = new EventEmitter<any>();
  @Output() updateGoalEvent = new EventEmitter<any>();
  @Output() deleteGoalEvent = new EventEmitter<any>();

  // 2. These are now correctly inside the class
  @ViewChild('fAmount') amountInput!: ElementRef;
  @ViewChild('fDesc') descInput!: ElementRef;

  incomeSubView: 'expenses' | 'income' = 'expenses';

  // 3. resetForm is now a method of the class
  resetForm() {
    if (this.amountInput) this.amountInput.nativeElement.value = '';
    if (this.descInput) this.descInput.nativeElement.value = '';
  }

  // Helper methods to trigger emits
  onAddExpense(data: any) { this.addExpenseEvent.emit(data); }
  onDeleteExpense(id: string) { this.deleteExpenseEvent.emit(id); }
  onAddIncome(data: any) { this.addIncomeEvent.emit(data); }
  onDeleteIncome(id: string) { this.deleteIncomeEvent.emit(id); }

  // Goal Pass-throughs
  onAddGoal(goal: any) { this.addGoalEvent.emit(goal); }
  onUpdateGoal(data: any) { this.updateGoalEvent.emit(data); }
  onDeleteGoal(id: any) { this.deleteGoalEvent.emit(id); }
}