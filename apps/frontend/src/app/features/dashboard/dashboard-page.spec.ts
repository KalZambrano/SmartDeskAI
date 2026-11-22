import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardPage } from './dashboard-page';

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
      byPriority: {},
      byCategory: {},
      workload: [
        { technician: 'Sin asignar', activeTickets: 3 },
        { technician: 'Ana Torres', activeTickets: 2 },
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

  it('muestra el KPI de sin asignar con su enlace y sin la tabla de carga de trabajo', () => {
    expect(root.textContent).toContain('Incidencias sin técnico asignado');
    expect(root.textContent).toContain('Ver Incidencias');
    expect(root.textContent).not.toContain('Carga de trabajo por técnico');

    const card = root.querySelector('[aria-labelledby="unassigned-title"]');
    expect(card?.textContent).toContain('3');
    expect(card?.querySelector('a')?.getAttribute('href')).toBe('/incidencias');
  });
});
