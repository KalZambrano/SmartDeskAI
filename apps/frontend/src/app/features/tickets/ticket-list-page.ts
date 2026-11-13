import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TicketService } from '@/core/services/ticket.service';
import { TicketSummary } from '@/core/models/ticket.model';

@Component({
  selector: 'app-ticket-list-page',
  imports: [RouterLink],
  template:
    '<section class="mx-auto max-w-6xl"><div class="flex items-end justify-between"><div><p class="text-sm text-ink-muted">Mesa de ayuda</p><h1 class="text-2xl font-semibold">Incidencias</h1></div><a routerLink="/incidencias/nueva" class="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white">Nueva incidencia</a></div>@if (error()) { <p role="alert" class="mt-6 bg-danger-50 p-4 text-sm text-danger-700">No se pudieron cargar las incidencias. Verifica tu sesión.</p> } @if (!error()) { <div class="mt-6 overflow-x-auto rounded-lg border border-line bg-white"><table class="w-full text-left text-sm"><thead class="border-b border-line bg-canvas text-xs uppercase text-ink-muted"><tr><th class="p-4">Código</th><th class="p-4">Incidencia</th><th class="p-4">Prioridad</th><th class="p-4">Estado</th><th class="p-4">Técnico</th></tr></thead><tbody>@for (ticket of tickets(); track ticket.id) { <tr class="border-b border-line"><td class="p-4">{{ ticket.ticketCode }}</td><td class="p-4"><a class="text-brand-700 hover:underline" [routerLink]="[ticket.id]">{{ ticket.title }}</a></td><td class="p-4">{{ ticket.priority }}</td><td class="p-4">{{ ticket.status }}</td><td class="p-4">{{ ticket.assignedTechnicianName || "Sin asignar" }}</td></tr> } @empty { <tr><td colspan="5" class="p-8 text-center text-ink-muted">No hay incidencias registradas.</td></tr> }</tbody></table></div> }</section>',
})
export class TicketListPage implements OnInit {
  private readonly api = inject(TicketService);
  protected readonly tickets = signal<TicketSummary[]>([]);
  protected readonly error = signal(false);
  ngOnInit(): void {
    this.api
      .list()
      .subscribe({ next: (data) => this.tickets.set(data), error: () => this.error.set(true) });
  }
}
