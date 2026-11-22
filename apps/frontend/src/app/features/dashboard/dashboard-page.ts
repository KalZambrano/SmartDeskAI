import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { ChartData, ChartOptions } from 'chart.js';
import {
  LucideArrowRight,
  LucideDownload,
  LucideRotateCcw,
  LucideTable,
  LucideUserRoundX,
} from '@lucide/angular';
import { DatePickerModule } from 'primeng/datepicker';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { AuthService } from '@/core/services/auth.service';
import { CategoryService } from '@/core/services/category.service';
import { DashboardService } from '@/core/services/dashboard.service';
import { DashboardFilters, DashboardSummary } from '@/core/models/dashboard.model';
import { TicketCategory } from '@/core/models/category.model';
import { TicketPriority, TicketStatus } from '@/core/models/ticket.model';

type LoadState = 'loading' | 'success' | 'error';

const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: 'Crítica',
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#d97706',
  MEDIUM: '#2554d6',
  LOW: '#15803d',
};

const SERIES_COLORS = ['#2554d6', '#15803d', '#d97706', '#7c3aed', '#0891b2', '#64748b'];

@Component({
  selector: 'app-dashboard-page',
  imports: [
    FormsModule,
    RouterLink,
    ChartModule,
    DatePickerModule,
    SelectModule,
    LucideArrowRight,
    LucideDownload,
    LucideRotateCcw,
    LucideTable,
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
  protected readonly showTables = signal(false);
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

  protected readonly primaryKpis = computed(() => {
    const data = this.summary();
    if (!data) return [];
    return [
      { label: 'Total', value: data.total, hint: 'en el periodo', color: '#14307c' },
      { label: 'Abiertas', value: data.open, hint: 'sin atender', color: '#2554d6' },
      { label: 'Resueltas', value: data.resolved, hint: 'finalizadas', color: '#15803d' },
      { label: 'Vencidas', value: data.overdue, hint: 'requieren atención', color: '#dc2626' },
    ];
  });

  protected readonly secondaryKpis = computed(() => {
    const data = this.summary();
    if (!data) return [];
    return [
      { label: 'En atención', value: data.inProgress },
      { label: 'Pendientes', value: data.pending },
      { label: 'Cerradas', value: data.closed },
      { label: 'Resolución prom. (h)', value: data.averageResolutionHours },
    ];
  });

  protected readonly priorityLegend = computed(() =>
    Object.entries(this.summary()?.byPriority ?? {})
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        label: PRIORITY_LABELS[key] ?? key,
        value,
        color: PRIORITY_COLORS[key] ?? '#64748b',
      })),
  );

  protected readonly categoryLegend = computed(() =>
    Object.entries(this.summary()?.byCategory ?? {}).map(([label, value], index) => ({
      label,
      value,
      color: SERIES_COLORS[index % SERIES_COLORS.length]!,
    })),
  );

  protected readonly workloadLegend = computed(() =>
    (this.summary()?.workload ?? []).map((item, index) => ({
      label: item.technician,
      value: item.activeTickets,
      color: SERIES_COLORS[index % SERIES_COLORS.length]!,
    })),
  );

  protected readonly timeline = computed(() => this.summary()?.timeline ?? []);

  protected readonly timelineTotals = computed(() => {
    const points = this.timeline();
    return {
      created: points.reduce((sum, point) => sum + point.created, 0),
      resolved: points.reduce((sum, point) => sum + point.resolved, 0),
    };
  });

  protected readonly priorityChart = computed<ChartData<'doughnut'>>(() => {
    const legend = this.priorityLegend();
    return {
      labels: legend.map((item) => item.label),
      datasets: [
        {
          data: legend.map((item) => item.value),
          backgroundColor: legend.map((item) => item.color),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  });

  protected readonly categoryChart = computed<ChartData<'bar'>>(() => {
    const legend = this.categoryLegend();
    return {
      labels: legend.map((item) => item.label),
      datasets: [
        {
          label: 'Incidencias',
          data: legend.map((item) => item.value),
          backgroundColor: legend.map((item) => item.color),
          borderRadius: 4,
        },
      ],
    };
  });

  protected readonly workloadChart = computed<ChartData<'bar'>>(() => {
    const legend = this.workloadLegend();
    return {
      labels: legend.map((item) => item.label),
      datasets: [
        {
          label: 'Incidencias activas',
          data: legend.map((item) => item.value),
          backgroundColor: legend.map((item) => item.color),
          borderRadius: 4,
        },
      ],
    };
  });

  protected readonly timelineChart = computed<ChartData<'line'>>(() => ({
    labels: this.timeline().map((point) => point.date.slice(5)),
    datasets: [
      {
        label: 'Creadas',
        data: this.timeline().map((point) => point.created),
        borderColor: '#2554d6',
        backgroundColor: 'rgba(37, 84, 214, 0.12)',
        borderDash: [],
        pointRadius: 2,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Resueltas',
        data: this.timeline().map((point) => point.resolved),
        borderColor: '#15803d',
        backgroundColor: 'rgba(21, 128, 61, 0.08)',
        borderDash: [6, 4],
        pointRadius: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  }));

  protected readonly doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: { legend: { display: false } },
  };

  protected readonly barOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eef1f5' } },
      y: { grid: { display: false } },
    },
  };

  protected readonly lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true } },
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#eef1f5' } },
    },
  };

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
