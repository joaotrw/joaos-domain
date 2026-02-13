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
public auth = inject(AuthService); // NEW: Change 'private' to 'public'
  private finance = inject(FinanceService);
  private project = inject(ProjectService);
  private trade = inject(TradeService);

  // 2. UI State
  isLoggedIn = false;
  isRegisterMode = false;
  currentView: 'home' | 'crypto' | 'finance' = 'home';
  userRole = 'User';
  
  // 3. Data Arrays
  allProjects: any[] = [];
  allTrades: any[] = [];
  allFinance: any[] = [];
  allIncome: any[] = [];
  goals: any[] = [];

  @ViewChild('financeRef') financeComponent!: FinanceManagerComponent;

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn;
    this.currentView = (localStorage.getItem('activeTab') as any) || 'home';
    
    if (this.isLoggedIn) {
      this.userRole = this.auth.userRole;
      this.syncData();
    }
  }

  currentUsername: string = '';

  // --- MASTER SYNC ---
  syncData() {
    console.log('🔄 Syncing All Systems...');
    this.currentUsername = localStorage.getItem('currentUser') || ''; // Get the name from storage
    this.project.getProjects().subscribe(res => this.allProjects = res);
    this.trade.getTrades().subscribe(res => this.allTrades = res);
    this.finance.getFinance().subscribe(res => this.allFinance = res);
    this.finance.getIncome().subscribe(res => this.allIncome = res);
    this.finance.getGoals().subscribe(res => this.goals = res);
  }

  // --- AUTH ACTIONS ---
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
    error: (err) => {
      // This will pop up the error message from your Node server
      alert("Login Failed: " + (err.error.message || "Server Error"));
      console.error("Login Error Details:", err);
    }
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

  // --- PROJECT ACTIONS ---
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

  // --- TRADE ACTIONS ---
  addTrade(data: any) {
    this.trade.logTrade(data).subscribe(() => this.syncData());
  }

  // --- FINANCE ACTIONS ---
  addFinance(data: any) {
    this.finance.addFinance(data).subscribe(() => this.syncData());
  }

  deleteFinance(id: string) {
    this.finance.deleteFinance(id).subscribe(() => this.syncData());
  }

  addIncome(data: any) {
    this.finance.addIncome(data).subscribe(() => this.syncData());
  }

  deleteIncome(id: string) {
    this.finance.deleteIncome(id).subscribe(() => this.syncData());
  }

  addGoal(data: any) {
    this.finance.addGoal(data).subscribe(() => this.syncData());
  }

  updateGoal(data: any) {
    this.finance.updateGoalProgress(data.id, data.amount).subscribe(() => this.syncData());
  }

  deleteGoal(id: string) {
    this.finance.deleteGoal(id).subscribe(() => this.syncData());
  }

  // --- GETTERS ---
  get totalExpenses() { return this.finance.calculateTotal(this.allFinance); }
  get totalIncome() { return this.finance.calculateTotal(this.allIncome); }
  get netBalance() { return this.totalIncome - this.totalExpenses; }
  get capOne() { return this.finance.calculateBankBalance(this.allFinance, 'capital one'); }
  get santander() { return this.finance.calculateBankBalance(this.allFinance, 'santander'); }
  get winRate() { return this.trade.calculateWinRate(this.allTrades); }
  get cryptoNet() { return this.trade.calculateNetProfit(this.allTrades); }

  // --- VIEW NAVIGATION ---
  setView(view: 'home' | 'crypto' | 'finance') {
    this.currentView = view;
    localStorage.setItem('activeTab', view);
    this.syncData();
  }
}