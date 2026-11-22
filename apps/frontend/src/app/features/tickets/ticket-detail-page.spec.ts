import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TicketDetailPage } from './ticket-detail-page';

describe('TicketDetailPage', () => {
  let fixture: ComponentFixture<TicketDetailPage>;
  let httpMock: HttpTestingController;
  let root: HTMLElement;

  const ticket = {
    id: 5,
    ticketCode: 'TKT-5',
    title: 'Sin internet',
    description: 'No conecta',
    categoryName: null,
    priority: 'MEDIUM',
    status: 'OPEN',
    requesterName: 'Cliente',
    assignedTechnicianName: 'Ana Torres',
    createdAt: '2026-01-01T00:00:00Z',
    dueAt: '2026-01-02T00:00:00Z',
  };

  const technicians = [
    { id: 7, fullName: 'Ana Torres', email: 'ana@smartdesk.pe', role: 'TECHNICIAN', active: true },
    { id: 8, fullName: 'Luis Paz', email: 'luis@smartdesk.pe', role: 'TECHNICIAN', active: true },
  ];

  beforeEach(async () => {
    localStorage.setItem(
      'smartdesk.user',
      JSON.stringify({ id: 1, fullName: 'Admin', email: 'admin@smartdesk.pe', role: 'ADMIN' }),
    );
    await TestBed.configureTestingModule({
      imports: [TicketDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '5' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketDetailPage);
    httpMock = TestBed.inject(HttpTestingController);
    root = fixture.nativeElement;
    fixture.detectChanges();

    httpMock.expectOne('/api/v1/tickets/5').flush(ticket);
    httpMock.expectOne('/api/v1/tickets/5/comments').flush([]);
    httpMock.expectOne('/api/v1/tickets/5/history').flush([]);
    httpMock.expectOne('/api/v1/users').flush(technicians);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('smartdesk.user');
  });

  it('muestra un único selector de técnico con el actual ya preseleccionado', () => {
    expect(root.querySelectorAll('p-select[inputid="technician-assignment"]').length).toBe(1);
    expect(root.textContent).toContain('Ana Torres');
    expect(root.textContent).not.toContain('Asignar técnico');
  });

  it('asigna al cambiar el selector y revierte la selección si falla', async () => {
    const page = fixture.componentInstance as unknown as {
      assignTechnician: (id: number | null) => void;
    };

    page.assignTechnician(8);
    const request = httpMock.expectOne('/api/v1/tickets/5/assignment');
    expect(request.request.body).toEqual({ technicianId: 8 });
    request.flush({ ...ticket, assignedTechnicianName: 'Luis Paz' });
    httpMock.expectOne('/api/v1/tickets/5/comments').flush([]);
    httpMock.expectOne('/api/v1/tickets/5/history').flush([]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root.textContent).toContain('Técnico asignado correctamente.');
    expect(root.textContent).toContain('Luis Paz');

    page.assignTechnician(7);
    httpMock
      .expectOne('/api/v1/tickets/5/assignment')
      .flush('error', { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root.textContent).toContain('No se pudo asignar el técnico');
    expect(root.textContent).toContain('Luis Paz');
  });
});
