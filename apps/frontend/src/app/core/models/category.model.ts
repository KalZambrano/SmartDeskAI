export interface TicketCategory {
  id: number;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
}

export type CategoryPayload = Pick<TicketCategory, 'name' | 'code' | 'description'> & {
  active?: boolean;
};
