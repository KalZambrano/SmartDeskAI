import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@/core/config/api.config';
import { CategoryPayload, TicketCategory } from '@/core/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL) + '/categories';

  listActive(): Observable<TicketCategory[]> {
    return this.http.get<TicketCategory[]>(this.api);
  }

  list(): Observable<TicketCategory[]> {
    return this.http.get<TicketCategory[]>(`${this.api}/manage`);
  }

  create(payload: CategoryPayload): Observable<TicketCategory> {
    return this.http.post<TicketCategory>(this.api, payload);
  }

  update(id: number, payload: CategoryPayload): Observable<TicketCategory> {
    return this.http.put<TicketCategory>(`${this.api}/${id}`, payload);
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
