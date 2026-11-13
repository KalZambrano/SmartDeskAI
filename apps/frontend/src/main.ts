import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((error: unknown) => {
  document.body.textContent = 'No se pudo iniciar la aplicación.';
  throw error;
});
