import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // 1. Import this!
import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CryptoHubComponent } from './components/crypto-hub/crypto-hub.component';
import { ProjectTrackerComponent } from './components/project-tracker/project-tracker.component';
import { LoginComponent } from './components/login/login.component';
import { FinanceManagerComponent } from './components/finance-manager/finance-manager.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CryptoHubComponent,
    ProjectTrackerComponent,
    LoginComponent,
    FinanceManagerComponent, // FinancialGoalsComponent IS GONE FROM HERE
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);

  // Variables
  isLoggedIn = false;
  isRegisterMode = false;
  loginError = "";
  serverMessage = "Systems Standby";
  allUsers: any[] = [];
  allProjects: any[] = [];
  selectedProject: any = null;
  currentView: 'home' | 'crypto' | 'finance' = 'home'; // Controls which page is visible
allTrades: any[] = [];
cryptoSubView: 'log' | 'stats' = 'log';
allFinance: any[] = [];
@ViewChild('fAmount') amountInput!: ElementRef;
@ViewChild('fDesc') descInput!: ElementRef;
incomeSubView: 'expenses' | 'income' = 'expenses';
allIncome: any[] = [];
goals: any[] = [];
showGoalForm = false; // Controls form visibility

// Update ngOnInit to remember the role on refresh
ngOnInit() {
  const savedLogin = localStorage.getItem('isLoggedIn');
  if (savedLogin === 'true') {
    this.isLoggedIn = true;
    this.userRole = localStorage.getItem('userRole') || 'User';
    
    // RUN INITIAL SYNC IMMEDIATELY
    this.syncData(); 
  }
}

// Create a master sync function
syncData() {
  console.log('Initiating Master Sync...');
  this.checkServer();
  this.loadUsers();
  this.loadProjects();
  this.loadTrades();
  this.loadFinance();
  this.loadGoals(); // <--- ADD THIS LINE
}

userRole: string = 'User';

  // 2. AUTHENTICATION LOGIC
login(name: string, pass: string) {
  this.http.post<{success: boolean, message: string, role: string}>('${environment.apiUrl}/login', 
    { username: name, password: pass })
    .subscribe({
      next: (res) => {
        if (res.success) {
          this.isLoggedIn = true;
          this.userRole = res.role;
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userRole', res.role);
          
          // SYNC DATA IMMEDIATELY ON LOGIN
          this.syncData(); 
        }
      }
    });
}

  logout() {
    this.isLoggedIn = false;
    // CLEAR LOCAL STORAGE
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
  }

register(name: string, pass: string) {
  this.http.post<{success: boolean, message: string}>('${environment.apiUrl}/register', 
    { username: name, password: pass }) // Send both
    .subscribe({

        next: (res) => {
          alert(res.message);
          this.isRegisterMode = false;
          this.loginError = "";
        },
        error: (err) => {
          this.loginError = err.error.message || "Registration failed.";
        }
      });
  }

  // 3. DATA & SERVER MANAGEMENT
loadUsers() {
    this.http.get<any[]>(`${environment.apiUrl}/users`)
      .subscribe({
        next: (data) => this.allUsers = data,
        error: (err) => console.error("Could not load users", err)
      });
  }

  deleteUser(id: string) {
    if (confirm('Warning: This will permanently remove this user. Proceed?')) {
      this.http.delete(`${environment.apiUrl}/users/${id}`)
        .subscribe({
          next: () => this.loadUsers(),
          error: (err) => alert('Delete failed.')
        });
    }
  }

  checkServer() {
    this.http.get<{message: string}>('${environment.apiUrl}/welcome')
      .subscribe({
        next: (data) => this.serverMessage = data.message,
        error: (err) => {
          this.serverMessage = "Server Offline";
          console.error(err);
        }
      });
  }

  loadProjects() {
  this.http.get<any[]>('${environment.apiUrl}/projects')
    .subscribe(data => this.allProjects = data);
}

selectProject(project: any) {
  this.selectedProject = project;
}

addTask(projectId: string, taskText: string) {
  if (!taskText) return;
  this.http.post(`${environment.apiUrl}/projects/${projectId}/tasks`, { text: taskText })
    .subscribe((updatedProject: any) => {
      this.selectedProject = updatedProject; 
      this.loadProjects(); // <--- This keeps the background grid in sync!
    });
}

addProject(title: string, desc: string) {
  const user = localStorage.getItem('currentUser') || 'Unknown';
  this.http.post('${environment.apiUrl}/projects', { 
    title, 
    description: desc, 
    createdBy: user 
  }).subscribe(() => {
    this.loadProjects(); // Refresh the list
  });
}

deleteProject(id: string) {
  this.http.delete(`${environment.apiUrl}/projects/${id}`)
    .subscribe(() => this.loadProjects());
}

toggleStatus(id: string) {
  this.http.put(`${environment.apiUrl}/projects/${id}/status`, {})
    .subscribe(() => this.loadProjects());
}

// Add this function to your class
refreshDashboard() {
  this.syncData();
  console.log('All systems synced across all tabs.');
}

// Function to switch pages
setView(view: 'home' | 'crypto' | 'finance') {
  this.currentView = view;
  if (view === 'crypto') { this.loadTrades(); }
  if (view === 'finance') { this.loadFinance(); 
    this.loadFinance(); // Loads Expenses
    this.loadIncome();  // Loads Income
  } // New call
    this.cryptoSubView = 'log'; // Default to the logger/history
  }


loadTrades() {
  this.http.get<any[]>(`${environment.apiUrl}/trades`)
    .subscribe(data => this.allTrades = data);
}

addTrade(form: any) {
  const finalTradeData = {
    date: form.entryDate,
    asset: form.symbol,
    action: form.direction,
    amount: parseFloat(form.positionSize),
    price: parseFloat(form.entryPrice),
    strategy: form.strategy,
    rMultiple: parseFloat(form.rMultiple),
    purpleBelt: form.isPurpleBelt,
    platform: form.platform,
    orderType: form.entryOrderType,
    stopLoss: parseFloat(form.stopLoss),
    exitPrice: parseFloat(form.exitPrice),
    entryTime: form.entryTime,
    exitDate: form.exitDate,
    exitTime: form.exitTime,
    riskAmount: parseFloat(form.riskAmount),
    expectedLoss: parseFloat(form.expectedLoss),
realisedLoss: parseFloat(form.realisedLoss) || 0,
realisedGains: parseFloat(form.realisedGains) || 0,
    createdBy: localStorage.getItem('currentUser')
  };

  this.http.post('${environment.apiUrl}/trades', finalTradeData)
    .subscribe(() => {
      this.loadTrades();
      alert('Trade Logged to Database!');
    });
}

// Add these inside your AppComponent class
get totalTrades() { return this.allTrades.length; }

get winRate() {
  const wins = this.allTrades.filter(t => (t.realisedGains || 0) > 0).length;
  return this.totalTrades > 0 ? (wins / this.totalTrades) * 100 : 0;
}

get totalNetProfit() {
  const gains = this.allTrades.reduce((sum, t) => sum + (t.realisedGains || 0), 0);
  const losses = this.allTrades.reduce((sum, t) => sum + (t.realisedLoss || 0), 0);
  return gains - losses;
}

get averageR() {
  const totalR = this.allTrades.reduce((sum, t) => sum + (t.rMultiple || 0), 0);
  return this.totalTrades > 0 ? totalR / this.totalTrades : 0;
}

getStrategyStats(systemName: string) {
  const strategyTrades = this.allTrades.filter(t => t.strategy === systemName);
  const count = strategyTrades.length;
  const gains = strategyTrades.reduce((sum, t) => sum + (t.realisedGains || 0), 0);
  const losses = strategyTrades.reduce((sum, t) => sum + (t.realisedLoss || 0), 0);
  const net = gains - losses;

  return { count, net };
}

// 2. Add this helper getter for the date input
get today() { return new Date().toISOString().split('T')[0]; }

// Add these getters inside your AppComponent class
get capitalOneBalance(): number {
  const income = this.allIncome
    .filter(i => i.source === 'Salary') // Or however you want to attribute income
    .reduce((sum, i) => sum + i.amount, 0);
    
  const expenses = this.allFinance
    .filter(f => f.bank === 'Capital One')
    .reduce((sum, f) => sum + f.amount, 0);
    
  return income - expenses; 
}

get santanderBalance(): number {
  return this.allFinance
    .filter(item => item.bank === 'Santander')
    .reduce((sum, item) => sum + (item.amount || 0), 0);
}

get totalExpenses(): number {
  return this.allFinance.reduce((sum, item) => sum + (item.amount || 0), 0);
}

get totalIncome(): number {
  return this.allIncome.reduce((sum, item) => sum + (item.amount || 0), 0);
}

get totalNetBalance(): number {
  return this.totalIncome - this.totalExpenses;
}

loadFinance() {
  this.http.get<any[]>('${environment.apiUrl}/finance')
    .subscribe(data => this.allFinance = data);
}

addFinanceTransaction(data: any) {
  // 1. Validate data before sending
  if(!data.amount || !data.date) {
    alert("Please enter a date and amount");
    return;
  }

  const finalData = {
    ...data,
    amount: parseFloat(data.amount),
    createdBy: localStorage.getItem('currentUser') || 'Joao' 
  };

  this.http.post('${environment.apiUrl}/finance', finalData).subscribe({
    next: (res) => {
      console.log('Server Response:', res);
      this.loadFinance(); // Refresh the array
      
      // 2. Clear inputs safely after we know the server got the data
      if (this.amountInput) this.amountInput.nativeElement.value = '';
      if (this.descInput) this.descInput.nativeElement.value = '';
    },
    error: (err) => console.error('Add failed', err)
  });
}

deleteFinanceTransaction(id: string) {
  if (confirm('Permanently delete this transaction?')) {
    this.http.delete(`${environment.apiUrl}/finance/${id}`).subscribe({
      next: () => {
        this.loadFinance(); // <--- REFRESHES LIST
        console.log('Transaction deleted and list refreshed');
      },
      error: (err) => alert("Delete failed. Check server connection.")
    });
  }
}

loadIncome() {
  this.http.get<any[]>('${environment.apiUrl}/income')
    .subscribe(data => this.allIncome = data);
}

addIncome(data: any) {
  const finalData = {
    ...data,
    amount: parseFloat(data.amount),
    createdBy: localStorage.getItem('currentUser') || 'Joao'
  };

  this.http.post('${environment.apiUrl}/income', finalData).subscribe(() => {
    this.loadIncome();
  });
}

deleteIncome(id: string) {
  if (confirm('Delete this income entry?')) {
    this.http.delete(`${environment.apiUrl}/income/${id}`).subscribe(() => {
      this.loadIncome();
    });
  }
}

// Calculate percentage for the progress bar
getPercent(current: number, target: number): number {
  const percent = (current / target) * 100;
  return percent > 100 ? 100 : percent; // Cap at 100%
}

loadGoals() {
  this.http.get<any[]>('${environment.apiUrl}/goals')
    .subscribe(data => this.goals = data);
}

addGoal(name: string, target: string, deadline: string) { // Change target type to string
  const targetNumber = Number(target); // Convert it here
  
  if (!name || isNaN(targetNumber) || targetNumber <= 0) {
    alert("Please enter a valid goal name and target amount.");
    return;
  }

  const newGoal = {
    name,
    targetAmount: targetNumber,
    currentAmount: 0,
    deadline,
    createdBy: localStorage.getItem('currentUser') || 'Joao'
  };

  this.http.post('${environment.apiUrl}/goals', newGoal).subscribe(() => {
    this.loadGoals(); // Refresh the list
    alert('Goal created!');
  });
}

// Update progress (e.g., adding $500 to the goal)
updateGoalProgress(goalId: string, addedAmount: string) {
  const amountToAdd = parseFloat(addedAmount);
  
  if (isNaN(amountToAdd) || amountToAdd <= 0) {
    alert("Please enter a valid amount to add.");
    return;
  }

  // Sending the PATCH request
  this.http.patch(`${environment.apiUrl}/goals/${goalId}`, { amount: amountToAdd })
    .subscribe({
      next: (updatedGoal) => {
        // Find the goal in our local array and update it so the UI moves instantly
        const index = this.goals.findIndex(g => g._id === goalId);
        if (index !== -1) {
          this.goals[index] = updatedGoal;
        }
        console.log('Goal updated successfully!');
      },
      error: (err) => console.error('Failed to update goal', err)
    });
}

deleteGoal(id: string) {
  if (confirm('Are you sure you want to delete this goal?')) {
    this.http.delete(`${environment.apiUrl}/goals/${id}`).subscribe({
      next: () => this.loadGoals(),
      error: (err) => console.error("Could not delete goal", err)
    });
  }
}




}