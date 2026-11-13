import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '@/core/config/api.config';
import { AuthUser, LoginResponse } from '@/core/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly tokenKey = 'smartdesk.token';
  private readonly userState = signal<AuthUser | null>(this.readUser());
  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiBaseUrl + '/auth/login', { email, password }).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.token);
        this.userState.set(response.user);
        localStorage.setItem('smartdesk.user', JSON.stringify(response.user));
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('smartdesk.user');
    this.userState.set(null);
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private readUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem('smartdesk.user');
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      localStorage.removeItem('smartdesk.user');
      return null;
    }
  }
}
