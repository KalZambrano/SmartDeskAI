import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCheck, LucideChevronRight } from '@lucide/angular';
import { AppNotification } from '@/core/models/notification.model';
import { NotificationService } from '@/core/services/notification.service';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-notifications-page',
  imports: [DatePipe, RouterLink, LucideCheck, LucideChevronRight],
  templateUrl: './notifications-page.html',
})
export class NotificationsPage implements OnInit {
  private readonly api = inject(NotificationService);

  protected readonly items = signal<AppNotification[]>([]);
  protected readonly loadState = signal<LoadState>('loading');
  protected readonly busyId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
    this.api.refreshUnreadCount().subscribe({ error: () => undefined });
  }

  protected load(): void {
    this.loadState.set('loading');
    this.api.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loadState.set('success');
      },
      error: () => this.loadState.set('error'),
    });
  }

  protected markRead(notification: AppNotification): void {
    if (notification.readAt || this.busyId() !== null) return;
    this.busyId.set(notification.id);
    this.api.markRead(notification.id).subscribe({
      next: (updated) => {
        this.items.update((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        );
      },
      error: () => undefined,
      complete: () => this.busyId.set(null),
    });
  }
}
