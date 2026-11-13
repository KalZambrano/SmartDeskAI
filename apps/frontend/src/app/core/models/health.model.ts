export type HealthState = 'UP' | 'DOWN';

export interface HealthStatus {
  status: HealthState;
  application: string;
  timestamp: string;
}
