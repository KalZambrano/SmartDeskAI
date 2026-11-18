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
  aiSuggestedCategoryName?: string | null;
  aiSuggestedPriority?: TicketPriority | null;
  aiSummary?: string | null;
  aiSuggestedResponse?: string | null;
  aiReason?: string | null;
  aiClassificationSource?: 'AI' | 'RULES' | 'NONE' | null;
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

export interface TicketFilters {
  q?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: number;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  categoryId?: number | null;
}
