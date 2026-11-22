import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideActivity,
  LucideBell,
  LucideLogOut,
  LucideMenu,
  LucideTicket,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { AuthService } from '@/core/services/auth.service';
import { NotificationService } from '@/core/services/notification.service';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideActivity,
    LucideBell,
    LucideLogOut,
    LucideMenu,
    LucideTicket,
    LucideUsers,
    LucideX,
  ],
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  protected readonly isMenuOpen = signal(false);
  protected readonly user = this.auth.user;
  protected readonly unread = this.notifications.unread;
  protected readonly canCreateTicket = computed(() => {
    const role = this.user()?.role;
    return role === 'REQUESTER' || role === 'ADMIN';
  });
  protected readonly canManageMasters = computed(() => this.user()?.role === 'ADMIN');
  protected readonly roleLabel = computed(
    () =>
      ({ ADMIN: 'Administrador', TECHNICIAN: 'Técnico', REQUESTER: 'Solicitante' })[
        this.user()?.role ?? 'REQUESTER'
      ],
  );

  constructor() {
    this.notifications.refreshUnreadCount().subscribe({ error: () => undefined });
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected logout(): void {
    this.auth.logout();
    this.closeMenu();
    void this.router.navigateByUrl('/login');
  }
}
