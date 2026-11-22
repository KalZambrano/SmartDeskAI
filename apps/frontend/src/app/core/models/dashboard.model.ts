import { TicketPriority, TicketStatus } from '@/core/models/ticket.model';

export interface WorkloadItem {
  technician: string;
  activeTickets: number;
}

export interface DashboardSummary {
  total: number;
  open: number;
  inProgress: number;
  pending: number;
  resolved: number;
  closed: number;
  overdue: number;
  averageResolutionHours: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  workload: WorkloadItem[];
}

export interface DashboardFilters {
  from?: string;
  to?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: number;
}
