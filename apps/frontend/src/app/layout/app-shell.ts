import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideActivity, LucideLogOut, LucideMenu, LucideTicket, LucideX } from '@lucide/angular';
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideActivity,
    LucideLogOut,
    LucideMenu,
    LucideTicket,
    LucideX,
  ],
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly isMenuOpen = signal(false);
  protected readonly user = this.auth.user;
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
