import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { API_BASE_URL } from '@/core/config/api.config';
import { AppNotification, UnreadCount } from '@/core/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL) + '/notifications';
  private readonly unreadState = signal(0);

  readonly unread = this.unreadState.asReadonly();

  list(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.api);
  }

  refreshUnreadCount(): Observable<number> {
    return this.http.get<UnreadCount>(this.api + '/unread-count').pipe(
      map((response) => response.count),
      tap((count) => this.unreadState.set(count)),
    );
  }

  markRead(id: number): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.api}/${id}/read`, {}).pipe(
      tap(() => {
        this.unreadState.update((count) => Math.max(0, count - 1));
      }),
    );
  }
}
