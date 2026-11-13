import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TicketComment, TicketHistory, TicketSummary } from '@/core/models/ticket.model';
import { TicketService } from '@/core/services/ticket.service';

@Component({
  selector: 'app-ticket-detail-page',
  imports: [ReactiveFormsModule, DatePipe],
  template:
    '<section class="mx-auto max-w-4xl"><a href="/incidencias" class="text-sm text-brand-700">← Incidencias</a>@if(ticket(); as t){<div class="mt-4 flex flex-wrap justify-between gap-3"><div><p class="text-sm text-ink-muted">{{t.ticketCode}} · {{t.status}}</p><h1 class="text-2xl font-semibold">{{t.title}}</h1></div><select class="rounded-md border border-line px-3 py-2" [value]="t.status" (change)="setStatus($event)"><option value="OPEN">Abierta</option><option value="IN_PROGRESS">En atención</option><option value="PENDING">Pendiente</option><option value="RESOLVED">Resuelta</option><option value="CLOSED">Cerrada</option></select></div><div class="mt-5 rounded-lg border border-line bg-white p-5"><p class="whitespace-pre-wrap">{{t.description}}</p><p class="mt-4 text-sm text-ink-muted">Prioridad {{t.priority}} · Solicitante {{t.requesterName}} · Técnico {{t.assignedTechnicianName || "Sin asignar"}}</p></div>}<div class="mt-6 grid gap-6 md:grid-cols-2"><section class="rounded-lg border border-line bg-white p-5"><h2 class="font-semibold">Comentarios</h2><form class="mt-3" [formGroup]="form" (ngSubmit)="addComment()"><textarea class="w-full rounded-md border border-line p-3" formControlName="content" maxlength="2000" aria-label="Comentario"></textarea><button class="mt-2 rounded-md bg-brand-600 px-3 py-2 text-sm text-white" [disabled]="form.invalid">Agregar comentario</button></form>@for(c of comments(); track c.id){<article class="mt-4 border-t border-line pt-3"><p class="text-sm">{{c.content}}</p><p class="mt-1 text-xs text-ink-muted">{{c.authorName}} · {{c.createdAt | date:"short"}}</p></article>}</section><section class="rounded-lg border border-line bg-white p-5"><h2 class="font-semibold">Historial</h2>@for(h of history(); track h.id){<article class="mt-4 border-l-2 border-brand-100 pl-3"><p class="text-sm">{{h.description}}</p><p class="text-xs text-ink-muted">{{h.createdAt | date:"short"}}</p></article>}</section></div>@if(error()){<p role="alert" class="mt-4 text-sm text-danger-700">No se pudo completar la operación.</p>}</section>',
})
export class TicketDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(TicketService);
  private readonly fb = inject(FormBuilder);
  protected readonly ticket = signal<TicketSummary | null>(null);
  protected readonly comments = signal<TicketComment[]>([]);
  protected readonly history = signal<TicketHistory[]>([]);
  protected readonly error = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(2000)]],
  });
  private id = 0;
  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.api
      .get(this.id)
      .subscribe({ next: (v) => this.ticket.set(v), error: () => this.error.set(true) });
    this.refresh();
  }
  private refresh(): void {
    this.api
      .comments(this.id)
      .subscribe({ next: (v) => this.comments.set(v), error: () => this.error.set(true) });
    this.api
      .history(this.id)
      .subscribe({ next: (v) => this.history.set(v), error: () => this.error.set(true) });
  }
  protected addComment(): void {
    if (this.form.invalid) return;
    this.api.addComment(this.id, this.form.controls.content.value).subscribe({
      next: () => {
        this.form.reset();
        this.refresh();
      },
      error: () => this.error.set(true),
    });
  }
  protected setStatus(event: Event): void {
    const status = (event.target as HTMLSelectElement)
      .value as import('@/core/models/ticket.model').TicketStatus;
    this.api.changeStatus(this.id, status).subscribe({
      next: () => {
        this.api.get(this.id).subscribe((v) => this.ticket.set(v));
        this.refresh();
      },
      error: () => this.error.set(true),
    });
  }
}
