import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';
import { TicketPriority, TicketStatus, TicketSummary } from '@/core/models/ticket.model';
import { TicketService } from '@/core/services/ticket.service';

@Component({
  selector: 'app-ticket-list-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './ticket-list-page.html',
})
export class TicketListPage implements OnInit {
  private readonly api = inject(TicketService);
  private readonly auth = inject(AuthService);
  protected readonly tickets = signal<TicketSummary[]>([]);
  protected readonly error = signal('');
  protected readonly loading = signal(true);
  protected readonly canCreate = computed(() => {
    const role = this.auth.user()?.role;
    return role === 'REQUESTER' || role === 'ADMIN';
  });
  protected readonly heading = computed(() =>
    this.auth.user()?.role === 'TECHNICIAN' ? 'Mis incidencias asignadas' : 'Incidencias',
  );

  ngOnInit(): void {
    this.api.list().subscribe({
      next: (data) => this.tickets.set(data),
      error: () =>
        this.error.set(
          'No se pudieron cargar las incidencias. Verifica tu sesión y vuelve a intentarlo.',
        ),
      complete: () => this.loading.set(false),
    });
  }

  protected statusLabel(status: TicketStatus): string {
    return {
      OPEN: 'Abierta',
      IN_PROGRESS: 'En atención',
      PENDING: 'Pendiente',
      RESOLVED: 'Resuelta',
      CLOSED: 'Cerrada',
    }[status];
  }

  protected priorityLabel(priority: TicketPriority): string {
    return { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica' }[priority];
  }
}
