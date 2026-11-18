import { Component, computed, input } from '@angular/core';
import { TicketStatus } from '@/core/models/ticket.model';

@Component({
  selector: 'app-status-indicator',
  templateUrl: './status-indicator.html',
})
export class StatusIndicator {
  protected readonly status = input.required<TicketStatus>();

  protected readonly label = computed(
    () =>
      ({
        OPEN: 'Abierta',
        PENDING: 'Pendiente',
        IN_PROGRESS: 'En atención',
        RESOLVED: 'Resuelta',
        CLOSED: 'Cerrada',
      })[this.status()],
  );

  protected readonly ariaLabel = computed(() => 'Estado: ' + this.label().toLowerCase());
  protected readonly isResolved = computed(() => this.status() === 'RESOLVED');
  protected readonly isClosed = computed(() => this.status() === 'CLOSED');
  protected readonly isInProgress = computed(() => this.status() === 'IN_PROGRESS');
  protected readonly isPending = computed(() => this.status() === 'PENDING');
}
