import { UserRole } from '@/core/models/auth.model';

export interface ManagedUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  role: UserRole;
}
