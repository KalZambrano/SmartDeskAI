import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '@/core/config/api.config';
import { TechnicianOption } from '@/core/models/technician.model';

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
    return this.http
      .get<UserRecord[]>(this.apiBaseUrl + '/users')
      .pipe(
        map((users) =>
          users.filter(
            (user): user is UserRecord & { role: 'TECHNICIAN' } =>
              user.role === 'TECHNICIAN' && user.active,
          ),
        ),
      );
  }
}
