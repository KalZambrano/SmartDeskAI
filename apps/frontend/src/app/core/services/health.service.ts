import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@/core/config/api.config';
import { HealthStatus } from '@/core/models/health.model';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getHealth(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(this.apiBaseUrl + '/health');
  }
}
