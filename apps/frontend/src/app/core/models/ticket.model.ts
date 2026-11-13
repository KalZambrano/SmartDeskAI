export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TicketSummary {
  id: number;
  ticketCode: string;
  title: string;
  description: string;
  categoryName: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  requesterName: string;
  assignedTechnicianName: string | null;
  createdAt: string;
  dueAt: string;
}

export interface TicketComment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface TicketHistory {
  id: number;
  eventType: string;
  description: string;
  createdAt: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  categoryId?: number;
}
