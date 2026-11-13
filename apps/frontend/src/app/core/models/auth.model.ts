export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'REQUESTER';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
