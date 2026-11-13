import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketService } from '@/core/services/ticket.service';

@Component({
  selector: 'app-ticket-create-page',
  imports: [ReactiveFormsModule, RouterLink],
  template:
    '<section class="mx-auto max-w-2xl"><a routerLink="/incidencias" class="text-sm text-brand-700">← Volver</a><h1 class="mt-3 text-2xl font-semibold">Nueva incidencia</h1><form class="mt-6 space-y-5 rounded-lg border border-line bg-white p-6" [formGroup]="form" (ngSubmit)="submit()"><label class="block text-sm font-medium">Título<input class="mt-1 w-full rounded-md border border-line px-3 py-2" formControlName="title" maxlength="150"></label><label class="block text-sm font-medium">Descripción<textarea class="mt-1 min-h-36 w-full rounded-md border border-line px-3 py-2" formControlName="description" maxlength="4000"></textarea></label><label class="block text-sm font-medium">Prioridad<select class="mt-1 w-full rounded-md border border-line px-3 py-2" formControlName="priority"><option value="LOW">Baja</option><option value="MEDIUM">Media</option><option value="HIGH">Alta</option><option value="CRITICAL">Crítica</option></select></label>@if (error()) { <p role="alert" class="text-sm text-danger-700">No se pudo registrar la incidencia.</p> }<button class="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white" [disabled]="form.invalid || saving()">{{ saving() ? "Guardando…" : "Registrar incidencia" }}</button></form></section>',
})
export class TicketCreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TicketService);
  private readonly router = inject(Router);
  protected readonly saving = signal(false);
  protected readonly error = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
    priority: ['MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'],
  });
  protected submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.api.create(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl('/incidencias'),
      error: () => {
        this.error.set(true);
        this.saving.set(false);
      },
    });
  }
}
