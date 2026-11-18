import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AuthService } from '@/core/services/auth.service';
import { TicketPriority, TicketStatus, TicketSummary } from '@/core/models/ticket.model';
import { CategoryService } from '@/core/services/category.service';
import { TicketCategory } from '@/core/models/category.model';
import { TicketService } from '@/core/services/ticket.service';
import { AssigneeCell } from './components/assignee-cell';
import { PriorityIndicator } from './components/priority-indicator';
import { StatusIndicator } from './components/status-indicator';

@Component({
  selector: 'app-ticket-list-page',
  imports: [
    RouterLink,
    DatePipe,
    FormsModule,
    InputTextModule,
    SelectModule,
    PriorityIndicator,
    StatusIndicator,
    AssigneeCell,
  ],
  templateUrl: './ticket-list-page.html',
})
export class TicketListPage implements OnInit {
  private readonly api = inject(TicketService);
  private readonly categoriesApi = inject(CategoryService);
  private readonly auth = inject(AuthService);
  protected readonly tickets = signal<TicketSummary[]>([]);
  protected readonly categories = signal<TicketCategory[]>([]);
  protected readonly error = signal('');
  protected readonly loading = signal(true);
  protected readonly search = signal('');
  protected readonly status = signal<TicketStatus | ''>('');
  protected readonly priority = signal<TicketPriority | ''>('');
  protected readonly categoryId = signal<number | null>(null);
  protected readonly statusOptions: { label: string; value: TicketStatus | '' }[] = [
    { label: 'Todos', value: '' },
    { label: 'Abierta', value: 'OPEN' },
    { label: 'En atención', value: 'IN_PROGRESS' },
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'Resuelta', value: 'RESOLVED' },
    { label: 'Cerrada', value: 'CLOSED' },
  ];
  protected readonly priorityOptions: { label: string; value: TicketPriority | '' }[] = [
    { label: 'Todas', value: '' },
    { label: 'Baja', value: 'LOW' },
    { label: 'Media', value: 'MEDIUM' },
    { label: 'Alta', value: 'HIGH' },
    { label: 'Crítica', value: 'CRITICAL' },
  ];
  protected readonly categoryOptions = computed(() => [
    { label: 'Todas', value: null as number | null },
    ...this.categories().map((category) => ({ label: category.name, value: category.id })),
  ]);
  private requestId = 0;

  protected readonly hasFilters = computed(
    () =>
      !!this.search().trim() || !!this.status() || !!this.priority() || this.categoryId() !== null,
  );
  protected readonly canCreate = computed(() => {
    const role = this.auth.user()?.role;
    return role === 'REQUESTER' || role === 'ADMIN';
  });
  protected readonly heading = computed(() =>
    this.auth.user()?.role === 'TECHNICIAN' ? 'Mis incidencias asignadas' : 'Incidencias',
  );

  ngOnInit(): void {
    this.categoriesApi.listActive().subscribe({ next: (data) => this.categories.set(data) });
    this.load();
  }

  protected setSearch(value: string): void {
    this.search.set(value);
    this.load();
  }

  protected setStatus(value: TicketStatus | ''): void {
    this.status.set(value);
    this.load();
  }

  protected setPriority(value: TicketPriority | ''): void {
    this.priority.set(value);
    this.load();
  }

  protected setCategory(value: number | null): void {
    this.categoryId.set(value);
    this.load();
  }

  protected clearFilters(): void {
    this.search.set('');
    this.status.set('');
    this.priority.set('');
    this.categoryId.set(null);
    this.load();
  }

  private load(): void {
    const id = ++this.requestId;
    this.loading.set(true);
    this.error.set('');
    this.api
      .list({
        q: this.search().trim(),
        status: this.status() || undefined,
        priority: this.priority() || undefined,
        categoryId: this.categoryId() ?? undefined,
      })
      .subscribe({
        next: (data) => {
          if (id === this.requestId) this.tickets.set(data);
        },
        error: () => {
          if (id === this.requestId) {
            this.error.set(
              'No se pudieron cargar las incidencias. Verifica tu sesión y vuelve a intentarlo.',
            );
          }
        },
        complete: () => {
          if (id === this.requestId) this.loading.set(false);
        },
      });
  }
}
