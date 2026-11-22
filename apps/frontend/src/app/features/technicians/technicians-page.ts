import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideCheck,
  LucideCopy,
  LucideEye,
  LucidePlus,
  LucidePower,
  LucideRefreshCw,
  LucideRotateCcw,
  LucideX,
} from '@lucide/angular';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { CategoryService } from '@/core/services/category.service';
import { TechnicianService } from '@/core/services/technician.service';
import { TicketCategory } from '@/core/models/category.model';
import { TechnicianOption } from '@/core/models/technician.model';
import { generateTemporaryPassword } from '@/core/utils/password';

interface NewTechnicianCredential {
  fullName: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-technicians-page',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    MultiSelectModule,
    LucideCheck,
    LucideCopy,
    LucideEye,
    LucidePlus,
    LucidePower,
    LucideRefreshCw,
    LucideRotateCcw,
    LucideX,
  ],
  templateUrl: './technicians-page.html',
})
export class TechniciansPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly techniciansApi = inject(TechnicianService);
  private readonly categoriesApi = inject(CategoryService);
  private copyTimer: number | undefined;

  protected readonly technicians = signal<TechnicianOption[]>([]);
  protected readonly categories = signal<TicketCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly modalOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly password = signal('');
  protected readonly passwordError = signal('');
  protected readonly categoryError = signal('');
  protected readonly copyStatus = signal('');
  protected readonly credential = signal<NewTechnicianCredential | null>(null);
  protected readonly detailModalOpen = signal(false);
  protected readonly selectedTechnician = signal<TechnicianOption | null>(null);
  protected readonly selectedSpecialties = signal<string[]>([]);
  protected readonly detailLoading = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    categoryIds: this.fb.nonNullable.control<number[]>([]),
  });

  ngOnInit(): void {
    this.loadTechnicians();
    this.categoriesApi.listActive().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categoryError.set('No se pudieron cargar las categorías de especialidad.'),
    });
  }

  ngOnDestroy(): void {
    if (this.copyTimer !== undefined) window.clearTimeout(this.copyTimer);
  }

  protected loadTechnicians(): void {
    this.loading.set(true);
    this.error.set('');
    this.techniciansApi.listAll().subscribe({
      next: (technicians) => this.technicians.set(technicians),
      error: () => {
        this.error.set(
          'No se pudieron cargar los técnicos. Verifica tu sesión e inténtalo de nuevo.',
        );
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  protected create(): void {
    this.form.reset({ fullName: '', email: '', categoryIds: [] });
    this.error.set('');
    this.passwordError.set('');
    this.categoryError.set('');
    this.copyStatus.set('');
    this.modalOpen.set(true);
    this.generatePassword();
  }

  protected closeModal(): void {
    if (this.saving()) return;
    this.modalOpen.set(false);
    this.form.reset({ fullName: '', email: '', categoryIds: [] });
    this.password.set('');
    this.error.set('');
    this.passwordError.set('');
  }

  /** Cierra el diálogo solo cuando el clic cae en el fondo y no dentro del panel. */
  protected dismissOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModal();
  }

  protected generatePassword(): void {
    try {
      this.password.set(generateTemporaryPassword());
      this.passwordError.set('');
      this.copyStatus.set('');
    } catch {
      this.password.set('');
      this.passwordError.set(
        'El navegador no pudo generar una contraseña segura. Inténtalo de nuevo.',
      );
    }
  }

  protected async copyPassword(value: string): Promise<void> {
    if (this.copyTimer !== undefined) window.clearTimeout(this.copyTimer);
    this.copyStatus.set('');
    try {
      await navigator.clipboard.writeText(value);
      this.copyStatus.set('Contraseña copiada al portapapeles.');
    } catch {
      this.copyStatus.set('No se pudo copiar. Selecciona la contraseña y cópiala manualmente.');
    }
    this.copyTimer = window.setTimeout(() => this.copyStatus.set(''), 2500);
  }

  protected save(): void {
    this.form.markAllAsTouched();
    this.error.set('');
    if (this.form.invalid) {
      this.error.set('Revisa el nombre y el correo electrónico del técnico.');
      return;
    }
    if (!this.password()) {
      this.passwordError.set('Genera una contraseña antes de crear el técnico.');
      return;
    }
    if (this.saving()) return;

    this.saving.set(true);
    const values = this.form.getRawValue();
    this.techniciansApi
      .create({
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: this.password(),
        role: 'TECHNICIAN',
      })
      .subscribe({
        next: (technician) => {
          const credential = {
            fullName: technician.fullName,
            email: technician.email,
            password: this.password(),
          };
          const categoryIds = values.categoryIds;
          this.modalOpen.set(false);
          this.credential.set(credential);
          this.form.reset({ fullName: '', email: '', categoryIds: [] });
          this.password.set('');
          this.saving.set(false);
          this.loadTechnicians();

          if (categoryIds.length) {
            this.techniciansApi.replaceSpecialties(technician.id, categoryIds).subscribe({
              next: () => this.notice.set('Técnico creado y especialidades configuradas.'),
              error: () =>
                this.notice.set(
                  'Técnico creado. No se pudieron guardar sus especialidades; puedes configurarlas luego desde el administrador.',
                ),
            });
          } else {
            this.notice.set(
              'Técnico creado. Sin especialidades, no recibirá asignaciones automáticas por categoría.',
            );
          }
        },
        error: (response: { status?: number }) => {
          this.saving.set(false);
          this.error.set(
            response.status === 409
              ? 'Ya existe un usuario con ese correo electrónico.'
              : 'No se pudo crear el técnico. Verifica los datos e inténtalo de nuevo.',
          );
        },
      });
  }

  protected hideCredential(): void {
    this.credential.set(null);
    this.notice.set('');
    this.copyStatus.set('');
  }

  protected openDetails(technician: TechnicianOption): void {
    this.selectedTechnician.set(technician);
    this.selectedSpecialties.set([]);
    this.detailLoading.set(true);
    this.detailModalOpen.set(true);
    this.error.set('');
    this.techniciansApi.getSpecialties(technician.id).subscribe({
      next: (specialties) =>
        this.selectedSpecialties.set(specialties.map((specialty) => specialty.categoryName)),
      error: () => this.error.set('No se pudieron cargar las especialidades del técnico.'),
      complete: () => this.detailLoading.set(false),
    });
  }

  protected closeDetails(): void {
    this.detailModalOpen.set(false);
    this.selectedTechnician.set(null);
    this.selectedSpecialties.set([]);
    this.detailLoading.set(false);
  }

  protected dismissDetailsOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeDetails();
  }

  protected setActive(technician: TechnicianOption, active: boolean): void {
    if (
      !active &&
      !window.confirm(
        `¿Desactivar al técnico «${technician.fullName}»? Dejará de recibir nuevas asignaciones.`,
      )
    )
      return;
    this.error.set('');
    this.notice.set('');
    this.techniciansApi.setActive(technician.id, active).subscribe({
      next: () => {
        this.notice.set(
          active
            ? 'Técnico activado.'
            : 'Técnico desactivado. Las asignaciones existentes se conservan.',
        );
        this.loadTechnicians();
      },
      error: () =>
        this.error.set('No se pudo cambiar el estado del técnico. Inténtalo nuevamente.'),
    });
  }
}
