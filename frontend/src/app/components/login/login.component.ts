import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @Input() loginError: string | null = null;
  
  // These are the "events" that send data to app.component
  @Output() loginEvent = new EventEmitter<{u: string, p: string}>();
  @Output() registerEvent = new EventEmitter<{u: string, p: string}>();

  isRegisterMode = false;

  // This function is what the (click) calls
  onLogin(u: string, p: string) {
    this.loginEvent.emit({ u, p }); 
  }

  onRegister(u: string, p: string) {
    this.registerEvent.emit({ u, p });
  }
}