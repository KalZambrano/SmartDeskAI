import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideCheck,
  LucideCopy,
  LucidePencil,
  LucidePlus,
  LucidePower,
  LucideRotateCcw,
  LucideX,
} from '@lucide/angular';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { UserRole } from '@/core/models/auth.model';
import { ManagedUser } from '@/core/models/user.model';
import { UserService } from '@/core/services/user.service';
import { generateTemporaryPassword } from '@/core/utils/password';

interface TemporaryCredential {
  fullName: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-users-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    LucideCheck,
    LucideCopy,
    LucidePencil,
    LucidePlus,
    LucidePower,
    LucideRotateCcw,
    LucideX,
  ],
  templateUrl: './users-page.html',
})
export class UsersPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly usersApi = inject(UserService);
  private copyTimer: number | undefined;

  protected readonly users = signal<ManagedUser[]>([]);
  protected readonly loading = signal(true);
  protected readonly modalOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly password = signal('');
  protected readonly passwordError = signal('');
  protected readonly copyStatus = signal('');
  protected readonly credential = signal<TemporaryCredential | null>(null);
  protected readonly roleFilter = signal<UserRole | ''>('');
  protected readonly activeFilter = signal<'' | 'active' | 'inactive'>('');
  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    role: this.fb.nonNullable.control<UserRole>('REQUESTER', [Validators.required]),
  });

  protected readonly roleOptions: { label: string; value: UserRole | '' }[] = [
    { label: 'Todos los roles', value: '' },
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Técnico', value: 'TECHNICIAN' },
    { label: 'Solicitante', value: 'REQUESTER' },
  ];
  protected readonly activeOptions: { label: string; value: '' | 'active' | 'inactive' }[] = [
    { label: 'Todos los estados', value: '' },
    { label: 'Activos', value: 'active' },
    { label: 'Inactivos', value: 'inactive' },
  ];
  protected readonly formRoleOptions: { label: string; value: UserRole }[] = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Técnico', value: 'TECHNICIAN' },
    { label: 'Solicitante', value: 'REQUESTER' },
  ];

  protected readonly filteredUsers = computed(() => {
    const role = this.roleFilter();
    const active = this.activeFilter();
    return this.users().filter(
      (user) =>
        (!role || user.role === role) && (active === '' || user.active === (active === 'active')),
    );
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    if (this.copyTimer !== undefined) window.clearTimeout(this.copyTimer);
  }

  protected roleLabel(role: UserRole): string {
    return { ADMIN: 'Administrador', TECHNICIAN: 'Técnico', REQUESTER: 'Solicitante' }[role];
  }

  protected loadUsers(): void {
    this.loading.set(true);
    this.error.set('');
    this.usersApi.list().subscribe({
      next: (users) => this.users.set(users),
      error: () => {
        this.error.set(
          'No se pudieron cargar los usuarios. Verifica tu sesión e inténtalo de nuevo.',
        );
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  protected create(): void {
    this.editingId.set(null);
    this.form.reset({ fullName: '', email: '', role: 'REQUESTER' });
    this.error.set('');
    this.passwordError.set('');
    this.copyStatus.set('');
    this.modalOpen.set(true);
    this.generatePassword();
  }

  protected edit(user: ManagedUser): void {
    this.editingId.set(user.id);
    this.form.setValue({ fullName: user.fullName, email: user.email, role: user.role });
    this.error.set('');
    this.password.set('');
    this.passwordError.set('');
    this.copyStatus.set('');
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    if (this.saving()) return;
    this.modalOpen.set(false);
    this.editingId.set(null);
    this.password.set('');
    this.error.set('');
  }

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
      this.error.set('Revisa el nombre, el correo electrónico y el rol.');
      return;
    }
    const editingId = this.editingId();
    if (editingId === null && !this.password()) {
      this.passwordError.set('Genera una contraseña antes de crear el usuario.');
      return;
    }
    if (this.saving()) return;

    const values = this.form.getRawValue();
    const data = {
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
    };
    const request$ =
      editingId === null
        ? this.usersApi.create({ ...data, password: this.password() })
        : this.usersApi.update(editingId, data);

    this.saving.set(true);
    request$.subscribe({
      next: (user) => {
        if (editingId === null) {
          this.credential.set({
            fullName: user.fullName,
            email: user.email,
            password: this.password(),
          });
        } else {
          this.notice.set('Usuario actualizado.');
        }
        this.modalOpen.set(false);
        this.editingId.set(null);
        this.form.reset({ fullName: '', email: '', role: 'REQUESTER' });
        this.password.set('');
        this.saving.set(false);
        this.loadUsers();
      },
      error: (response: { status?: number }) => {
        this.saving.set(false);
        this.error.set(
          response.status === 409
            ? 'Ya existe un usuario con ese correo electrónico.'
            : `No se pudo ${editingId === null ? 'crear' : 'actualizar'} el usuario. Verifica los datos e inténtalo de nuevo.`,
        );
      },
    });
  }

  protected hideCredential(): void {
    this.credential.set(null);
    this.notice.set('');
    this.copyStatus.set('');
  }

  protected setActive(user: ManagedUser, active: boolean): void {
    if (!active && !window.confirm(`¿Desactivar a «${user.fullName}»? No podrá iniciar sesión.`))
      return;
    this.error.set('');
    this.notice.set('');
    this.usersApi.setActive(user.id, active).subscribe({
      next: () => {
        this.notice.set(active ? 'Usuario activado.' : 'Usuario desactivado.');
        this.loadUsers();
      },
      error: () =>
        this.error.set('No se pudo cambiar el estado del usuario. Inténtalo nuevamente.'),
    });
  }
}
