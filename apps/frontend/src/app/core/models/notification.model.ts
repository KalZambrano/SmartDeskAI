export interface AppNotification {
  id: number;
  ticketId: number | null;
  ticketCode: string | null;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface UnreadCount {
  count: number;
}
