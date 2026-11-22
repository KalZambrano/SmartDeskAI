import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TechniciansPage } from './technicians-page';

describe('TechniciansPage', () => {
  let fixture: ComponentFixture<TechniciansPage>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechniciansPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TechniciansPage);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne('/api/v1/users').flush([
      {
        id: 7,
        fullName: 'Ana Torres',
        email: 'ana@smartdesk.pe',
        role: 'TECHNICIAN',
        active: true,
      },
    ]);
    httpMock.expectOne('/api/v1/categories').flush([]);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('abre el alta de técnicos en un diálogo modal', () => {
    const root: HTMLElement = fixture.nativeElement;
    root.querySelector<HTMLButtonElement>('header button')!.click();
    fixture.detectChanges();

    expect(root.querySelector('[role="dialog"]')).not.toBeNull();
    expect(root.querySelector('#technician-name')).not.toBeNull();
  });

  it('cierra el diálogo al hacer clic en el fondo', () => {
    const root: HTMLElement = fixture.nativeElement;
    root.querySelector<HTMLButtonElement>('header button')!.click();
    fixture.detectChanges();

    root.querySelector<HTMLElement>('[role="presentation"]')!.click();
    fixture.detectChanges();

    expect(root.querySelector('[role="dialog"]')).toBeNull();
  });

  it('muestra los detalles de un técnico desde la columna acciones', () => {
    const root: HTMLElement = fixture.nativeElement;
    const detailButton = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Ver detalles de Ana Torres"]',
    )!;
    detailButton.click();
    fixture.detectChanges();

    const specialtiesRequest = httpMock.expectOne('/api/v1/users/7/specialties');
    specialtiesRequest.flush([{ categoryId: 1, categoryName: 'Hardware' }]);
    fixture.detectChanges();

    expect(root.querySelector('[aria-labelledby="technician-detail-title"]')).not.toBeNull();
    expect(root.textContent).toContain('ana@smartdesk.pe');
    expect(root.textContent).toContain('Hardware');
  });

  it('desactiva un técnico desde su acción de estado', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const root: HTMLElement = fixture.nativeElement;
    const deactivateButton = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Desactivar técnico Ana Torres"]',
    )!;
    deactivateButton.click();
    fixture.detectChanges();

    const activeRequest = httpMock.expectOne('/api/v1/users/7/active');
    expect(activeRequest.request.method).toBe('PATCH');
    expect(activeRequest.request.body).toEqual({ active: false });
    activeRequest.flush({
      id: 7,
      fullName: 'Ana Torres',
      email: 'ana@smartdesk.pe',
      role: 'TECHNICIAN',
      active: false,
    });
    httpMock.expectOne('/api/v1/users').flush([
      {
        id: 7,
        fullName: 'Ana Torres',
        email: 'ana@smartdesk.pe',
        role: 'TECHNICIAN',
        active: false,
      },
    ]);
  });
});
