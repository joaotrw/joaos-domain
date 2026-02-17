import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Component Imports
import { CryptoHubComponent } from './components/crypto-hub/crypto-hub.component';
import { ProjectTrackerComponent } from './components/project-tracker/project-tracker.component';
import { LoginComponent } from './components/login/login.component';
import { FinanceManagerComponent } from './components/finance-manager/finance-manager.component';

// Service Imports
import { AuthService } from './services/auth.service';
import { FinanceService } from './services/finance.service';
import { ProjectService } from './services/project.service';
import { TradeService } from './services/trade.service';
import { TaskService } from './services/task.service'; // NEW SERVICE
import { AutoEarnService } from './services/auto-earn.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, HttpClientModule, 
    CryptoHubComponent, ProjectTrackerComponent, 
    LoginComponent, FinanceManagerComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // 1. Inject Services
  public auth = inject(AuthService); 
  private finance = inject(FinanceService);
  private project = inject(ProjectService);
  private trade = inject(TradeService);
  private task = inject(TaskService); // NEW: Inject Task Service
  private autoEarn = inject(AutoEarnService);

  // 2. UI State
isLoggedIn = false;
  isRegisterMode = false;
  currentView: 'home' | 'crypto' | 'finance' | 'tasks' = 'home';
  
  // ADD THIS LINE BELOW
  userRole: string = 'User'; 
  
  currentUsername: string = '';
  
  // 3. Data Arrays
  allProjects: any[] = [];
  allTasks: any[] = []; // NEW: Standalone tasks array
  allTrades: any[] = [];
  allFinance: any[] = [];
  allIncome: any[] = [];
  goals: any[] = [];
  allEarnings: any[] = [];

  @ViewChild('financeRef') financeComponent!: FinanceManagerComponent;

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn;
    this.currentView = (localStorage.getItem('activeTab') as any) || 'home';
    
    if (this.isLoggedIn) {
      this.userRole = this.auth.userRole;
      this.syncData();
    }
  }

  // --- MASTER SYNC ---
  syncData() {
    console.log('🔄 Syncing All Systems...');
    this.currentUsername = localStorage.getItem('currentUser') || '';
    this.project.getProjects().subscribe(res => this.allProjects = res);
    this.task.getTasks().subscribe(res => this.allTasks = res); // NEW: Fetch Tasks
    this.trade.getTrades().subscribe(res => this.allTrades = res);
    this.finance.getFinance().subscribe(res => this.allFinance = res);
    this.finance.getIncome().subscribe(res => this.allIncome = res);
    this.finance.getGoals().subscribe(res => this.goals = res);
// Add (res: any) to tell TypeScript to stop complaining about the type
this.autoEarn.getEarnings().subscribe((res: any) => this.allEarnings = res); }

  // --- VIEW NAVIGATION ---
setView(view: 'home' | 'crypto' | 'finance' | 'tasks') {
  this.currentView = view;
  localStorage.setItem('activeTab', view);
  this.syncData();
}

  // --- STANDALONE TASK ACTIONS ---
  addGlobalTask(text: string) {
    this.task.addTask(text).subscribe(() => this.syncData());
  }

  toggleGlobalTask(id: string) {
    this.task.toggleTask(id).subscribe(() => this.syncData());
  }

  deleteGlobalTask(id: string) {
    this.task.deleteTask(id).subscribe(() => this.syncData());
  }

  // --- REMAINING AUTH & PROJECT ACTIONS ---
  onLogin(name: string, pass: string) {
    this.auth.login(name, pass).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.auth.saveSession(name, res.role);
          this.isLoggedIn = true;
          this.userRole = res.role;
          this.syncData();
        }
      },
      error: (err) => alert("Login Failed: " + (err.error.message || "Server Error"))
    });
  }

  onRegister(u: string, p: string) {
    this.auth.register(u, p).subscribe(() => {
      alert('Account Created! You can now login.');
      this.isRegisterMode = false;
    });
  }

  logout() {
    this.auth.clearSession();
    this.isLoggedIn = false;
    this.currentView = 'home';
  }

  addProject(title: string, desc: string) {
    this.project.addProject(title, desc).subscribe(() => this.syncData());
  }

  deleteProject(id: string) {
    this.project.deleteProject(id).subscribe(() => this.syncData());
  }

  toggleStatus(id: string) {
    this.project.updateStatus(id).subscribe(() => this.syncData());
  }

  addTask(id: string, text: string) {
    this.project.addTask(id, text).subscribe(() => this.syncData());
  }

  // --- TRADE & FINANCE GETTERS ---
addTrade(data: any) { 
  const formatted = { ...data, amount: Number(data.amount) }; // Force number
  this.trade.logTrade(formatted).subscribe(() => this.syncData()); 
}
addFinance(data: any) { 
  const formatted = { 
    ...data, 
    amount: Number(data.amount),
    createdBy: this.currentUsername // FIXED: Added required identity field
  }; 
  this.finance.addFinance(formatted).subscribe(() => this.syncData()); 
}

  deleteFinance(id: string) { this.finance.deleteFinance(id).subscribe(() => this.syncData()); }
addIncome(data: any) { 
  const formatted = { 
    ...data, 
    amount: Number(data.amount),
    createdBy: this.currentUsername // FIXED: Added required identity field
  }; 
  this.finance.addIncome(formatted).subscribe(() => this.syncData()); 
}
  deleteIncome(id: string) { this.finance.deleteIncome(id).subscribe(() => this.syncData()); }
  addGoal(data: any) { this.finance.addGoal(data).subscribe(() => this.syncData()); }
  updateGoal(data: any) { this.finance.updateGoalProgress(data.id, data.amount).subscribe(() => this.syncData()); }
  deleteGoal(id: string) { this.finance.deleteGoal(id).subscribe(() => this.syncData()); }

  addAutoEarn(data: any) {
  const payload = { ...data, username: this.currentUsername };
  this.autoEarn.addEarning(payload).subscribe(() => this.syncData());
}

deleteAutoEarn(id: string) {
  this.autoEarn.deleteEarning(id).subscribe(() => this.syncData());
}

updateAutoEarn(data: any) {
  // Replace 'autoEarnService' with your actual service name
  this.autoEarn.updateEarning(data.id, data).subscribe(() => this.syncData());
}

  get totalExpenses() { return this.finance.calculateTotal(this.allFinance); }
  get totalIncome() { return this.finance.calculateTotal(this.allIncome); }
  get netBalance() { return this.totalIncome - this.totalExpenses; }
  get capOne() { return this.finance.calculateBankBalance(this.allFinance, 'capital one'); }
  get santander() { return this.finance.calculateBankBalance(this.allFinance, 'santander'); }
  get winRate() { return this.trade.calculateWinRate(this.allTrades); }
  get cryptoNet() { return this.trade.calculateNetProfit(this.allTrades); }
}