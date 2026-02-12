import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app'; // Updated path

bootstrapApplication(AppComponent)
  .catch((err) => console.error(err));