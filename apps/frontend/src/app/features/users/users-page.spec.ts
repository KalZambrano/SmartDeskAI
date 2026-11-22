import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { UsersPage } from './users-page';

describe('UsersPage', () => {
  let fixture: ComponentFixture<UsersPage>;
  let httpMock: HttpTestingController;
  let root: HTMLElement;

  const users = [
    {
      id: 1,
      fullName: 'Admin Principal',
      email: 'admin@smartdesk.local',
      role: 'ADMIN',
      active: true,
    },
    { id: 7, fullName: 'Ana Torres', email: 'ana@smartdesk.pe', role: 'TECHNICIAN', active: true },
    {
      id: 9,
      fullName: 'Luis Pérez',
      email: 'luis@smartdesk.pe',
      role: 'REQUESTER',
      active: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersPage);
    httpMock = TestBed.inject(HttpTestingController);
    root = fixture.nativeElement;
    fixture.detectChanges();
    httpMock.expectOne('/api/v1/users').flush(users);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('lista cuentas de los tres roles', () => {
    expect(root.textContent).toContain('Administrador');
    expect(root.textContent).toContain('Técnico');
    expect(root.textContent).toContain('Solicitante');
    expect(root.textContent).toContain('Ana Torres');
  });

  it('edita nombre y correo mediante PUT', () => {
    root.querySelector<HTMLButtonElement>('button[aria-label="Editar a Ana Torres"]')!.click();
    fixture.detectChanges();

    const name = root.querySelector<HTMLInputElement>('#user-name')!;
    name.value = 'Ana Torres V2';
    name.dispatchEvent(new Event('input'));
    const email = root.querySelector<HTMLInputElement>('#user-email')!;
    email.value = 'ana2@smartdesk.pe';
    email.dispatchEvent(new Event('input'));
    root.querySelector<HTMLButtonElement>('form button[type="submit"]')!.click();
    fixture.detectChanges();

    const request = httpMock.expectOne('/api/v1/users/7');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      fullName: 'Ana Torres V2',
      email: 'ana2@smartdesk.pe',
      role: 'TECHNICIAN',
    });
    request.flush({ ...users[1], fullName: 'Ana Torres V2', email: 'ana2@smartdesk.pe' });
    httpMock.expectOne('/api/v1/users').flush(users);
  });

  it('crea un usuario con contraseña temporal', () => {
    root.querySelector<HTMLButtonElement>('header button')!.click();
    fixture.detectChanges();

    const name = root.querySelector<HTMLInputElement>('#user-name')!;
    name.value = 'Nueva Solicitante';
    name.dispatchEvent(new Event('input'));
    const email = root.querySelector<HTMLInputElement>('#user-email')!;
    email.value = 'nueva@smartdesk.pe';
    email.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    root.querySelector<HTMLButtonElement>('form button[type="submit"]')!.click();
    fixture.detectChanges();

    const request = httpMock.expectOne('/api/v1/users');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toMatchObject({
      fullName: 'Nueva Solicitante',
      email: 'nueva@smartdesk.pe',
      role: 'REQUESTER',
    });
    expect(request.request.body.password).toHaveLength(20);
    request.flush({
      id: 10,
      fullName: 'Nueva Solicitante',
      email: 'nueva@smartdesk.pe',
      role: 'REQUESTER',
      active: true,
    });
    httpMock.expectOne('/api/v1/users').flush(users);
    fixture.detectChanges();

    expect(root.querySelector('[aria-labelledby="user-credential-title"]')).not.toBeNull();
  });

  it('desactiva un usuario previa confirmación', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    root
      .querySelector<HTMLButtonElement>('button[aria-label="Desactivar a Admin Principal"]')!
      .click();

    const request = httpMock.expectOne('/api/v1/users/1/active');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ active: false });
    request.flush({ ...users[0], active: false });
    httpMock.expectOne('/api/v1/users').flush(users);
  });
});
