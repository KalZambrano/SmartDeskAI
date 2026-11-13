import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StatusPage } from './status-page';

describe('StatusPage', () => {
  let fixture: ComponentFixture<StatusPage>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusPage);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('muestra el estado de carga inicial', () => {
    httpMock.expectOne('/api/v1/health');
    expect(fixture.nativeElement.textContent).toContain('Consultando el estado de la API');
  });

  it('muestra el estado operativo cuando la API responde', async () => {
    httpMock
      .expectOne('/api/v1/health')
      .flush({ status: 'UP', application: 'smartdesk-ai', timestamp: '2026-11-12T10:00:00Z' });
    await fixture.whenStable();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Operativo');
    expect(text).toContain('smartdesk-ai');
  });

  it('muestra un error con opción de reintento cuando la API falla', async () => {
    httpMock.expectOne('/api/v1/health').flush(null, { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="alert"]')).not.toBeNull();

    root.querySelector('button')?.click();
    httpMock.expectOne('/api/v1/health');
  });
});
