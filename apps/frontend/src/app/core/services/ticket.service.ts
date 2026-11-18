import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@/core/config/api.config';
import {
  CreateTicketRequest,
  TicketComment,
  TicketHistory,
  TicketFilters,
  TicketSummary,
  TicketStatus,
} from '@/core/models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL) + '/tickets';

  list(filters?: TicketFilters): Observable<TicketSummary[]> {
    let params = new HttpParams();
    if (filters?.q?.trim()) params = params.set('q', filters.q.trim());
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.priority) params = params.set('priority', filters.priority);
    if (filters?.categoryId != null) params = params.set('categoryId', filters.categoryId);
    return this.http.get<TicketSummary[]>(this.api, { params });
  }
  get(id: number): Observable<TicketSummary> {
    return this.http.get<TicketSummary>(this.api + '/' + id);
  }
  create(input: CreateTicketRequest): Observable<TicketSummary> {
    return this.http.post<TicketSummary>(this.api, input);
  }
  comments(id: number): Observable<TicketComment[]> {
    return this.http.get<TicketComment[]>(this.api + '/' + id + '/comments');
  }
  history(id: number): Observable<TicketHistory[]> {
    return this.http.get<TicketHistory[]>(this.api + '/' + id + '/history');
  }
  addComment(id: number, content: string): Observable<TicketComment> {
    return this.http.post<TicketComment>(this.api + '/' + id + '/comments', { content });
  }
  changeStatus(id: number, status: TicketStatus): Observable<TicketSummary> {
    return this.http.patch<TicketSummary>(this.api + '/' + id + '/status', { status });
  }
  assign(id: number, technicianId: number): Observable<TicketSummary> {
    return this.http.patch<TicketSummary>(this.api + '/' + id + '/assignment', { technicianId });
  }
  reclassify(id: number): Observable<TicketSummary> {
    return this.http.post<TicketSummary>(this.api + '/' + id + '/ai-analysis', {});
  }
}
