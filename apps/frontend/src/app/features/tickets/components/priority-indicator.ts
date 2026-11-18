import { Component, computed, input } from '@angular/core';
import { TicketPriority } from '@/core/models/ticket.model';

@Component({
  selector: 'app-priority-indicator',
  templateUrl: './priority-indicator.html',
})
export class PriorityIndicator {
  protected readonly priority = input.required<TicketPriority>();

  protected readonly label = computed(
    () =>
      ({
        LOW: 'Baja',
        MEDIUM: 'Media',
        HIGH: 'Alta',
        CRITICAL: 'Crítica',
      })[this.priority()],
  );

  protected readonly ariaLabel = computed(() => 'Prioridad ' + this.label().toLowerCase());
  protected readonly filledBars = computed(() => {
    switch (this.priority()) {
      case 'LOW':
        return 1;
      case 'MEDIUM':
        return 2;
      case 'HIGH':
      case 'CRITICAL':
        return 3;
    }
  });

  protected readonly isHigh = computed(() => this.priority() === 'HIGH');
  protected readonly isCritical = computed(() => this.priority() === 'CRITICAL');
}
