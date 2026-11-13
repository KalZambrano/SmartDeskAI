import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  template:
    '<main class="grid min-h-screen place-items-center bg-canvas px-4"><section class="w-full max-w-md rounded-xl border border-line bg-white p-8 shadow-sm"><p class="text-sm font-semibold text-brand-700">SMARTDESK AI</p><h1 class="mt-2 text-2xl font-semibold">Iniciar sesión</h1><form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()"><label class="block text-sm font-medium">Correo<input class="mt-1 w-full rounded-md border border-line px-3 py-2" type="email" formControlName="email" autocomplete="username"></label><label class="block text-sm font-medium">Contraseña<input class="mt-1 w-full rounded-md border border-line px-3 py-2" type="password" formControlName="password" autocomplete="current-password"></label>@if (error()) { <p role="alert" class="text-sm text-danger-700">{{ error() }}</p> }<button class="w-full rounded-md bg-brand-600 px-4 py-2 font-medium text-white disabled:opacity-50" [disabled]="form.invalid || loading()">{{ loading() ? "Ingresando…" : "Ingresar" }}</button></form></section></main>',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.login(this.form.controls.email.value, this.form.controls.password.value).subscribe({
      next: () => void this.router.navigateByUrl('/incidencias'),
      error: () => {
        this.error.set('Credenciales inválidas o API no disponible.');
        this.loading.set(false);
      },
    });
  }
}
