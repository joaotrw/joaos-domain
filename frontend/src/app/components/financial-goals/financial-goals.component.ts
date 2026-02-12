import { Component, Input, Output, EventEmitter } from '@angular/core'; // MUST be @angular/core
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-financial-goals',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './financial-goals.component.html',
  styleUrls: ['./financial-goals.component.css']
})
export class FinancialGoalsComponent {
  @Input() goals: any[] = [];
  showGoalForm = false; 

  @Output() addGoal = new EventEmitter<{name: string, target: any, date: string}>();
  @Output() updateGoal = new EventEmitter<{id: string, amount: any}>();
  @Output() deleteGoal = new EventEmitter<string>();

  // This helper calculates percent for the HTML
  getPercent(current: number, target: number): number {
    if (!target || target === 0) return 0;
    const percent = (current / target) * 100;
    return percent > 100 ? 100 : percent;
  }

  onAddGoal(name: string, target: any, date: string) {
    this.addGoal.emit({ name, target, date });
    this.showGoalForm = false;
  }

  onUpdateGoal(id: string, amount: any) {
    this.updateGoal.emit({ id, amount });
  }

  onDeleteGoal(id: string) {
    this.deleteGoal.emit(id);
  }
}