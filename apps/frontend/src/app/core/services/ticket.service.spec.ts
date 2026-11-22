import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TicketPage } from '@/core/models/ticket.model';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let service: TicketService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TicketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('envía page y size junto con los filtros al listar', () => {
    const expected: TicketPage = {
      content: [],
      page: 2,
      size: 20,
      totalElements: 45,
      totalPages: 3,
      first: false,
      last: false,
    };
    let received: TicketPage | undefined;

    service.list({ status: 'OPEN', page: 2, size: 20 }).subscribe((page) => (received = page));

    const request = httpMock.expectOne((candidate) => candidate.url === '/api/v1/tickets');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('20');
    expect(request.request.params.get('status')).toBe('OPEN');
    request.flush(expected);
    expect(received).toEqual(expected);
  });
});
