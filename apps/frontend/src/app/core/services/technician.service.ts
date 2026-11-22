import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '@/core/config/api.config';
import {
  CreateTechnicianRequest,
  TechnicianOption,
  TechnicianSpecialty,
} from '@/core/models/technician.model';

interface UserRecord {
  id: number;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class TechnicianService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listActive(): Observable<TechnicianOption[]> {
    return this.listAll().pipe(map((users) => users.filter((user) => user.active)));
  }

  listAll(): Observable<TechnicianOption[]> {
    return this.http
      .get<UserRecord[]>(this.apiBaseUrl + '/users')
      .pipe(
        map((users) =>
          users
            .filter(
              (user): user is UserRecord & { role: 'TECHNICIAN' } => user.role === 'TECHNICIAN',
            )
            .map((user) => ({ ...user, role: 'TECHNICIAN' as const })),
        ),
      );
  }

  create(request: CreateTechnicianRequest): Observable<TechnicianOption> {
    return this.http.post<TechnicianOption>(this.apiBaseUrl + '/users', request);
  }

  replaceSpecialties(
    technicianId: number,
    categoryIds: number[],
  ): Observable<TechnicianSpecialty[]> {
    return this.http.put<TechnicianSpecialty[]>(
      `${this.apiBaseUrl}/users/${technicianId}/specialties`,
      { categoryIds },
    );
  }

  getSpecialties(technicianId: number): Observable<TechnicianSpecialty[]> {
    return this.http.get<TechnicianSpecialty[]>(
      `${this.apiBaseUrl}/users/${technicianId}/specialties`,
    );
  }

  setActive(technicianId: number, active: boolean): Observable<TechnicianOption> {
    return this.http.patch<TechnicianOption>(`${this.apiBaseUrl}/users/${technicianId}/active`, {
      active,
    });
  }
}
