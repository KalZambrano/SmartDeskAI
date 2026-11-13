import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('redirige al inicio de sesión sin sesión activa y muestra la navegación principal', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/');
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    expect(router.url).toBe('/login');
    expect(root.querySelector('nav[aria-label="Navegación principal"]')).not.toBeNull();
    expect(root.querySelector('h1')?.textContent).toContain('Iniciar sesión');
  });
});
