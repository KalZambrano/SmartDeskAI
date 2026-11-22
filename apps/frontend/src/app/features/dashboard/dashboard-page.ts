import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideDownload,
  LucideRotateCcw,
  LucideUserRoundX,
} from '@lucide/angular';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { AuthService } from '@/core/services/auth.service';
import { CategoryService } from '@/core/services/category.service';
import { DashboardService } from '@/core/services/dashboard.service';
import { DashboardFilters, DashboardSummary } from '@/core/models/dashboard.model';
import { TicketCategory } from '@/core/models/category.model';
import { TicketPriority, TicketStatus } from '@/core/models/ticket.model';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    FormsModule,
    RouterLink,
    DatePickerModule,
    SelectModule,
    LucideArrowRight,
    LucideDownload,
    LucideRotateCcw,
    LucideUserRoundX,
  ],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage implements OnInit {
  private readonly api = inject(DashboardService);
  private readonly auth = inject(AuthService);
  private readonly categoriesApi = inject(CategoryService);

  protected readonly summary = signal<DashboardSummary | null>(null);
  protected readonly categories = signal<TicketCategory[]>([]);
  protected readonly loadState = signal<LoadState>('loading');
  protected readonly exporting = signal(false);
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly status = signal<TicketStatus | ''>('');
  protected readonly priority = signal<TicketPriority | ''>('');
  protected readonly categoryId = signal<number | null>(null);

  protected readonly isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');
  // ponytail: la clave "Sin asignar" viene del aggregate de workload; si cambia el rótulo en backend,
  // exponer un campo `unassigned` explícito en DashboardSummary y usarlo acá.
  protected readonly unassigned = computed(
    () =>
      this.summary()?.workload.find((item) => item.technician === 'Sin asignar')?.activeTickets ??
      0,
  );
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

  ngOnInit(): void {
    this.categoriesApi.listActive().subscribe({ next: (items) => this.categories.set(items) });
    this.load();
  }

  protected load(): void {
    this.loadState.set('loading');
    this.api.summary(this.filters()).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loadState.set('success');
      },
      error: () => this.loadState.set('error'),
    });
  }

  protected clearFilters(): void {
    this.from.set('');
    this.to.set('');
    this.status.set('');
    this.priority.set('');
    this.categoryId.set(null);
    this.load();
  }

  protected exportCsv(): void {
    this.exporting.set(true);
    this.api.exportCsv(this.filters()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'smartdesk-report.csv';
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => undefined,
      complete: () => this.exporting.set(false),
    });
  }

  protected entries(map: Record<string, number> | undefined): [string, number][] {
    return map ? Object.entries(map) : [];
  }

  private filters(): DashboardFilters {
    return {
      from: this.toIso(this.from()),
      to: this.toIso(this.to()),
      status: this.status() || undefined,
      priority: this.priority() || undefined,
      categoryId: this.categoryId() ?? undefined,
    };
  }

  private toIso(date: string): string | undefined {
    if (!date) return undefined;
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }
}
