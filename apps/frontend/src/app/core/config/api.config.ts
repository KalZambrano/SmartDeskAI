import { InjectionToken } from '@angular/core';

/**
 * Prefijo de la API REST. Es relativo para funcionar sin CORS.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api/v1',
});
