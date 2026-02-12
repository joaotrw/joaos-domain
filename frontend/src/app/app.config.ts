import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http'; // Import this

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient() // Add this here
  ]
};