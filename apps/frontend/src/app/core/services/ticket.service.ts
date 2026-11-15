import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@/core/config/api.config';
import {
  CreateTicketRequest,
  TicketComment,
  TicketHistory,
  TicketSummary,
  TicketStatus,
} from '@/core/models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL) + '/tickets';

  list(): Observable<TicketSummary[]> {
    return this.http.get<TicketSummary[]>(this.api);
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
}
