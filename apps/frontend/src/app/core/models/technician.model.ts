export interface TechnicianOption {
  id: number;
  fullName: string;
  email: string;
  role: 'TECHNICIAN';
  active: boolean;
}

export interface CreateTechnicianRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'TECHNICIAN';
}

export interface TechnicianSpecialty {
  categoryId: number;
  categoryName: string;
}
