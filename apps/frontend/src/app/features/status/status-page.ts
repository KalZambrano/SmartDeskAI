import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HealthStatus } from '@/core/models/health.model';
import { HealthService } from '@/core/services/health.service';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-status-page',
  imports: [DatePipe],
  templateUrl: './status-page.html',
})
export class StatusPage implements OnInit {
  private readonly healthService = inject(HealthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loadState = signal<LoadState>('loading');
  protected readonly health = signal<HealthStatus | null>(null);

  ngOnInit(): void {
    this.loadHealth();
  }

  protected loadHealth(): void {
    this.loadState.set('loading');
    this.healthService
      .getHealth()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (health) => {
          this.health.set(health);
          this.loadState.set('success');
        },
        error: () => this.loadState.set('error'),
      });
  }
}
