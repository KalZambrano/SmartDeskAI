import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { AuthService } from '@/core/services/auth.service';
import {
  TicketComment,
  TicketHistory,
  TicketStatus,
  TicketSummary,
} from '@/core/models/ticket.model';
import { TicketService } from '@/core/services/ticket.service';
import { TechnicianOption } from '@/core/models/technician.model';
import { TechnicianService } from '@/core/services/technician.service';

@Component({
  selector: 'app-ticket-detail-page',
  imports: [ReactiveFormsModule, DatePipe, FormsModule, RouterLink, SelectModule, TextareaModule],
  templateUrl: './ticket-detail-page.html',
})
export class TicketDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(TicketService);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly technicianApi = inject(TechnicianService);
  protected readonly ticket = signal<TicketSummary | null>(null);
  protected readonly comments = signal<TicketComment[]>([]);
  protected readonly history = signal<TicketHistory[]>([]);
  protected readonly error = signal('');
  protected readonly loading = signal(true);
  protected readonly savingComment = signal(false);
  protected readonly savingStatus = signal(false);
  protected readonly savingAssignment = signal(false);
  protected readonly loadingTechnicians = signal(false);
  protected readonly technicians = signal<TechnicianOption[]>([]);
  protected readonly selectedTechnicianId = signal<number | null>(null);
  protected readonly assignmentMessage = signal('');
  protected readonly assignmentError = signal('');
  protected readonly classificationBusy = signal(false);
  protected readonly classificationMessage = signal('');
  protected readonly classificationError = signal('');
  protected readonly canChangeStatus = computed(() => {
    const role = this.auth.user()?.role;
    return role === 'ADMIN' || role === 'TECHNICIAN';
  });
  protected readonly canAssignTechnician = computed(() => this.auth.user()?.role === 'ADMIN');
  protected readonly statusOptions = computed(() => {
    const current = this.ticket()?.status;
    if (!current) return [];
    const labels: Record<TicketStatus, string> = {
      OPEN: 'Abierta',
      IN_PROGRESS: 'En atención',
      PENDING: 'Pendiente',
      RESOLVED: 'Resuelta',
      CLOSED: 'Cerrada',
    };
    const transitions: Partial<Record<TicketStatus, TicketStatus[]>> = {
      OPEN: ['IN_PROGRESS', 'PENDING', 'RESOLVED'],
      IN_PROGRESS: ['PENDING', 'RESOLVED'],
      PENDING: ['IN_PROGRESS', 'RESOLVED'],
      RESOLVED: ['CLOSED'],
      CLOSED: [],
    };
    return [
      { label: labels[current], value: current, disabled: true },
      ...(transitions[current] ?? []).map((value) => ({ label: labels[value], value })),
    ];
  });
  protected readonly form = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(2000)]],
  });
  private id = 0;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(this.id) || this.id <= 0) {
      this.error.set('El identificador de la incidencia no es válido.');
      this.loading.set(false);
      return;
    }
    this.loadTicket();
    this.refreshDiscussion();
  }

  private loadTicket(): void {
    this.api.get(this.id).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        this.selectedTechnicianId.set(null);
        if (this.canAssignTechnician()) this.loadTechnicians();
      },
      error: () => {
        this.error.set('No se pudo cargar la incidencia. Comprueba que tengas permiso para verla.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  private loadTechnicians(): void {
    this.loadingTechnicians.set(true);
    this.technicianApi.listActive().subscribe({
      next: (technicians) => this.technicians.set(technicians),
      error: () => {
        this.assignmentError.set('No se pudo cargar la lista de técnicos activos.');
        this.loadingTechnicians.set(false);
      },
      complete: () => this.loadingTechnicians.set(false),
    });
  }

  protected selectTechnician(id: number | null): void {
    this.selectedTechnicianId.set(id);
    this.assignmentError.set('');
    this.assignmentMessage.set('');
  }

  protected isCurrentTechnicianSelection(): boolean {
    const selectedId = this.selectedTechnicianId();
    const currentName = this.ticket()?.assignedTechnicianName;
    return (
      selectedId !== null &&
      this.technicians().some(
        (technician) => technician.id === selectedId && technician.fullName === currentName,
      )
    );
  }

  protected assignTechnician(): void {
    const id = this.selectedTechnicianId();
    if (id === null || this.isCurrentTechnicianSelection() || this.savingAssignment()) return;
    this.savingAssignment.set(true);
    this.assignmentError.set('');
    this.assignmentMessage.set('');
    this.api.assign(this.id, id).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        this.assignmentMessage.set('Técnico asignado correctamente.');
        this.refreshDiscussion();
      },
      error: () => {
        this.assignmentError.set('No se pudo asignar el técnico. Verifica que siga activo.');
        this.savingAssignment.set(false);
      },
      complete: () => this.savingAssignment.set(false),
    });
  }

  protected reclassify(): void {
    if (this.classificationBusy()) return;
    this.classificationBusy.set(true);
    this.classificationMessage.set('');
    this.classificationError.set('');
    this.api.reclassify(this.id).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        this.classificationMessage.set(
          ticket.aiClassificationSource === 'AI'
            ? 'Sugerencias actualizadas con Gemini.'
            : 'Gemini no está disponible; se actualizaron las sugerencias con reglas locales.',
        );
        this.refreshDiscussion();
      },
      error: () => {
        this.classificationError.set('No se pudieron actualizar las sugerencias.');
        this.classificationBusy.set(false);
      },
      complete: () => this.classificationBusy.set(false),
    });
  }

  private refreshDiscussion(): void {
    this.api.comments(this.id).subscribe({
      next: (items) => this.comments.set(items),
      error: () => this.error.set('No se pudieron cargar los comentarios.'),
    });
    this.api.history(this.id).subscribe({
      next: (items) => this.history.set(items),
      error: () => this.error.set('No se pudo cargar el historial.'),
    });
  }

  protected addComment(): void {
    if (this.form.invalid || this.savingComment()) return;
    this.savingComment.set(true);
    this.error.set('');
    this.api.addComment(this.id, this.form.controls.content.value.trim()).subscribe({
      next: () => {
        this.form.reset();
        this.refreshDiscussion();
      },
      error: () => {
        this.error.set('No se pudo agregar el comentario.');
        this.savingComment.set(false);
      },
      complete: () => this.savingComment.set(false),
    });
  }

  protected setStatus(status: TicketStatus): void {
    if (!status || status === this.ticket()?.status || this.savingStatus()) return;
    this.savingStatus.set(true);
    this.error.set('');
    this.api.changeStatus(this.id, status).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        this.refreshDiscussion();
      },
      error: () => {
        this.error.set('No se pudo cambiar el estado. La transición puede no estar permitida.');
        const current = this.ticket();
        if (current) this.ticket.set({ ...current });
        this.savingStatus.set(false);
      },
      complete: () => this.savingStatus.set(false),
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

  protected priorityLabel(priority: TicketSummary['priority']): string {
    return { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica' }[priority];
  }

  protected classificationPriorityLabel(priority: TicketSummary['aiSuggestedPriority']): string {
    return priority ? this.priorityLabel(priority) : 'Sin sugerencia';
  }
}
