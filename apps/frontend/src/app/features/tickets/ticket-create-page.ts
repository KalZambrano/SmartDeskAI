import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CategoryService } from '@/core/services/category.service';
import { TicketCategory } from '@/core/models/category.model';
import { TicketPriority } from '@/core/models/ticket.model';
import { TicketService } from '@/core/services/ticket.service';

@Component({
  selector: 'app-ticket-create-page',
  imports: [ReactiveFormsModule, RouterLink, SelectModule, InputTextModule, TextareaModule],
  templateUrl: './ticket-create-page.html',
})
export class TicketCreatePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TicketService);
  private readonly categoryApi = inject(CategoryService);
  private readonly router = inject(Router);

  protected readonly saving = signal(false);
  protected readonly loadingCategories = signal(true);
  protected readonly error = signal('');
  protected readonly categories = signal<TicketCategory[]>([]);
  protected readonly priorityOptions = [
    { label: 'Baja', value: 'LOW' as TicketPriority },
    { label: 'Media', value: 'MEDIUM' as TicketPriority },
    { label: 'Alta', value: 'HIGH' as TicketPriority },
    { label: 'Crítica', value: 'CRITICAL' as TicketPriority },
  ];

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
    categoryId: [null as number | null],
    priority: ['MEDIUM' as TicketPriority, Validators.required],
  });

  ngOnInit(): void {
    this.categoryApi.listActive().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {
        this.error.set(
          'No se pudieron cargar las categorías. Puedes registrar la incidencia sin categoría.',
        );
        this.loadingCategories.set(false);
      },
      complete: () => this.loadingCategories.set(false),
    });
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    const { categoryId, ...ticket } = this.form.getRawValue();
    this.api.create({ ...ticket, ...(categoryId === null ? {} : { categoryId }) }).subscribe({
      next: (created) => void this.router.navigate(['/incidencias', created.id]),
      error: () => {
        this.error.set(
          'No se pudo registrar la incidencia. Verifica los datos e inténtalo de nuevo.',
        );
        this.saving.set(false);
      },
    });
  }
}
