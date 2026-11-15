import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucidePencil, LucidePlus, LucidePower, LucideRotateCcw, LucideX } from '@lucide/angular';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CategoryPayload, TicketCategory } from '@/core/models/category.model';
import { CategoryService } from '@/core/services/category.service';

@Component({
  selector: 'app-categories-page',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    LucidePencil,
    LucidePlus,
    LucidePower,
    LucideRotateCcw,
    LucideX,
  ],
  templateUrl: './categories-page.html',
})
export class CategoriesPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CategoryService);

  protected readonly categories = signal<TicketCategory[]>([]);
  protected readonly editing = signal<TicketCategory | null>(null);
  protected readonly modalOpen = signal(false);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    code: [
      '',
      [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9_-]+$/)],
    ],
    description: ['', Validators.maxLength(255)],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {
        this.error.set(
          'No se pudieron cargar las categorías. Verifica tu sesión e inténtalo nuevamente.',
        );
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  protected create(): void {
    this.editing.set(null);
    this.form.reset();
    this.error.set('');
    this.notice.set('');
    this.modalOpen.set(true);
  }

  protected edit(category: TicketCategory): void {
    this.editing.set(category);
    this.notice.set('');
    this.error.set('');
    this.form.setValue({
      name: category.name,
      code: category.code,
      description: category.description ?? '',
    });
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
    this.editing.set(null);
    this.form.reset();
    this.error.set('');
  }

  /** Cierra el diálogo solo cuando el clic cae en el fondo y no dentro del panel. */
  protected dismissOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModal();
  }

  protected save(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    this.notice.set('');
    const current = this.editing();
    const values = this.form.getRawValue();
    const payload: CategoryPayload = {
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      description: values.description.trim() || null,
      ...(current ? { active: current.active } : {}),
    };
    const request = current ? this.api.update(current.id, payload) : this.api.create(payload);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notice.set(current ? 'Categoría actualizada.' : 'Categoría creada.');
        this.closeModal();
        this.loadCategories();
      },
      error: (response: { status?: number }) => {
        this.saving.set(false);
        this.error.set(
          response.status === 409
            ? 'Ya existe una categoría con ese nombre o código.'
            : 'No se pudo guardar la categoría. Revisa los datos e inténtalo nuevamente.',
        );
      },
    });
  }

  protected setActive(category: TicketCategory, active: boolean): void {
    this.error.set('');
    this.notice.set('');
    const payload: CategoryPayload = {
      name: category.name,
      code: category.code,
      description: category.description,
      active,
    };
    this.api.update(category.id, payload).subscribe({
      next: () => {
        this.notice.set(
          active
            ? 'Categoría activada.'
            : 'Categoría desactivada. Las incidencias existentes conservan su categoría.',
        );
        this.loadCategories();
      },
      error: () => this.error.set('No se pudo cambiar el estado de la categoría.'),
    });
  }

  protected deactivate(category: TicketCategory): void {
    if (
      !window.confirm(
        `¿Desactivar la categoría «${category.name}»? Dejará de estar disponible para nuevas incidencias.`,
      )
    )
      return;
    this.api.deactivate(category.id).subscribe({
      next: () => {
        this.notice.set(
          'Categoría desactivada. Las incidencias existentes conservan su categoría.',
        );
        this.loadCategories();
      },
      error: () => this.error.set('No se pudo desactivar la categoría.'),
    });
  }
}
