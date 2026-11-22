import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@/core/config/api.config';
import { CreateUserRequest, ManagedUser, UpdateUserRequest } from '@/core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL) + '/users';

  list(): Observable<ManagedUser[]> {
    return this.http.get<ManagedUser[]>(this.api);
  }

  create(request: CreateUserRequest): Observable<ManagedUser> {
    return this.http.post<ManagedUser>(this.api, request);
  }

  update(id: number, request: UpdateUserRequest): Observable<ManagedUser> {
    return this.http.put<ManagedUser>(`${this.api}/${id}`, request);
  }

  setActive(id: number, active: boolean): Observable<ManagedUser> {
    return this.http.patch<ManagedUser>(`${this.api}/${id}/active`, { active });
  }
}
