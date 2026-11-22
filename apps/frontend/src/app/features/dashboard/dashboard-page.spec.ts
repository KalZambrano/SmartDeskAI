import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { DashboardPage } from './dashboard-page';

// jsdom no implementa el contexto 2D de canvas; solo verificamos que p-chart se monte.
vi.mock('chart.js/auto', () => ({
  default: class {
    destroy(): void {
      return undefined;
    }
    update(): void {
      return undefined;
    }
  },
}));

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let httpMock: HttpTestingController;
  let root: HTMLElement;

  beforeEach(async () => {
    localStorage.setItem(
      'smartdesk.user',
      JSON.stringify({ id: 1, fullName: 'Admin', email: 'admin@smartdesk.pe', role: 'ADMIN' }),
    );
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    httpMock = TestBed.inject(HttpTestingController);
    root = fixture.nativeElement;
    fixture.detectChanges();

    httpMock.expectOne('/api/v1/categories').flush([]);
    httpMock.expectOne('/api/v1/dashboard/summary').flush({
      total: 5,
      open: 3,
      inProgress: 1,
      pending: 1,
      resolved: 0,
      closed: 0,
      overdue: 0,
      averageResolutionHours: 0,
      byPriority: { HIGH: 3, MEDIUM: 2 },
      byCategory: { Redes: 5 },
      workload: [
        { technician: 'Sin asignar', activeTickets: 3 },
        { technician: 'Ana Torres', activeTickets: 2 },
      ],
      timeline: [
        { date: '2026-11-20', created: 3, resolved: 1 },
        { date: '2026-11-21', created: 2, resolved: 0 },
      ],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('smartdesk.user');
  });

  it('muestra el KPI de sin asignar con su enlace', () => {
    expect(root.textContent).toContain('Incidencias sin técnico asignado');
    expect(root.textContent).toContain('Ver Incidencias');

    const card = root.querySelector('[aria-labelledby="unassigned-title"]');
    expect(card?.textContent).toContain('3');
    expect(card?.querySelector('a')?.getAttribute('href')).toBe('/incidencias');
  });

  it('renderiza los cuatro gráficos y permite cambiar a la tabla de la serie temporal', () => {
    expect(root.querySelectorAll('canvas')).toHaveLength(4);
    expect(root.textContent).toContain('Carga de trabajo por técnico');

    const toggle = root.querySelector<HTMLButtonElement>('button[aria-pressed]')!;
    toggle.click();
    fixture.detectChanges();

    expect(root.querySelectorAll('canvas')).toHaveLength(0);
    expect(root.textContent).toContain('2026-11-20');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });
});
