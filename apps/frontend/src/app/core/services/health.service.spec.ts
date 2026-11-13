import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(HealthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('consulta GET /api/v1/health', () => {
    const expected = {
      status: 'UP',
      application: 'smartdesk-ai',
      timestamp: '2026-11-12T10:00:00Z',
    };
    let received: unknown;

    service.getHealth().subscribe((health) => (received = health));

    const request = httpMock.expectOne('/api/v1/health');
    expect(request.request.method).toBe('GET');
    request.flush(expected);
    expect(received).toEqual(expected);
  });
});
