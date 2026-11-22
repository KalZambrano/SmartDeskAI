import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@/core/config/api.config';
import { DashboardFilters, DashboardSummary } from '@/core/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL) + '/dashboard';

  summary(filters: DashboardFilters): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(this.api + '/summary', { params: this.params(filters) });
  }

  exportCsv(filters: DashboardFilters): Observable<Blob> {
    return this.http.get(this.api + '/reports/export', {
      params: this.params(filters),
      responseType: 'blob',
    });
  }

  private params(filters: DashboardFilters): HttpParams {
    let params = new HttpParams();
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.categoryId != null) params = params.set('categoryId', filters.categoryId);
    return params;
  }
}
